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
        expect(object).toEqual({
          user: { client_user_id: 'test-user' },
          client_name: 'Requital App',
          products: ['auth', 'transactions'],
          language: 'en',
          webhook: `${process.env.WEBHOOK_URL}/captureWebhook`,
          redirect_uri: 'https://create-react-app-gold-zeta-41.vercel.app',
          country_codes: ['GB'],
        });
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

