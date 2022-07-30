import * as admin from 'firebase-admin';

import * as functions from 'firebase-functions';

import { processTransactions } from '../offerEngine/index';

export const matchOffers = functions.runWith({ timeoutSeconds: 540 }).https.onRequest(async (req, response) => {
  if (!admin.apps.length) admin.initializeApp();

  try {
    const transactions = await processTransactions(req.body.itemID);

    response.status(200).send({ status: 'success', data: transactions });
  } catch (error: any) {
    response.status(500).send({ status: 'error', error: error.message });
  }
});
