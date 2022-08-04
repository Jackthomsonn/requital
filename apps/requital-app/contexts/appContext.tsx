import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc } from 'firebase/firestore';
import React, { createContext, Dispatch, useContext, useState } from 'react';
import { UserConverter } from 'requital-converter';
import { auth, firestore } from '../firebase';

const AppContext = createContext({
  accountIsLinked: false,
  setAccountIsLinked: null as unknown as Dispatch<any>,
  setIsLoading: null as unknown as Dispatch<any>,
  isLoading: false,
});

export const AppProvider = ({ children }: any) => {
  const [accountIsLinked, setAccountIsLinked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  const userRef = doc(firestore, `users/${auth.currentUser?.uid}`).withConverter(UserConverter);
  getDoc(userRef).then(userDoc => {
    AsyncStorage.getItem('accountIsLinked').then((isLinked) => {
      if (isLinked || userDoc.data()?.accessToken) setAccountIsLinked(true);
    });
  })

  return (
    <AppContext.Provider
      value={{
        accountIsLinked,
        isLoading,
        setIsLoading: (isLoading: boolean) => setIsLoading(isLoading),
        setAccountIsLinked: async (isLinked) => {
          await AsyncStorage.setItem('accountIsLinked', String(isLinked));
          setAccountIsLinked(isLinked);
        },
      }}
    >
      { children }
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
