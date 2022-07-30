import * as admin from 'firebase-admin';

import * as functions from 'firebase-functions';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { UserConverter } from 'requital-converters';

const client = new PlaidApi(new Configuration({
  basePath: PlaidEnvironments.development,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': '5e8ce6edb83f3800136d204e',
      'PLAID-SECRET': 'c1cf30a84dc34b29df32523a4b50fc',
    },
  },
}));

export const setAccessToken = functions.https.onRequest(async (request, response) => {
  if (!admin.apps.length) admin.initializeApp();

  const db = admin.firestore();

  try {
    const res = await client.itemPublicTokenExchange({
      public_token: request.body.public_token,
    });

    if (!res.data.item_id) throw new Error('No item id returned');

    const itemID = res.data.item_id;

    await db.collection('users').withConverter(UserConverter).doc(request.body.uid).set({
      accessToken: res.data.access_token,
      itemID,
    });

    response.status(200).json({ status: 'success' });
  } catch (error) {
    response.status(500).send({
      status: 'error',
      error,
    });
  }
});
