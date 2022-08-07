import { mockFirebase } from '../../mocks/firebase';
import { mockPlaid } from '../../mocks/plaid';
import { setAccessToken } from './setAccessToken';

jest.mock('plaid', () => mockPlaid);

jest.mock('firebase-admin', () => mockFirebase([]));

describe('setAccessToken test', () => {
  test('should set an access token successfully', async () => {
    const req: any = {
      body: {
        uid: 'test-user',
        public_token: 'test_public_token',
      },
    };

    const res: any = {
      status: (status: number) => {
        expect(status).toBe(200);
        return {
          json: jest.fn((payload) => {
            expect(payload).toEqual({ status: 'success' });
          }),
        };
      },
    };

    await setAccessToken(req, res);
  });
});
