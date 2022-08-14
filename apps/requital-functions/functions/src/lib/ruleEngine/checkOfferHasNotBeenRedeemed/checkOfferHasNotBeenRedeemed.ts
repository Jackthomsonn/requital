import { firestore } from 'firebase-admin';
import { RedeemedOffer } from 'requital-converter';

export const offerHasNotBeenRedeemed = (userRedeemedOffers: firestore.QueryDocumentSnapshot<RedeemedOffer>[], foundOfferId: string) => {
  return function() {
    if (userRedeemedOffers.length === 0) return true;

    return userRedeemedOffers.every((redeemedOffer) => redeemedOffer.data().originalOfferId !== foundOfferId);
  };
};
