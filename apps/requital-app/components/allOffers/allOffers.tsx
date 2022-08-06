import { collectionGroup, setDoc, DocumentReference, getDoc, getDocs, doc, deleteDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { auth, firestore } from '../../firebase';

import { Card } from '../card/card';
import { Skeleton } from '../skeleton/skeleton';
import { ActivatedOfferConverter, Business, Offer } from 'requital-converter';

type UIOffers = Offer & {
  company: string,
  isActivated: boolean
}
export function AllOffers() {
  const [offers, setOffers] = useState<UIOffers[]>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getOffers = async () => {
    if (!auth.currentUser) return;

    const query = collectionGroup(
      firestore,
      'offers',
    );

    const data = await getDocs(query);
    const docs = [];

    for (const document of data.docs) {
      const docRef = document.ref;
      const parent = await getDoc<Business>(docRef.parent.parent as DocumentReference<Business>);

      const activatedOffersQuery = doc(firestore, 'users', auth.currentUser.uid, 'activated_offers', document.id).withConverter(ActivatedOfferConverter);

      const activatedOffer = await getDoc(activatedOffersQuery);

      if (!parent.data()) return;

      docs.push({
        ...document.data(),
        id: document.id,
        company: (parent.data() as Business).name,
        isActivated: activatedOffer.exists(),
      });
    }

    setOffers(docs as any);
    setIsLoading(false);
  };

  const markOfferAsActive = async (id: string, active: boolean) => {
    if (!auth.currentUser) return;

    const docRef = doc(firestore, 'users', auth.currentUser.uid, 'activated_offers', id).withConverter(ActivatedOfferConverter);

    if (!active) {
      await setDoc(docRef, {
        originalOfferId: id,
      });
    } else {
      await deleteDoc(docRef);
    }
  };

  useEffect(() => {
    getOffers();
  }, [markOfferAsActive]);

  return (
    <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
      {isLoading && <View style={{ flex: 1, display: 'flex' }}><Skeleton /></View>}
      {offers && offers.map((offer, index) => {
        return (
          <Card
            key={index}
            standOut={offer.company}
            title={offer.description}
            subTitle={`${offer.offerAmount}`}
            style={{ width: '100%', marginTop: 12 }}
            showButton={true}
            buttonFn={() => markOfferAsActive(offer.id, offer.isActivated)}
            buttonText={offer.isActivated ? 'Deactivate offer' : 'Activate offer'}
          ></Card>
        );
      })
      }
    </View>
  );
}
