import * as admin from 'firebase-admin';

import * as functions from 'firebase-functions';
import { UserConverter } from 'requital-converters';

export const createUser = functions.auth.user().onCreate(async (user) => {
  if (!admin.apps.length) admin.initializeApp();

  const db = admin.firestore();

  try {
    await db.collection('users').withConverter(UserConverter).doc(user.uid).set({
      cursor: '',
    }, { merge: true });
  } catch (error) {
    throw new Error(error as any);
  }
});
