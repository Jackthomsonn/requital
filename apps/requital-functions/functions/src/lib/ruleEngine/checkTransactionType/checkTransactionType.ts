import { Transaction, TransactionCode } from 'plaid';

export const transactionTypeIsAllowed = (transaction: Transaction, transactionTypeShouldPass?: boolean) => {
  if (transactionTypeShouldPass && process.env.NODE_ENV !== 'production') {
    return function() {
      return true;
    };
  }

  return function() {
    return transaction.transaction_code === TransactionCode.Purchase;
  };
};
