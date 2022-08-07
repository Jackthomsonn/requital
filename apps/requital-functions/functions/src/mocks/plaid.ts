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
    Gb: 'gb',
  },
  WebhookType: {
    Transactions: 'transactions',
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
          country_codes: ['gb'],
        });
        return Promise.resolve({
          data: {
            link_token: 'link_token',
          },
        });
      },
      itemPublicTokenExchange: (object: any) => {
        // expect(object).toEqual({
        //   public_token: options.itemPublicTokenExchange.public_token,
        // });
        return Promise.resolve({
          data: {
            item_id: 'test_item_id',
          },
        });
      },
    };
  }),
};

