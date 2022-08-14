import { TransactionCode } from 'plaid';
import { transactionTypeIsAllowed } from './checkTransactionType';

describe('transactionTypeIsAllowed', () => {
  test('when provided a transaction code of Purchase it will pass', () => {
    const check = transactionTypeIsAllowed({ transaction_code: TransactionCode.Purchase } as any);

    expect(check()).toEqual(true);
  });

  test('when provided a transaction code of anything other than Purchase it will fail', () => {
    const check1 = transactionTypeIsAllowed({ transaction_code: TransactionCode.Transfer } as any);
    const check2 = transactionTypeIsAllowed({ transaction_code: TransactionCode.Adjustment } as any);
    const check3 = transactionTypeIsAllowed({ transaction_code: TransactionCode.Cash } as any);
    const check4 = transactionTypeIsAllowed({ transaction_code: TransactionCode.Interest } as any);

    expect(check1()).toEqual(false);
    expect(check2()).toEqual(false);
    expect(check3()).toEqual(false);
    expect(check4()).toEqual(false);
  });
});
