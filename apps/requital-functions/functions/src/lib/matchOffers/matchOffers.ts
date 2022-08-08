import { firestore } from 'firebase-admin';
import * as functions from 'firebase-functions';
import { PlaidApi, Configuration, PlaidEnvironments } from 'plaid';
import { UserConverter } from 'requital-converter';

import { processTransactions } from '../offerEngine/index';

export const matchOffers = functions.runWith({ timeoutSeconds: 540, secrets: ['PLAID_CLIENT_ID', 'PLAID_SECRET'], ingressSettings: 'ALLOW_ALL' }).pubsub.schedule('every 1 hours').onRun(async (_ctx) => {
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
    functions.logger.debug('Finding users to process transactions on');

    const userDocs = await db.collection('users').withConverter(UserConverter).get();

    functions.logger.debug('Found users', { numberOfUsersToProcessTransactionsFor: userDocs.docs.length });

    for (const doc of userDocs.docs) {
      await processTransactions(doc.data().itemID, client);
    }

    return null;
  } catch (error: any) {
    functions.logger.error('Error when trying match offers: ' + error);
    return null;
  }
});
