import { firestore } from 'firebase-admin';

export class RedeemedOffer {
  constructor(
    readonly business: string,
    readonly redeemed: boolean,
    readonly offerAmount: number,
    readonly created: string,
    readonly originalOfferId: string,
  ) {}
}

export const RedeemedOfferConverter = {
  toFirestore(offer: RedeemedOffer): firestore.DocumentData {
    return { business: offer.business, redeemed: offer.redeemed, offerAmount: offer.offerAmount, created: offer.created, originalOfferId: offer.originalOfferId };
  },
  fromFirestore(
    snapshot: any,
  ): RedeemedOffer {
    const data = snapshot.data();

    return new RedeemedOffer(data.business, data.redeemed, data.offerAmount, data.created, data.originalOfferId);
  },
};
