import { mockPlaid } from '../../../tests/mocks/plaid';
import { Status } from '../enums/status';
import { createLinkToken } from './createLinkToken';

jest.mock('plaid', () => mockPlaid);

describe('createLinkToken test', () => {
  describe('when the correct parameters are provided', () => {
    test('should create a token link successfully', async () => {
      // Arrange
      const req: any = {
        // Can remove stringify when v18 is out
        body: JSON.stringify({
          userId: 'test-user',
        }),
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
      await createLinkToken(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(jsonResponse).toHaveBeenCalledWith({ link_token: 'link_token' });
    });
  });

  describe('when a link token is not provided', () => {
    beforeEach(() => {
      mockPlaid.PlaidApi.mockImplementationOnce(() => {
        return {
          linkTokenCreate: () => {
            return {
              data: {
                link_token: undefined,
              },
            };
          },
        } as any;
      });
    });

    test('should throw an error', async () => {
      // Arrange
      const req: any = {
        // Can remove stringify when v18 is out
        body: JSON.stringify({
          userId: 'test-user',
        }),
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
      await createLinkToken(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(jsonResponse).toHaveBeenCalledWith({ status: Status.ERROR, reason: expect.anything() });
    });
  });
});
