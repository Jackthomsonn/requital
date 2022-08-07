import { Image, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import React, { useMemo } from 'react';

import { YourOverview } from '../../components/yourOverview/yourOverview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AllOffers } from '../../components/allOffers/allOffers';
import { Variables } from '../../Variables';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, firestore } from '../../firebase';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { UserConverter } from 'requital-converter';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
  mainView: {
    display: 'flex',
    flex: 1,
    margin: 24,
  },
  title: {
    color: Variables.secondary,
    fontWeight: '700',
    fontSize: 28,
  },
  subTitle: {
    color: Variables.secondary,
    fontWeight: '500',
    fontSize: 14,
  },
});

export function HomeScreen() {
  useMemo(() => {
    if (!auth || !auth.currentUser) return;

    registerForPushNotificationsAsync().then(async (token) => {
      if (token) {
        const user = doc(firestore, 'users', auth?.currentUser?.uid as string).withConverter(UserConverter);

        await updateDoc(user, { pushToken: token });
      }
    });
  }, [auth.currentUser]);
  return (
    <SafeAreaView style={styles.host}>
      <ScrollView style={styles.mainView} showsVerticalScrollIndicator={false}>
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Text style={{ ...styles.title, marginBottom: 24 }}>Offers overview</Text>
          {
            auth.currentUser &&
            auth.currentUser.photoURL &&
            <Image source={{ uri: auth.currentUser.photoURL, width: 40, height: 40 }} style={{ borderRadius: 100 }} />
          }
        </View>
        <View>
          <YourOverview />
        </View>

        <View style={{ marginTop: 24 }}>
          <Text style={styles.title}>Offers available to you</Text>
          <AllOffers />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}
