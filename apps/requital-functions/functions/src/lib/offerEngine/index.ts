import { Expo } from 'expo-server-sdk';
import { firestore } from 'firebase-admin';
import * as functions from 'firebase-functions';
import { PlaidApi, Transaction } from 'plaid';
import { ActivatedOfferConverter, BusinessConverter, OfferConverter, RedeemedOfferConverter, UserConverter } from 'requital-converter';

export const processTransactions = async (itemId: string, client: PlaidApi): Promise<Transaction[]> => {
  const db = firestore();
  const added: Transaction[] = [];

  try {
    functions.logger.debug('Processing transactions for item: ' + itemId);

    const users = await db.collection('users').withConverter(UserConverter).where('itemID', '==', itemId).get();

    if (users.docs.length === 0) {
      functions.logger.error('No users found for item: ' + itemId);

      throw new Error('No users found for item: ' + itemId);
    }

    const [user, userId] = [users.docs[0].data(), users.docs[0].id];

    let cursor = user.cursor || '';

    const initialCall = cursor === '';

    let hasMore = true;
    let atLeastOneOfferFound = false;

    while (hasMore) {
      if (!user.accessToken) {
        functions.logger.error('No access token found for item: ' + itemId);

        throw new Error('No access token found for item: ' + itemId);
      }

      const result = await client.transactionsSync({
        access_token: user.accessToken,
        count: 500,
        cursor: cursor ?? undefined,
      });

      added.push(...result.data.added);

      // Handle rate limiting for initial call of all historical transactions
      await new Promise((resolve) => setTimeout(resolve, 1900));

      functions.logger.debug('Is initial call?: ' + initialCall);

      if (!initialCall) {
        functions.logger.debug('Finding transactions for item: ' + itemId);
        functions.logger.debug('Number of new transactions since last sync: ' + result.data.added.length);

        const businessCollection = await db.collection('businesses').withConverter(BusinessConverter).get();
        const userActivatedOffers = await db.collection(`users/${userId}/activated_offers`).withConverter(ActivatedOfferConverter).get();
        const userRedeemedOffers = await db.collection(`users/${userId}/redeemed_offers`).withConverter(RedeemedOfferConverter).get();

        for (const doc of businessCollection.docs) {
          const { id, business } = { id: doc.id, business: doc.data() };

          for (const transaction of result.data.added) {
            // Check transaction name
            if (business.name === transaction.merchant_name) {
              const offers = await db.collection(`businesses/${id}/offers`).withConverter(OfferConverter).get();
              for (const offerDoc of offers.docs) {
                const [offerId, offer] = [offerDoc.id, offerDoc.data()];

                // Check user has activated the offer
                if (userActivatedOffers.docs.some((activatedOffer) => activatedOffer.id === offerId)) {
                  // Check offer has not already been redeemed
                  if (!userRedeemedOffers.docs.some((redeemedOffer) => redeemedOffer.id === offerId)) {
                  // Check transaction amount
                    if (transaction.amount * 100 >= offer.threshold) {
                      const exists = await db.collection('users')
                        .doc(userId)
                        .collection('redeemed_offers')
                        .withConverter(RedeemedOfferConverter)
                        .where('originalOfferId', '==', offerDoc.id).get();

                      // Check if offer has already been matched
                      if (exists.docs.length) continue;

                      atLeastOneOfferFound = true;

                      await db.collection('users')
                        .doc(userId)
                        .collection('redeemed_offers')
                        .withConverter(RedeemedOfferConverter)
                        .doc()
                        .set({
                          business: business.name,
                          redeemed: false,
                          offerAmount: offer.offerAmount,
                          created: new Date().toISOString(),
                          originalOfferId: offerDoc.id,
                        });
                    }
                  }
                }
              }
            }
          }
        }
      }

      functions.logger.debug('Result: ', JSON.stringify(result.data));

      hasMore = result.data.has_more;
      cursor = result.data.next_cursor;

      if (!hasMore) {
        await db.collection('users').withConverter(UserConverter).doc(userId).update({
          cursor: result.data.next_cursor,
        });
      }
    }

    if (atLeastOneOfferFound) {
      const expo = new Expo();
      const token = user.pushToken;

      if (!token) throw new Error('No token found');

      functions.logger.debug('Sending push notification to user: ' + userId);

      await expo.sendPushNotificationsAsync([{
        to: [token],
        title: 'Requital points incoming 🚀',
        sound: 'default',
        body: 'We have matched you with new offers! 💰',
      }]);

      functions.logger.debug('Push notification sent to user: ' + userId);
    }

    return Promise.resolve(added);
  } catch (error: any) {
    throw new Error(error);
  }
};
