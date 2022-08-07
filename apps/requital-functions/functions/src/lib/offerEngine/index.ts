import Expo from 'expo-server-sdk';
import { firestore } from 'firebase-admin';
import * as functions from 'firebase-functions';
import { PlaidApi, Transaction } from 'plaid';
import { ActivatedOfferConverter, BusinessConverter, OfferConverter, RedeemedOfferConverter, UserConverter } from 'requital-converter';

export const processTransactions = async (itemId: string, client: PlaidApi): Promise<void | Transaction[]> => {
  const db = firestore();

  try {
    functions.logger.debug('Processing transactions for item: ' + itemId);

    const users = await db.collection('users').withConverter(UserConverter).where('itemID', '==', itemId).get();

    if (users.docs.length === 0) {
      functions.logger.error('No users found for item: ' + itemId);

      return [];
    }

    const [user, userId] = [users.docs[0].data(), users.docs[0].id];

    let cursor = user.cursor || '';

    const initialCall = cursor === '';

    let hasMore = true;

    while (hasMore) {
      if (!user.accessToken) {
        functions.logger.error('No access token found for item: ' + itemId);

        return [];
      }

      functions.logger.debug('Fetching transactions for item: ' + itemId);

      const result = await client.transactionsSync({
        access_token: user.accessToken,
        count: 500,
        cursor: cursor ?? undefined,
      });

      // Handle rate limiting for initial call of all historical transactions
      await new Promise((resolve) => setTimeout(resolve, 1900));

      if (!initialCall) {
        functions.logger.debug('Initial call for item: ' + itemId);

        const businessCollection = await db.collection('businesses').withConverter(BusinessConverter).get();
        const userActivatedOffers = await db.collection(`users/${userId}/activated_offers`).withConverter(ActivatedOfferConverter).get();
        const userRedeemedOffers = await db.collection(`users/${userId}/redeemed_offers`).withConverter(RedeemedOfferConverter).get();

        businessCollection.docs?.forEach((doc) => {
          const { id, business } = { id: doc.id, business: doc.data() };

          result.data.added.forEach(async (transaction) => {
            // Check transaction name
            if (business.name === transaction.merchant_name) {
              const offers = await db.collection(`businesses/${id}/offers`).withConverter(OfferConverter).get();
              offers.docs?.forEach(async (offerDoc) => {
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
                      if (exists.docs.length) return;

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
              });
            }
          });
        });
      }

      hasMore = result.data.has_more;
      cursor = result.data.next_cursor;

      if (!hasMore) {
        await db.collection('users').withConverter(UserConverter).doc(userId).update({
          cursor: result.data.next_cursor,
        });

        const expo = new Expo();
        const token = user.pushToken;

        if (!token) throw new Error('No token found');

        await expo.sendPushNotificationsAsync([{
          to: [token],
          title: 'Requital points incoming 🚀',
          sound: 'default',
          body: 'We have matched you with new offers! 💰',
        }]);

        return result.data.added;
      }
    }
  } catch (error: any) {
    throw new Error(error);
  }
};
