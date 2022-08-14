export const transactionMerchantHasBeenMatchedToABusiness = (businessName?: string | null, transactionMerchantName?: string | null) => {
  return businessName === transactionMerchantName;
};
