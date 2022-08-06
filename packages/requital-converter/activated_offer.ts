import * as admin from 'firebase-admin';

export class ActivatedOffer {
  constructor(
    readonly originalOfferId: string,
  ) {}
}

export const ActivatedOfferConverter = {
  toFirestore(activatedOffer: ActivatedOffer): admin.firestore.DocumentData {
    return { originalOfferId: activatedOffer.originalOfferId };
  },
  fromFirestore(
    snapshot: any,
  ): ActivatedOffer {
    const data = snapshot.data();

    return new ActivatedOffer(data.originalOfferId);
  },
};
