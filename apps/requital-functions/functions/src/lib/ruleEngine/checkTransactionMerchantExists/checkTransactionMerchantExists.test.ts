import { transactionMerchantHasBeenMatchedToABusiness } from './checkTransactionMerchantExists';

describe('checkTransactionMerchantExists', () => {
  test('when the merchant name exists in the system as a business', () => {
    const check = transactionMerchantHasBeenMatchedToABusiness('test', 'test');

    expect(check).toEqual(true);
  });

  test('when the merchant name does not exist in the system as a business', () => {
    const check = transactionMerchantHasBeenMatchedToABusiness('test', 'does-not-exist');

    expect(check).toEqual(false);
  });
});
