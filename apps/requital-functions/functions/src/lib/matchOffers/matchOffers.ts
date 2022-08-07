import * as functions from 'firebase-functions';
import { PlaidApi, Configuration, PlaidEnvironments } from 'plaid';

import { processTransactions } from '../offerEngine/index';

export const matchOffers = functions.runWith({ timeoutSeconds: 540, secrets: ['PLAID_CLIENT_ID', 'PLAID_SECRET'], ingressSettings: 'ALLOW_ALL' }).https.onRequest(async (req, response) => {
  const client = new PlaidApi(new Configuration({
    basePath: PlaidEnvironments.development,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
      },
    },
  }));

  try {
    functions.logger.debug('Processing transactions', req.body.itemID);

    const transactions = await processTransactions(req.body.itemID, client);

    response.status(200).json({ status: 'success', data: transactions });
  } catch (error: any) {
    functions.logger.error('Error when trying match offers: ' + error);

    response.status(500).json({ status: 'error', error: error.message });
  }
});
