import * as admin from 'firebase-admin';

import * as functions from 'firebase-functions';
import { UserConverter } from 'requital-converter';

export const createUser = functions.runWith({ ingressSettings: 'ALLOW_ALL' }).auth.user().onCreate(async (user) => {
  if (!admin.apps.length) admin.initializeApp();

  const db = admin.firestore();

  try {
    await db.collection('users').withConverter(UserConverter).doc(user.uid).set({
      cursor: '',
      accessToken: '',
      itemID: '',
      pushToken: '',
    });
  } catch (error) {
    throw new Error(error as any);
  }
});
