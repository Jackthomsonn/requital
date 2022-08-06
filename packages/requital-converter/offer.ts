import * as admin from 'firebase-admin';

export class Offer {
  constructor(
    readonly description: string,
    readonly offerAmount: number,
    readonly threshold: number,
  ) {}
}

export const OfferConverter = {
  toFirestore(offer: Offer): admin.firestore.DocumentData {
    return { description: offer.description, offerAmount: offer.offerAmount, threshold: offer.threshold };
  },
  fromFirestore(
    snapshot: admin.firestore.QueryDocumentSnapshot,
  ): Offer {
    const data = snapshot.data();

    return new Offer(data.description, data.offerAmount, data.threshold);
  },
};

