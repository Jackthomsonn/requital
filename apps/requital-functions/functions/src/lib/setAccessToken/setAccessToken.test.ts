import { mockFirebase } from '../../../tests/mocks/firebase';
import { mockPlaid } from '../../../tests/mocks/plaid';
import { setAccessToken } from './setAccessToken';

const publishMessageSpy = jest.fn(() =>Promise.resolve({}));

jest.mock('plaid', () => mockPlaid);
jest.mock('firebase-admin', () => mockFirebase);
jest.mock('@google-cloud/pubsub', () => ({
  PubSub: jest.fn().mockImplementation(() => ({
    topic: () => {
      return {
        publishMessage: () => publishMessageSpy(),
      };
    },
  })),
}));

describe('setAccessToken', () => {
  describe('when all parameters are valid', () => {
    test('should set an access token successfully', async () => {
      // Arrange
      const req: any = {
        body: {
          uid: 'test-user',
          public_token: 'test_public_token',
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
      await setAccessToken(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(jsonResponse).toHaveBeenCalledWith({ status: 'success' });
    });

    test('should publish an initial pull message', async () => {
      // Arrange
      const req: any = {
        body: {
          uid: 'test-user',
          public_token: 'test_public_token',
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
      await setAccessToken(req, res);

      // Assert
      expect(publishMessageSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(jsonResponse).toHaveBeenCalledWith({ status: 'success' });
    });
  });

  describe('when an item_id cannot be found', () => {
    beforeEach(() => {
      mockPlaid.PlaidApi.mockImplementationOnce(() => {
        return {
          itemPublicTokenExchange: () => Promise.resolve({ data: { item_id: undefined } }),
        } as any;
      });
    });

    test('should throw a no item id returned error', async () => {
      // Arrange
      const req: any = {
        body: {
          uid: 'test-user',
          public_token: 'test_public_token',
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
      await setAccessToken(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(jsonResponse).toHaveBeenCalledWith({ status: 'error', error: new Error('No item id returned') });
    });
  });
});
