import * as admin from 'firebase-admin';

import * as functions from 'firebase-functions';
import { SyncUpdatesAvailableWebhook, WebhookType } from 'plaid';
import { processTransactions } from '../offerEngine';

export const captureWebhook = functions.https.onRequest(
  async (request, response) => {
    if (!admin.apps.length) admin.initializeApp();

    const payload: SyncUpdatesAvailableWebhook = request.body;

    if (!payload) {
      response.status(400).send({ status: 'error', error: 'No payload' });
      return;
    }

    if (!payload.webhook_type) {
      response
        .status(400)
        .send({ status: 'error', error: 'No webhook type provided' });
      return;
    }

    if (payload.webhook_type !== WebhookType.Transactions) {
      response.status(200).json({
        status: 'skipped',
        error: `Webhook type ${payload.webhook_type} is not supported`,
      });
      return;
    }

    const supportedWebhookCodes = ['SYNC_UPDATES_AVAILABLE'];

    if (!supportedWebhookCodes.includes(payload.webhook_code)) {
      response.status(200).json({
        status: 'skipped',
        error: `Webhook code ${payload.webhook_code} is not supported`,
      });
      return;
    }

    try {
      const transactions = await processTransactions(payload.item_id);

      response.status(200).send({ status: 'success', data: transactions });
    } catch (error) {
      response.status(500).send({ status: 'error', error });
    }
  },
);
