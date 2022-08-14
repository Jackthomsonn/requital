import { Expo } from 'expo-server-sdk';
import { firestore } from 'firebase-admin';
import * as functions from 'firebase-functions';
import { PlaidApi } from 'plaid';
import { ActivatedOfferConverter, BusinessConverter, OfferConverter, RedeemedOfferConverter, User, UserConverter } from 'requital-converter';
import { offerHasNotBeenRedeemed } from '../ruleEngine/checkOfferHasNotBeenRedeemed/checkOfferHasNotBeenRedeemed';
import { offerIsActivated } from '../ruleEngine/checkOfferIsActivated/checkOfferIsActivated';
import { transactionAmountMatchesOfferThreshold } from '../ruleEngine/checkTransactionAmount/checkTransactionAmount';
import { transactionMerchantHasBeenMatchedToABusiness } from '../ruleEngine/checkTransactionMerchantExists/checkTransactionMerchantExists';
import { transactionTypeIsAllowed } from '../ruleEngine/checkTransactionType/checkTransactionType';
import { performChecks } from '../ruleEngine/performChecks';

export const processTransactions = async (itemId: string, client: PlaidApi, transactionsToFetch = 500, transactionTypeShouldPass?: boolean): Promise<number> => {
  const db = firestore();

  let [added, hasMore, atLeastOneOfferFound] = [0, true, false];

  try {
    functions.logger.debug('Processing transactions for item', { itemId });

    const users = await db.collection('users').withConverter(UserConverter).where('itemID', '==', itemId).get();

    if (users.docs.length === 0) {
      functions.logger.error('No users found for item', { itemId });

      throw new Error(`No users found for item ${itemId}`);
    }

    const [user, userId] = [
      users.docs[0].data(),
      users.docs[0].id,
    ];

    let cursor = user.cursor || '';

    const initialCall = cursor === '';

    while (hasMore) {
      if (!user.accessToken) {
        functions.logger.error(`No access token found for item ${itemId}`);

        throw new Error(`No access token found for item ${itemId}`);
      }

      functions.logger.debug('Requesting transactions for item', { itemId, cursor, user });

      const result = await client.transactionsSync({
        access_token: user.accessToken,
        count: transactionsToFetch,
        cursor: cursor ?? undefined,
      });

      functions.logger.debug('Transactions received', {
        itemId,
        cursor,
        initialCall,
      });

      added = result.data.added.length;

      // Handle rate limiting for initial call of all historical transactions
      await new Promise((resolve) => setTimeout(resolve, 1900));

      if (!initialCall) {
        functions.logger.debug('Number of new transactions since last sync', { numberOfNewTransactions: result.data.added.length });

        functions.logger.debug('Fetching businesses', { itemId });
        const businessCollection = await db.collection('businesses').withConverter(BusinessConverter).get();

        functions.logger.debug('Fetching activated offers for user', { userId });
        const userActivatedOffers = await db.collection(`users/${userId}/activated_offers`).withConverter(ActivatedOfferConverter).get();

        for (const doc of businessCollection.docs) {
          const [id, business] = [
            doc.id,
            doc.data(),
          ];

          for (const transaction of result.data.added) {
            functions.logger.debug('Fetching redeemed offers for user', { userId });
            const userRedeemedOffers = await db.collection(`users/${userId}/redeemed_offers`).withConverter(RedeemedOfferConverter).get();

            if (transactionMerchantHasBeenMatchedToABusiness(business.name, transaction)) {
              const offers = await db.collection(`businesses/${id}/offers`).withConverter(OfferConverter).get();

              for (const offerDoc of offers.docs) {
                const [offerId, offer] = [
                  offerDoc.id,
                  offerDoc.data(),
                ];

                console.log(transaction.transaction_code);

                const { allChecksPassed } = performChecks(
                  [
                    offerIsActivated(userActivatedOffers.docs, offerId),
                    offerHasNotBeenRedeemed(userRedeemedOffers.docs, offerId),
                    transactionAmountMatchesOfferThreshold(transaction.amount, offer.threshold),
                    transactionTypeIsAllowed(transaction, transactionTypeShouldPass),
                  ],
                );

                if (allChecksPassed) {
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

      hasMore = result.data.has_more;
      cursor = result.data.next_cursor;

      if (!hasMore) {
        await db.collection('users').withConverter(UserConverter).doc(userId).update({
          cursor: result.data.next_cursor,
        });
      }
    }

    if (atLeastOneOfferFound) await handlePushNotification(user, userId);

    return Promise.resolve(added);
  } catch (error: any) {
    functions.logger.error('Error processing transactions', { error });

    throw new Error(error.message);
  }
};

const handlePushNotification = async (user: User, userId: string) => {
  const expo = new Expo();
  const token = user.pushToken;

  if (!token) throw new Error('No token found');

  functions.logger.debug('Sending push notification to user', { userId });

  await expo.sendPushNotificationsAsync([{
    to: [token],
    title: 'Requital points incoming 🚀',
    sound: 'default',
    body: 'We have matched you with new offers! 💰',
  }]);

  functions.logger.debug('Push notification sent to user', { userId });
};
