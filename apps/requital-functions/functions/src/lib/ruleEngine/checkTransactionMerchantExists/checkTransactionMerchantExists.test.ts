import { transactionMerchantHasBeenMatchedToABusiness } from './checkTransactionMerchantExists';

describe('checkTransactionMerchantExists', () => {
  test('when the merchant name prop exists in the system as a business', () => {
    const check = transactionMerchantHasBeenMatchedToABusiness('test', { merchant_name: 'test' });

    expect(check).toEqual(true);
  });

  test('when the name prop exists in the system as a business', () => {
    const check = transactionMerchantHasBeenMatchedToABusiness('test', { name: 'test' });

    expect(check).toEqual(true);
  });

  test('when the merchant name prop does not exist in the system as a business', () => {
    const check = transactionMerchantHasBeenMatchedToABusiness('test', { merchant_name: 'does-not-exist' });

    expect(check).toEqual(false);
  });

  test('when the name prop does not exist in the system as a business', () => {
    const check = transactionMerchantHasBeenMatchedToABusiness('test', { name: 'does-not-exist' });

    expect(check).toEqual(false);
  });
});
