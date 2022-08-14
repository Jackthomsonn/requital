import { Offer } from 'requital-converter';

export const mockProcessTransactions = (offers: Offer[], fn: any = jest.fn(() => Promise.resolve(offers))) => {
  return {
    processTransactions: () => fn(),
  };
};
