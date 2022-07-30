import * as admin from 'firebase-admin';

import { Configuration, PlaidApi, PlaidEnvironments, Transaction } from 'plaid';

import { BusinessConverter } from 'requital-converters';
import { ActivatedOfferConverter } from 'requital-converters';
import { RedeemedOfferConverter } from 'requital-converters';
import { OfferConverter } from 'requital-converters';
import { UserConverter } from 'requital-converters';

const client = new PlaidApi(
  new Configuration({
    basePath: PlaidEnvironments.development,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': '5e8ce6edb83f3800136d204e',
        'PLAID-SECRET': 'c1cf30a84dc34b29df32523a4b50fc',
      },
    },
  }),
);

export const processTransactions = async (itemId: string): Promise<void | Transaction[]> => {
  const db = admin.firestore();

  try {
    const users = await db.collection('users').withConverter(UserConverter).where('itemID', '==', itemId).get();
    const [user, userId] = [users.docs[0].data(), users.docs[0].id];

    const userDoc = await db.collection('users').withConverter(UserConverter).doc(userId).get();

    let cursor = userDoc.data()?.cursor || '';

    const initialCall = cursor === '';

    let hasMore = true;

    while (hasMore) {
      const result = await client.transactionsSync({
        access_token: user.accessToken,
        count: 500,
        cursor: cursor ?? undefined,
      });

      // Handle rate limiting for initial call of all historical transactions
      await new Promise((resolve) => setTimeout(resolve, 1900));

      if (!initialCall) {
        console.log('not the initial call', cursor);
        console.log('for item:', itemId);
        console.log(result.data.added);

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

                      db.collection('users')
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

        return result.data.added;
      }
    }
  } catch (error: any) {
    throw new Error(error);
  }
};
