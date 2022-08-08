import * as functions from 'firebase-functions';
import { PlaidApi, Configuration, PlaidEnvironments } from 'plaid';
import { processTransactions } from '../offerEngine';

export const initialPull = functions.runWith({ secrets: ['PLAID_CLIENT_ID', 'PLAID_SECRET'] }).pubsub.topic('initial-pull').onPublish(async (message) => {
  const client = new PlaidApi(new Configuration({
    basePath: PlaidEnvironments.development,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
      },
    },
  }));

  const { itemID } = JSON.parse(Buffer.from(message.data, 'base64').toString());

  functions.logger.debug('Pulling historical data for item: ', { itemID });

  return processTransactions(message.json.itemID, client);
});
