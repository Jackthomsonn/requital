import * as functions from 'firebase-functions';

import { Configuration, PlaidApi, PlaidEnvironments, SyncUpdatesAvailableWebhook, WebhookType } from 'plaid';
import { Status } from '../enums/status';
import { processTransactions } from '../processTransactions/processTransactions';

export const captureWebhook = functions.runWith({ timeoutSeconds: 540, secrets: ['PLAID_CLIENT_ID', 'PLAID_SECRET'], ingressSettings: 'ALLOW_ALL' }).https.onRequest(
  async (request, response) => {
    const client = new PlaidApi(new Configuration({
      basePath: PlaidEnvironments.development,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
          'PLAID-SECRET': process.env.PLAID_SECRET,
        },
      },
    }));

    const payload: SyncUpdatesAvailableWebhook = request.body;

    if (!payload) {
      functions.logger.error('No payload found in webhook');

      response.status(400).json({ status: Status.ERROR, reason: 'No payload' });
      return;
    }

    if (!payload.webhook_type) {
      functions.logger.error('No webhook_type found in webhook');

      response.status(400).json({ status: Status.ERROR, reason: 'No webhook type provided' });
      return;
    }

    if (payload.webhook_type !== WebhookType.Transactions) {
      functions.logger.info('Webhook type is not transactions');

      response.status(200).json({ status: Status.SKIPPED, reason: `Webhook type ${payload.webhook_type} is not supported` });
      return;
    }

    const supportedWebhookCodes = ['SYNC_UPDATES_AVAILABLE'];

    if (!supportedWebhookCodes.includes(payload.webhook_code)) {
      functions.logger.info('Webhook code is not supported');

      response.status(200).json({ status: Status.SKIPPED, reason: `Webhook code ${payload.webhook_code} is not supported` });
      return;
    }

    try {
      functions.logger.debug('Handling webhook', { payload });

      const transactions = await processTransactions(payload.item_id, client);

      response.status(200).json({ status: Status.SUCCESS, data: transactions });
    } catch (error: any) {
      functions.logger.error('Error when invoking capture webhook', { error });

      response.status(500).json({ status: Status.ERROR, reason: error.message });
    }
  },
);
