import { mockOfferEngine } from '../../mocks/offerEngine';
import { mockPlaid } from '../../mocks/plaid';
import { captureWebhook } from './captureWebhook';

const processTransactionsSpy = jest.fn(() => Promise.resolve([]));

jest.mock('../offerEngine', () => mockOfferEngine([], () => processTransactionsSpy()));

describe('captureWebhook test', () => {
  beforeEach(() => {
    jest.mock('plaid', () => mockPlaid);
  });
  test('should handle SYNC_UPDATES_AVAILABLE webhoook requests successfully', async () => {
    const req: any = {
      body: {
        webhook_type: mockPlaid.WebhookType.Transactions,
        webhook_code: 'SYNC_UPDATES_AVAILABLE',
      },
    };

    const res: any = {
      status: (status: number) => {
        expect(status).toBe(200);
        return {
          json: jest.fn((payload) => {
            expect(payload).toEqual({ status: 'success', data: [] });
          }),
        };
      },
    };

    await captureWebhook(req, res);

    expect(processTransactionsSpy).toHaveBeenCalled();
  });

  test('should fail if no payload exists', async () => {
    const req: any = {
      body: undefined,
    };

    const res: any = {
      status: (status: number) => {
        expect(status).toBe(400);
        return {
          json: jest.fn((payload) => {
            expect(payload).toEqual({ status: 'error', error: 'No payload' });
          }),
        };
      },
    };

    await captureWebhook(req, res);

    expect(processTransactionsSpy).not.toHaveBeenCalled();
  });

  test('should fail if no webhook_type exists', async () => {
    const req: any = {
      body: {
        webhook_code: 'SYNC_UPDATES_AVAILABLE',
      },
    };

    const res: any = {
      status: (status: number) => {
        expect(status).toBe(400);
        return {
          json: jest.fn((payload) => {
            expect(payload).toEqual({ status: 'error', error: 'No webhook type provided' });
          }),
        };
      },
    };

    await captureWebhook(req, res);

    expect(processTransactionsSpy).not.toHaveBeenCalled();
  });

  test('should skip if webhook_type is not transactions', async () => {
    const req: any = {
      body: {
        webhook_code: 'SYNC_UPDATES_AVAILABLE',
        webhook_type: 'Holdings',
      },
    };

    const res: any = {
      status: (status: number) => {
        expect(status).toBe(200);
        return {
          json: jest.fn((payload) => {
            expect(payload).toEqual({ status: 'skipped', error: 'Webhook type Holdings is not supported' });
          }),
        };
      },
    };

    await captureWebhook(req, res);

    expect(processTransactionsSpy).not.toHaveBeenCalled();
  });

  test('should skip if webhook_code is not supported', async () => {
    const req: any = {
      body: {
        webhook_code: 'INITIAL_UPDATE',
        webhook_type: mockPlaid.WebhookType.Transactions,
      },
    };

    const res: any = {
      status: (status: number) => {
        expect(status).toBe(200);
        return {
          json: jest.fn((payload) => {
            expect(payload).toEqual({ status: 'skipped', error: 'Webhook code INITIAL_UPDATE is not supported' });
          }),
        };
      },
    };

    await captureWebhook(req, res);

    expect(processTransactionsSpy).not.toHaveBeenCalled();
  });
});
