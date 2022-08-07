import { firestore } from 'firebase-admin';

import * as functions from 'firebase-functions';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { UserConverter } from 'requital-converter';
import { processTransactions } from '../offerEngine';

export const setAccessToken = functions.runWith({ secrets: ['PLAID_CLIENT_ID', 'PLAID_SECRET'], ingressSettings: 'ALLOW_ALL' }).https.onRequest(async (request, response) => {
  const client = new PlaidApi(new Configuration({
    basePath: PlaidEnvironments.development,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
      },
    },
  }));

  const db = firestore();

  try {
    functions.logger.debug('Exchanging public token');

    const res = await client.itemPublicTokenExchange({
      public_token: request.body.public_token,
    });

    if (!res.data.item_id) {
      functions.logger.error('No item_id found in response');

      throw new Error('No item id returned');
    }

    const itemID = res.data.item_id;

    functions.logger.debug('Get user for item: ' + itemID);

    await db.collection('users').withConverter(UserConverter).doc(request.body.uid).update({
      accessToken: res.data.access_token,
      itemID,
    });

    processTransactions(itemID, client);

    response.status(200).json({ status: 'success' });
  } catch (error) {
    response.status(500).json({
      status: 'error',
      error,
    });
  }
});
