import * as AuthSession from 'expo-auth-session';
import {
  Image,
  View,
  Button,
  StyleSheet,
  Text,
  SafeAreaView,
} from 'react-native';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import React, { useEffect } from 'react';
import { Variables } from '../../Variables';
import { useAuthRequest } from 'expo-auth-session/providers/google';
import { auth } from '../../firebase';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: Variables.white,
  },
  imageContainer: {
    backgroundColor: Variables.primary,
    display: 'flex',
    padding: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: Variables.white,
    borderWidth: 1,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 4,
  },
});

export function LoginScreen() {
  const [_, response, promptAsync] = useAuthRequest({
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: AuthSession.makeRedirectUri({ native: 'requital://', useProxy: true }),
  });

  useEffect(() => {
    if (
      response?.type === 'success' &&
      response.authentication?.accessToken &&
      response.authentication.idToken
    ) {
      try {
        loginWithFirebase(
          response.authentication.idToken,
          response.authentication.accessToken,
        );
      } catch (e) {
        console.log(e);
      }
    }
  }, [response]);

  const signInWithGoogle = async () => await promptAsync({ useProxy: true });

  const loginWithFirebase = async (idToken: string, accessToken: string) => {
    const credential = GoogleAuthProvider.credential(idToken, accessToken);

    await signInWithCredential(auth, credential);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, marginLeft: 24, marginRight: 24, marginTop: 48 }}>
        <Text
          style={{
            color: Variables.secondary,
            fontSize: 26,
            fontWeight: '500',
            textAlign: 'center',
          }}
        >
          First step, lets get you an account!
        </Text>
        <Text
          style={{
            color: Variables.secondary,
            fontSize: 16,
            fontWeight: '300',
            textAlign: 'center',
            marginTop: 12,
          }}
        >
          Requital is the next generation reward platform that rewards customers
          without consumers having to do anything. Shop as normal and watch your
          account get automatically refunded by your favourite brands!
        </Text>
      </View>
      <View style={{ flex: 2 }}>
        <Image
          source={require('../../assets/undraw_make_it_rain_iwk4.png')}
          style={{ width: 200, height: 200 }}
        ></Image>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.imageContainer}>
          <Image
            style={styles.logo}
            source={require('../../assets/google.png')}
          />
          <Button
            onPress={signInWithGoogle}
            title="Login with Google"
            color={Variables.white}
          ></Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
