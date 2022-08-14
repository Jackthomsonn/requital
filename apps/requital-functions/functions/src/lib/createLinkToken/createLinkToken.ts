import * as functions from 'firebase-functions';

import { Configuration, PlaidApi, PlaidEnvironments, CountryCode, Products } from 'plaid';
import { Status } from '../enums/status';

export const createLinkToken = functions.runWith({ secrets: ['PLAID_CLIENT_ID', 'PLAID_SECRET'], ingressSettings: 'ALLOW_ALL' }).https.onRequest(async (request, response) => {
  const client = new PlaidApi(new Configuration({
    basePath: PlaidEnvironments.development,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
      },
    },
  }));

  const { userId } = request.body;

  try {
    functions.logger.debug('Creating link token for user', { userId, webhookUrl: process.env.WEBHOOK_URL });

    const createTokenResponse = await client.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: 'Requital App',
      products: [Products.Auth, Products.Transactions],
      language: 'en',
      webhook: `${process.env.WEBHOOK_URL}/captureWebhook`,
      redirect_uri: 'https://create-react-app-gold-zeta-41.vercel.app',
      country_codes: [CountryCode.Gb],
    });

    if (!createTokenResponse.data.link_token) {
      functions.logger.error('No link token found in response');

      throw new Error('No link token returned');
    }

    response.status(200).json(createTokenResponse.data);
  } catch (error: any) {
    functions.logger.error('Error creating link token', { error });

    response.status(500).json({
      status: Status.ERROR,
      reason: error.message,
    });
  }
});
