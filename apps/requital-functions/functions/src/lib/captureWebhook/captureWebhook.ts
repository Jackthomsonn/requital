import * as functions from 'firebase-functions';

import { Configuration, PlaidApi, PlaidEnvironments, SyncUpdatesAvailableWebhook, WebhookType } from 'plaid';
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

    try {
      const payload: SyncUpdatesAvailableWebhook = request.body;

      functions.logger.debug('Handling webhook', { payload });

      if (!payload) {
        functions.logger.error('No payload found in webhook');
      }

      if (!payload.webhook_type) {
        functions.logger.error('No webhook_type found in webhook');
      }

      if (payload.webhook_type !== WebhookType.Transactions) {
        functions.logger.info('Webhook type is not transactions');
      }

      const supportedWebhookCodes = ['SYNC_UPDATES_AVAILABLE'];

      if (!supportedWebhookCodes.includes(payload.webhook_code)) {
        functions.logger.info('Webhook code is not supported');
      }

      const transactions = await processTransactions(payload.item_id, client);

      response.status(200).json({ status: 'success', data: transactions });
    } catch (error) {
      functions.logger.error('Error when invoking capture webhook', { error });

      response.status(500).json({ status: 'error', error: error });
    }
  },
);
