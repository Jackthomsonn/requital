import { firestore } from 'firebase-admin';
import { ActivatedOffer } from 'requital-converter';

export const offerIsActivated = (userActivatedOffers: firestore.QueryDocumentSnapshot<ActivatedOffer>[], foundOfferId: string) => {
  return function() {
    return userActivatedOffers.some((activatedOffer) => activatedOffer.id === foundOfferId);
  };
};
