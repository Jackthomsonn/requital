import { Dimensions } from 'react-native';

import { Buffer } from 'buffer';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { auth } from '../../firebase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../contexts/appContext';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import PlaidLink from '../expo-plaid-link/Index';
import Constants from 'expo-constants';

global.Buffer = Buffer;

type ParamList = {
  Params: {
    nextFlowUri: string;
  };
};

export function BankOnboard() {
  const [linkToken, setLinkToken] = useState(null);

  const { navigate } = useNavigation<any>();
  const { params } = useRoute<RouteProp<ParamList, 'Params'>>();

  const { setAccountIsLinked, accountIsLinked } = useApp();

  const generateToken = async () => {
    const response = await fetch(
      `${Constants.manifest?.extra?.functionUrl}/createLinkToken`,
      {
        method: 'POST',
        body: JSON.stringify({
          userId: auth.currentUser?.uid,
        }),
      },
    );

    const data = await response.json();

    setLinkToken(data.link_token);
  };

  const onSuccess = useCallback(
    async (success: {
      publicToken: string;
      nextFlowReady: boolean;
      nextFlowUri: string;
    }) => {
      if (success.nextFlowReady) {
        navigate('Onboarding-Next', { nextFlowUri: success.nextFlowUri });
        return;
      }

      await fetch(
        `${Constants.manifest?.extra?.functionUrl}/setAccessToken`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            public_token: success.publicToken,
            uid: auth.currentUser?.uid,
          }),
        },
      );

      setAccountIsLinked(true);

      setTimeout(() => navigate('Home'), 2000);
    },
    [],
  );

  useEffect(() => {
    if (accountIsLinked) navigate('Home');

    generateToken();
  }, [accountIsLinked]);

  return linkToken || params?.nextFlowUri ? (
    <SafeAreaView
      style={{
        display: 'flex',
        flex: 1,
        width: Dimensions.get('window').width,
        backgroundColor: '#FFF',
      }}
    >
      <PlaidLink
        linkToken={linkToken}
        uri={params?.nextFlowUri}
        onSuccess={onSuccess}
      />
    </SafeAreaView>
  ) : null;
}
