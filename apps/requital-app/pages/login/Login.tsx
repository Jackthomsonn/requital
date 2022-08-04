import { Button, KeyboardAvoidingView, StyleSheet, Text, TextInput } from 'react-native';

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
    justifyContent: 'center',
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
      <KeyboardAvoidingView behavior="padding" style={{ margin: 24 }}>
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
        {errors.email && <Text>This is required.</Text>}

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
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            </>
          )}
          name="password"
        />
        {errors.email && <Text>This is required.</Text>}

        <Button title="Login" onPress={handleSubmit(onSubmit)} />
        <Text onPress={() => navigate('Signup')}>Dont have an account? Sign up here</Text>
      </KeyboardAvoidingView>
    </SafeAreaView >
  );
}
