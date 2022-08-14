import { offerHasNotBeenRedeemed } from './checkOfferHasNotBeenRedeemed';

describe('offerHasNotBeenRedeemed', () => {
  test('if the user has no redeemed offers', () => {
    const check = offerHasNotBeenRedeemed([], 'offerId');

    expect(check()).toEqual(true);
  });

  test('if the user has already redeemed the offer', () => {
    const check = offerHasNotBeenRedeemed([{
      data: () => {
        return {
          originalOfferId: 'offerId',
        };
      },
    } as any], 'offerId');

    expect(check()).toEqual(false);
  });

  test('if the user has redeemed offers but is not for the current one', () => {
    const check = offerHasNotBeenRedeemed([{
      data: () => {
        return {
          originalOfferId: 'offerId',
        };
      },
    } as any, {
      data: () => {
        return {
          originalOfferId: 'offerId2',
        };
      },
    } as any], 'offerId3');

    expect(check()).toEqual(true);
  });
});
