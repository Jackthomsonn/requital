import { Button, Image, KeyboardAvoidingView, StyleSheet, Text, TextInput, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller, useForm } from 'react-hook-form';
import { Variables } from '../../Variables';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import React from 'react';

const styles = StyleSheet.create({
  host: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Variables.white,
  },
  input: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
    marginTop: 12,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  errorText: {
    color: Variables.secondary,
    fontWeight: '700',
    marginBottom: 24,
  },
  button: {
    backgroundColor: Variables.primary,
    borderRadius: 4,
  },
});

export function LoginScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const { navigate } = useNavigation<any>();

  const onSubmit = async (data: {email: string, password: string}) => {
    try {
      await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );
    } catch (e) {
      alert(e);
    }
  };

  return (
    <SafeAreaView style={styles.host}>
      <KeyboardAvoidingView behavior="padding" style={{ margin: 24, display: 'flex', flex: 1 }}>
        <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <Image source={require('../../assets/icon.png')} style={{ width: 120, height: 120, borderRadius: 14, display: 'flex' }} />
        </View>
        <View style={{ flex: 2 }}>
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <Text>Email</Text>
                <TextInput
                  textContentType='emailAddress'
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              </>
            )}
            name="email"
          />
          {errors.email && <Text style={{ marginBottom: 12, fontWeight: '700', color: Variables.secondary }}>This is required.</Text>}

          <Controller
            control={control}
            rules={{
              maxLength: 100,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <Text>Password</Text>
                <TextInput
                  textContentType='password'
                  secureTextEntry={true}
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              </>
            )}
            name="password"
          />
          {errors.email && <Text style={{ marginBottom: 12, fontWeight: '700', color: Variables.secondary }}>This is required.</Text>}


          <View style={{ backgroundColor: Variables.primary, borderRadius: 8, padding: 6 }}>
            <Button color={Variables.white} title="Login" onPress={handleSubmit(onSubmit)} />
          </View>
          <Text style={{ textAlign: 'center', marginTop: 16, fontWeight: '700', color: Variables.secondary }} onPress={() => navigate('Signup')}>Dont have an account? Sign up</Text>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView >
  );
}
