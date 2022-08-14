import { mockProcessTransactions } from '../../../tests/mocks/processTransactions';
import { mockPlaid } from '../../../tests/mocks/plaid';
import { captureWebhook } from './captureWebhook';
import { Status } from '../enums/status';

const processTransactionsSpy = jest.fn(() => Promise.resolve([]));

jest.mock('../processTransactions/processTransactions', () => mockProcessTransactions([], () => processTransactionsSpy()));

describe('captureWebhook test', () => {
  beforeAll(() => {
    jest.mock('plaid', () => mockPlaid);
  });

  test('should handle SYNC_UPDATES_AVAILABLE webhoook requests successfully', async () => {
    // Arrange
    const req: any = {
      body: {
        webhook_type: mockPlaid.WebhookType.Transactions,
        webhook_code: 'SYNC_UPDATES_AVAILABLE',
      },
    };

    const res: any = {
      status: jest.fn(() => {
        return {
          json: jsonResponse,
        };
      }),
    };

    const jsonResponse = jest.fn();

    // Act
    await captureWebhook(req, res);

    // Assert
    expect(processTransactionsSpy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonResponse).toHaveBeenCalledWith({ status: Status.SUCCESS, data: [] });
  });

  test('should fail if no payload exists', async () => {
    // Arrange
    const req: any = {
      body: undefined,
    };

    const res: any = {
      status: jest.fn(() => {
        return {
          json: jsonResponse,
        };
      }),
    };

    const jsonResponse = jest.fn();

    // Act
    await captureWebhook(req, res);

    // Assert
    expect(processTransactionsSpy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(jsonResponse).toHaveBeenCalledWith({ status: Status.ERROR, reason: 'No payload' });
  });

  test('should fail if no webhook_type exists', async () => {
    // Arrange
    const req: any = {
      body: {
        webhook_code: 'SYNC_UPDATES_AVAILABLE',
      },
    };

    const res: any = {
      status: jest.fn(() => {
        return {
          json: jsonResponse,
        };
      }),
    };

    const jsonResponse = jest.fn();

    // Act
    await captureWebhook(req, res);

    // Assert
    expect(processTransactionsSpy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(jsonResponse).toHaveBeenCalledWith({ status: Status.ERROR, reason: 'No webhook type provided' });
  });

  test('should skip if webhook_type is not transactions', async () => {
    // Arrange
    const req: any = {
      body: {
        webhook_code: 'SYNC_UPDATES_AVAILABLE',
        webhook_type: 'Holdings',
      },
    };

    const res: any = {
      status: jest.fn((status: number) => {
        return {
          json: jsonResponse,
        };
      }),
    };

    const jsonResponse = jest.fn();

    // Act
    await captureWebhook(req, res);

    // Assert
    expect(processTransactionsSpy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonResponse).toHaveBeenCalledWith({ status: Status.SKIPPED, reason: 'Webhook type Holdings is not supported' });
  });

  test('should skip if webhook_code is not supported', async () => {
    // Arrange
    const req: any = {
      body: {
        webhook_code: 'INITIAL_UPDATE',
        webhook_type: mockPlaid.WebhookType.Transactions,
      },
    };

    const res: any = {
      status: jest.fn(() => {
        return {
          json: jsonResponse,
        };
      }),
    };

    const jsonResponse = jest.fn();

    // Act
    await captureWebhook(req, res);

    // Assert
    expect(processTransactionsSpy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonResponse).toHaveBeenCalledWith({ status: Status.SKIPPED, reason: 'Webhook code INITIAL_UPDATE is not supported' });
  });
});
