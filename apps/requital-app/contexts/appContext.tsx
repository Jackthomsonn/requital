import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, Dispatch, useContext, useState } from 'react';

const AppContext = createContext({
  accountIsLinked: false,
  setAccountIsLinked: null as unknown as Dispatch<any>,
  setIsLoading: null as unknown as Dispatch<any>,
  isLoading: false,
});

export const AppProvider = ({ children }: any) => {
  const [accountIsLinked, setAccountIsLinked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  AsyncStorage.getItem('accountIsLinked').then((isLinked) => {
    if (isLinked) setAccountIsLinked(Boolean(isLinked));
  });

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
