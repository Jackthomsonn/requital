import { AxiosError } from 'axios';
import * as admin from 'firebase-admin';

import * as functions from 'firebase-functions';
import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  SandboxItemFireWebhookRequest,
  SandboxItemFireWebhookRequestWebhookCodeEnum } from 'plaid';
import { UserConverter } from 'requital-converter';
;

export const triggerWebhook = functions.runWith({ secrets: ['PLAID_CLIENT_ID', 'PLAID_SECRET'], ingressSettings: 'ALLOW_ALL' }).https.onRequest(async (request, response) => {
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
    const users = await db.collection('users').withConverter(UserConverter).where('itemID', '==', request.body).get();
    const user = users.docs[0].data();

    if (!user.accessToken) {
      response.status(500).json({ status: 'error', error: 'User has no access token' });
      return;
    }

    const webhookRequest: SandboxItemFireWebhookRequest = {
      access_token: user.accessToken,
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
