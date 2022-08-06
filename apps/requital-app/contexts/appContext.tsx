import { doc, getDoc } from 'firebase/firestore';
import React, { createContext, Dispatch, useContext, useMemo, useState } from 'react';
import { UserConverter } from 'requital-converter';
import { auth, firestore } from '../firebase';

const AppContext = createContext({
  accountIsLinked: false,
  setAccountIsLinked: (isLinked: boolean): any => {},
  setIsLoading: null as unknown as Dispatch<boolean>,
  isLoading: false,
});

export const AppProvider = ({ children }: any) => {
  const [accountIsLinked, setAccountIsLinked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useMemo(() => {
    const userRef = doc(firestore, `users/${auth.currentUser?.uid}`).withConverter(UserConverter);

    getDoc(userRef).then((userDoc) => {
      if (!userDoc?.data()?.accessToken || userDoc.data()?.accessToken === '') {
        setAccountIsLinked(false);
      } else {
        setAccountIsLinked(true);
      }
    });
  }, [auth.currentUser?.uid]);

  return (
    <AppContext.Provider
      value={{
        accountIsLinked,
        isLoading,
        setIsLoading: (isLoading: boolean) => setIsLoading(isLoading),
        setAccountIsLinked: async (isLinked: boolean) => {
          setAccountIsLinked(isLinked);
        },
      }}
    >
      { children }
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
