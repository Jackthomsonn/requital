import { Expo } from 'expo-server-sdk';
import { AxiosError } from 'axios';
import * as admin from 'firebase-admin';

import * as functions from 'firebase-functions';
import { UserConverter } from 'requital-converter';

export const triggerNotification = functions.runWith({ ingressSettings: 'ALLOW_ALL' }).https.onRequest(async (request, response) => {
  if (!admin.apps.length) admin.initializeApp();

  const db = admin.firestore();

  try {
    const user = await db.collection('users').withConverter(UserConverter).doc(request.body.userID).get();
    const expo = new Expo();
    const token = user.data()?.pushToken;

    if (!token) throw new Error('No token found');

    const status = await expo.sendPushNotificationsAsync([{
      to: [token],
      title: 'You have been matched with new offers!',
      body: 'You have new requital points woo hoo!',
    }]);

    response.status(200).json({ status: 'success', data: status[0].status });
  } catch (error) {
    console.log(error);
    response.status(500).send({
      status: 'error',
      error: (error as AxiosError).response?.data,
    });
  }
});
