import { Offer } from 'requital-converter';

export const mockOfferEngine = (offers: Offer[], fn: any = jest.fn(() => Promise.resolve(offers))) => {
  return {
    processTransactions: () => fn(),
  };
};
