import { offerIsActivated } from './checkOfferIsActivated';

describe('offerIsActivated', () => {
  test('if the user has activated the offer', () => {
    const check = offerIsActivated([{
      id: 'offerId',
      data: () => {
        return {
          originalOfferId: 'offerId',
        };
      },
    } as any], 'offerId');

    expect(check()).toEqual(true);
  });

  test('if the user has not activated the offer', () => {
    const check = offerIsActivated([{
      id: 'offerId',
      data: () => {
        return {
          originalOfferId: 'offerId',
        };
      },
    } as any], 'offerId2');

    expect(check()).toEqual(false);
  });
});
