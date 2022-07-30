import { setStatusBarHidden } from 'expo-status-bar';
import { decode, encode } from 'base-64';

import React, { useState } from 'react';
import { SplashScreen } from './pages/splash/Splash';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AppProvider, useApp } from './contexts/appContext';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { BankOnboard } from './components/bankOnboard/bankOnboard';
import { LoginScreen } from './pages/login/Login';
import { HomeScreen } from './pages/home/Home';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogBox } from 'react-native';

if (!global.btoa) global.btoa = encode;

if (!global.atob) global.atob = decode;

const Stack = createStackNavigator();

export default function App() {
  const [isLoggedIn, setisLoggedIn] = useState(false);
  const { setIsLoading, isLoading } = useApp();

  // signOut(auth);

  // eslint-disable-next-line max-len
  LogBox.ignoreLogs(['AsyncStorage has been extracted from react-native core and will be removed in a future release. It can now be installed and imported from \'@react-native-async-storage/async-storage\' instead of \'react-native\'. See https://github.com/react-native-async-storage/async-storage']);

  // AsyncStorage.clear();
  // AsyncStorage.setItem("accountIsLinked", "true");

  onAuthStateChanged(auth, async (user: User | null) => {
    if (!user) return;

    setisLoggedIn(user !== null);
    setIsLoading && setIsLoading(false);
  });

  setStatusBarHidden(true, 'none');

  return (
    <NavigationContainer>
      <AppProvider>
        <Stack.Navigator initialRouteName="Login">
          {isLoading && (
            <Stack.Screen
              name="Splash"
              component={SplashScreen}
              options={{ headerShown: false }}
            />
          )}
          {!isLoggedIn && (
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
          )}

          <Stack.Screen
            name="Onboarding"
            component={BankOnboard}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Onboarding-Next"
            component={BankOnboard}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </AppProvider>
    </NavigationContainer>
  );
}
