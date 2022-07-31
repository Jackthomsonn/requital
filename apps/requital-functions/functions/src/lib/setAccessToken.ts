import * as admin from 'firebase-admin';

import * as functions from 'firebase-functions';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { UserConverter } from 'requital-converter';

export const setAccessToken = functions.runWith({ secrets: ['PLAID_CLIENT_ID', 'PLAID_SECRET'], ingressSettings: 'ALLOW_ALL' }).https.onRequest(async (request, response) => {
  if (!admin.apps.length) admin.initializeApp();

  const client = new PlaidApi(new Configuration({
    basePath: PlaidEnvironments.development,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
      },
    },
  }));

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
