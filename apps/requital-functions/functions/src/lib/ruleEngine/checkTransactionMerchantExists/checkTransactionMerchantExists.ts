import { Transaction } from 'plaid';

export const transactionMerchantHasBeenMatchedToABusiness = (businessName?: string | null, transaction?: Partial<Pick<Transaction, 'merchant_name' | 'name'>>) => {
  const merchantNames = [transaction?.merchant_name, transaction?.name];

  return merchantNames.includes(businessName);
};
