import * as functions from 'firebase-functions';

import { Configuration, PlaidApi, PlaidEnvironments, CountryCode, Products } from 'plaid';

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

  const { userId } = JSON.parse(request.body);

  try {
    const createTokenResponse = await client.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: 'Requital App',
      products: [Products.Auth, Products.Transactions],
      language: 'en',
      webhook: `${process.env.WEBHOOK_URL}/captureWebhook`,
      redirect_uri: 'https://create-react-app-gold-zeta-41.vercel.app',
      country_codes: [CountryCode.Gb],
    });

    if (!createTokenResponse.data.link_token) throw new Error('No link token returned');

    response.status(200).json(createTokenResponse.data);
  } catch (error) {
    response.status(500).send({
      status: 'error',
      error,
    });
  }
});
