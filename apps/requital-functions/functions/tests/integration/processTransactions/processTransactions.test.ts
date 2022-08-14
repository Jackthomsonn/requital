import * as admin from 'firebase-admin';

import { PlaidApi, Configuration, PlaidEnvironments, ItemPublicTokenExchangeRequest, SandboxPublicTokenCreateRequest, Products } from 'plaid';
import { processTransactions } from '../../../src/lib/processTransactions/processTransactions';
import { firestore, ServiceAccount } from 'firebase-admin';
import { User } from 'requital-converter';

import Expo from 'expo-server-sdk';

import serviceAccount from './service_account.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

admin.firestore().settings({ ignoreUndefinedProperties: true });

const db = firestore();

const client = new PlaidApi(new Configuration({
  basePath: PlaidEnvironments.sandbox,
  username: 'user_good',
  password: 'pass_good',
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': '5e8ce6edb83f3800136d204e',
      'PLAID-SECRET': '9e41fe174945e36118b350f47c8043',
    },
  },
}));

jest.retryTimes(1);

describe('processTransactions', () => {
  describe('called for the first time', () => {
    let [accessToken, itemID] = ['', ''];

    beforeEach(async () => {
      return new Promise(async (resolve) => {
        const publicTokenRequest: SandboxPublicTokenCreateRequest = {
          institution_id: 'ins_109511',
          initial_products: [Products.Auth, Products.Transactions],
        };

        const publicTokenResponse = await client.sandboxPublicTokenCreate(
          publicTokenRequest,
        );

        const publicToken = publicTokenResponse.data.public_token;

        const exchangeRequest: ItemPublicTokenExchangeRequest = {
          public_token: publicToken,
        };

        const exchangeTokenResponse = await client.itemPublicTokenExchange(
          exchangeRequest,
        );

        [accessToken, itemID] = [exchangeTokenResponse.data.access_token, exchangeTokenResponse.data.item_id];

        await db.collection('users').doc('test-user-id').create({
          id: 1,
          itemID: itemID,
          accessToken: accessToken,
          cursor: '',
        });

        resolve({});
      });
    });

    afterEach(() => {
      return db.collection('users').doc('test-user-id').delete();
    });

    test('returns added transactions amount', async () => {
    // Arrange and Act
      const result = await processTransactions(itemID, client);

      // Assert
      const userDoc = await db.collection('users').doc('test-user-id').get();
      const user = userDoc.data() as User;

      expect(user.cursor).not.toEqual('');
      expect(result).toBe(16);
    });

    test('does not send a push notification', async () => {
    // Arrange
      const notificationSpy = jest.spyOn(Expo.prototype, 'sendPushNotificationsAsync');

      // Act
      await processTransactions(itemID, client);

      // Assert
      expect(notificationSpy).toHaveBeenCalledTimes(0);
    });

    test('does not redeem any offers', async () => {
    // Arrange
      const firestoreSpy = jest.spyOn(firestore(), 'collection');

      // Act
      await processTransactions(itemID, client);

      // Assert
      expect(firestoreSpy).not.toHaveBeenCalledWith('users/test-user-id/redeemed_offers');
    });
  });

  describe('called after first sync has completed', () => {
    let [accessToken, itemID] = ['', ''];

    beforeEach(async () => {
      return new Promise(async (resolve) => {
        const publicTokenRequest: SandboxPublicTokenCreateRequest = {
          institution_id: 'ins_109511',
          initial_products: [Products.Auth, Products.Transactions],
        };

        const publicTokenResponse = await client.sandboxPublicTokenCreate(
          publicTokenRequest,
        );

        const publicToken = publicTokenResponse.data.public_token;

        const exchangeRequest: ItemPublicTokenExchangeRequest = {
          public_token: publicToken,
        };

        const exchangeTokenResponse = await client.itemPublicTokenExchange(
          exchangeRequest,
        );

        [accessToken, itemID] = [exchangeTokenResponse.data.access_token, exchangeTokenResponse.data.item_id];

        await db.collection('users').doc('test-user-id').create({
          id: 1,
          itemID: itemID,
          accessToken: accessToken,
          cursor: '',
          pushToken: 'test-push-token',
        });

        await db.collection('businesses').doc('mcdonalds-id').create({
          name: 'McDonald\'s',
        });

        await db.collection('businesses').doc('uber-id').create({
          name: 'Uber',
        });

        resolve({});
      });
    });

    afterEach(() => {
      return new Promise(async (resolve) => {
        const userRef = db.collection('users').doc('test-user-id');
        const mcDonaldsRef = db.collection('businesses').doc('mcdonalds-id');
        const uberRef = db.collection('businesses').doc('uber-id');

        await db.recursiveDelete(mcDonaldsRef);
        await db.recursiveDelete(userRef);
        await db.recursiveDelete(uberRef);

        resolve({});
      });
    });

    test('redeems the correct number of offers', async () => {
    // Arrange
      await db.collection('businesses').doc('uber-id').collection('offers').doc('uber-offer-id').create({
        description: 'Spend £0.05 get 100 points',
        offerAmount: 100,
        threshold: 5,
      });
      await db.collection('users').doc('test-user-id').collection('activated_offers').doc('uber-offer-id').create({
        originalOfferId: 'uber-offer-id',
      });

      // Act
      await processTransactions(itemID, client);

      // Update the cursor to a point in time less than the last sync cursor
      await db.collection('users').doc('test-user-id').update({
        cursor: 'CAESJXJkNW82S2QxOVd1Z0d2MXZaTjU2dXEza3o1bnlWcXVEWmpMUnIaDAib6NCXBhCAz4CQASIMCJvo0JcGEIDPgJABKgwIm+jQlwYQgM+AkAE=',
      });

      // Reprocess transactions
      await processTransactions(itemID, client, 250, true);

      // Assert
      const redeemedOffers = await db.collection('users').doc('test-user-id').collection('redeemed_offers').get();

      expect(redeemedOffers.docs.length).toBe(1);
    }, 60000);

    test('sends a push notification 1 time', async () => {
    // Arrange
      await db.collection('businesses').doc('uber-id').collection('offers').doc('uber-offer-id').create({
        description: 'Spend £0.05 get 100 points',
        offerAmount: 100,
        threshold: 5,
      });
      await db.collection('users').doc('test-user-id').collection('activated_offers').doc('uber-offer-id').create({
        originalOfferId: 'uber-offer-id',
      });

      const notificationSpy = jest.spyOn(Expo.prototype, 'sendPushNotificationsAsync');

      // Act
      await processTransactions(itemID, client);

      // Update the cursor to a point in time less than the last sync cursor
      await db.collection('users').doc('test-user-id').update({
        cursor: 'CAESJXJkNW82S2QxOVd1Z0d2MXZaTjU2dXEza3o1bnlWcXVEWmpMUnIaDAib6NCXBhCAz4CQASIMCJvo0JcGEIDPgJABKgwIm+jQlwYQgM+AkAE=',
      });

      // Reprocess transactions
      await processTransactions(itemID, client, 250, true);

      // Assert
      expect(notificationSpy).toHaveBeenCalledTimes(1);
    }, 60000);
  });
});
