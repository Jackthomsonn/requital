import { AxiosError } from 'axios';
import * as admin from 'firebase-admin';

import * as functions from 'firebase-functions';
import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  SandboxItemFireWebhookRequest,
  SandboxItemFireWebhookRequestWebhookCodeEnum } from 'plaid';
import { UserConverter } from 'requital-converters';
;

const client = new PlaidApi(new Configuration({
  basePath: PlaidEnvironments.development,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': '5e8ce6edb83f3800136d204e',
      'PLAID-SECRET': 'c1cf30a84dc34b29df32523a4b50fc',
    },
  },
}));

export const triggerWebhook = functions.https.onRequest(async (request, response) => {
  if (!admin.apps.length) admin.initializeApp();

  const db = admin.firestore();

  try {
    const users = await db.collection('users').withConverter(UserConverter).where('itemID', '==', request.body).get();
    const user = users.docs[0].data();

    const webhookRequest: SandboxItemFireWebhookRequest = {
      access_token: user?.accessToken,
      webhook_code: SandboxItemFireWebhookRequestWebhookCodeEnum.DefaultUpdate,
    };

    try {
      const res = await client.sandboxItemFireWebhook(webhookRequest );

      response.status(200).json({ status: 'success', data: res.data });
    } catch (error) {
      response.status(500).send({
        status: 'error',
        error: (error as AxiosError).response?.data,
      });
    }
  } catch (error) {
    response.status(500).send({
      status: 'error',
      error,
    });
  }
});
