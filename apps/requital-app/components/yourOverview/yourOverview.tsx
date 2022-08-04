import { onSnapshot, collection } from 'firebase/firestore';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Offer, RedeemedOffer, RedeemedOfferConverter } from 'requital-converter';
import { useApp } from '../../contexts/appContext';
import { firestore, auth } from '../../firebase';

import { Card } from '../card/card';

export function YourOverview() {
  const [redeemedOffers, setRedeemedOffers] = useState<RedeemedOffer[]>([]);
  const { setIsLoading } = useApp();

  const getRedeemedOffers = () => {
    setIsLoading(true);

    onSnapshot(
      collection(
        firestore,
        'users',
        `${auth.currentUser?.uid}`,
        'redeemed_offers',
      ).withConverter(RedeemedOfferConverter),
      (snapshot) => {
        const redeemedOffers: RedeemedOffer[] = [];
        const docs = snapshot.docs;

        if (!docs) return;

        docs.forEach((doc) => redeemedOffers.push(doc.data()));

        setRedeemedOffers(redeemedOffers);

        setIsLoading(false);
      },
    );
  };

  useMemo(() => {
    getRedeemedOffers();
  }, []);

  return (
    <>
      <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <Card
          subTitle={`Since joining Requital you have matched ${redeemedOffers.length} offers`}
          style={{ width: '49%' }}
        ></Card>
        <Card
          subTitle={`That amounts to £${redeemedOffers.map(a => a.offerAmount).reduce((prev, cur) => (prev + cur), 0) / 100} worth of savings`}
          style={{ width: '49%' }}
        ></Card>
      </View>
      <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Card
          title={'Your requital points'}
          subTitle={`${redeemedOffers.map(a => a.offerAmount).reduce((prev, cur) => (prev + cur), 0)}`}
          style={{ width: '100%', marginTop: 12 }}
          showButton={true}
          buttonText="Redeem Requital Points"
        ></Card>
      </View>
    </>
  );
}
