import { mockPlaid } from '../../mocks/plaid';
import { createLinkToken } from './createLinkToken';

jest.mock('plaid', () => mockPlaid);

describe('createLinkToken test', () => {
  test('should create a token link successfully', async () => {
    const req: any = {
      // Can remove stringify when v18 is out
      body: JSON.stringify({
        userId: 'test-user',
      }),
    };

    const res: any = {
      status: (status: number) => {
        expect(status).toBe(200);
        return {
          json: jest.fn((payload) => {
            expect(payload).toEqual({ link_token: 'link_token' });
          }),
        };
      },
    };

    await createLinkToken(req, res);
  });
});
