import { mockOfferEngine } from '../../mocks/offerEngine';
import { mockPlaid } from '../../mocks/plaid';
import { matchOffers } from './matchOffers';

jest.mock('../offerEngine', () => mockOfferEngine([]));

jest.mock('plaid', () => mockPlaid);

describe('matchOffers test', () => {
  test('should successfully match offers', async () => {
    const req: any = {
      body: {
        itemID: 'test-item-id',
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

    await matchOffers(req, res);
  });
});
