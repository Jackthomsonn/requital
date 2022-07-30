import * as functions from 'firebase-functions';

import { Configuration, PlaidApi, PlaidEnvironments, CountryCode, Products } from 'plaid';

const client = new PlaidApi(new Configuration({
  basePath: PlaidEnvironments.development,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': '5e8ce6edb83f3800136d204e',
      'PLAID-SECRET': 'c1cf30a84dc34b29df32523a4b50fc',
    },
  },
}));

export const createLinkToken = functions.https.onRequest(async (request, response) => {
  const { userId } = JSON.parse(request.body);

  try {
    const createTokenResponse = await client.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: 'Requital App',
      products: [Products.Auth, Products.Transactions],
      language: 'en',
      webhook: 'https://requital.eu.ngrok.io/requital-39e1f/us-central1/captureWebhook',
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
