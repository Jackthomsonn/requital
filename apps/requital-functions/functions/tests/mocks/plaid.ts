export const mockPlaid = {
  PlaidEnvironments: {
    development: '',
  },
  Configuration: jest.fn(),
  Products: {
    Auth: 'auth',
    Transactions: 'transactions',
  },
  CountryCode: {
    Gb: 'GB',
  },
  WebhookType: {
    Transactions: 'TRANSACTIONS',
  },
  PlaidApi: jest.fn(() => {
    return {
      linkTokenCreate: (object: any) => {
        return Promise.resolve({
          data: {
            link_token: 'link_token',
          },
        });
      },
      itemPublicTokenExchange: () => {
        return Promise.resolve({
          data: {
            item_id: 'test_item_id',
          },
        });
      },
      transactionsSync: () => {
        return Promise.resolve({
          data: {
            has_more: false,
            next_cursor: 'test-next-cursor',
          },
        });
      },
    };
  }),
};

