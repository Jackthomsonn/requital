import { setStatusBarHidden } from 'expo-status-bar';
import { decode, encode } from 'base-64';

import React, { useState } from 'react';
import { SplashScreen } from './pages/splash/Splash';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AppProvider, useApp } from './contexts/appContext';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { BankOnboard } from './components/bankOnboard/bankOnboard';
import { LoginScreen } from './pages/login/Login';
import { HomeScreen } from './pages/home/Home';
import { SignupScreen } from './pages/signup/signup';

if (!global.btoa) global.btoa = encode;

if (!global.atob) global.atob = decode;

const Stack = createStackNavigator();

export default function App() {
  const [isLoggedIn, setisLoggedIn] = useState(false);
  const { setIsLoading, isLoading, accountIsLinked } = useApp();

  // signOut(auth);

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
            <>
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Signup"
                component={SignupScreen}
                options={{ headerShown: false }}
              />
            </>
          )}

          {isLoggedIn && !accountIsLinked && (
            <>
              <Stack.Screen
                name="Onboarding"
                component={BankOnboard}
                options={{ headerShown: false }}
              />
            </>
          )}

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
