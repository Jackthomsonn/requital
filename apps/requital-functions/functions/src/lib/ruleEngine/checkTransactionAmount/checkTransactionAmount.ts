export const transactionAmountMatchesOfferThreshold = (transactionAmount: number, offerThreshold: number) => {
  return function() {
    return transactionAmount * 100 >= offerThreshold;
  };
};
