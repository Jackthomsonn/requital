import { Offer } from 'requital-converter';

export const mockOfferEngine = (offers: Offer[]) => {
  return {
    processTransactions: jest.fn(() => Promise.resolve(offers)),
  };
};
