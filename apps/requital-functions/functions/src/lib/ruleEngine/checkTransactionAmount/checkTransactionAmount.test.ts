import { transactionAmountMatchesOfferThreshold } from './checkTransactionAmount';

describe('checkTransactionAmount', () => {
  test('when the transaction amount is equal to the threshold', () => {
    const check = transactionAmountMatchesOfferThreshold(10, 100);

    expect(check()).toEqual(true);
  });

  test('when the transaction amount is greater than the threshold', () => {
    const check = transactionAmountMatchesOfferThreshold(20, 100);

    expect(check()).toEqual(true);
  });

  test('when the transaction amount is less than the threshold', () => {
    const check = transactionAmountMatchesOfferThreshold(2, 500);

    expect(check()).toEqual(false);
  });
});
