import { setAccessToken } from './src/lib/setAccessToken/setAccessToken';
import { createLinkToken } from './src/lib/createLinkToken/createLinkToken';
import { matchOffers } from './src/lib/matchOffers/matchOffers';
import { captureWebhook } from './src/lib/captureWebhook/captureWebhook';
import { createUser } from './src/lib/createUser/createUser';
import * as admin from 'firebase-admin';

admin.initializeApp();
admin.firestore().settings({ ignoreUndefinedProperties: true });

export {
  createLinkToken,
  setAccessToken,
  matchOffers,
  captureWebhook,
  createUser,
};
