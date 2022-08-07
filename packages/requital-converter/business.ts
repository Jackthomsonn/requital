import { firestore } from 'firebase-admin';

export class Business {
  constructor(
    readonly name: string,
  ) {}
}

export const BusinessConverter = {
  toFirestore(business: Business): firestore.DocumentData {
    return { name: business.name };
  },
  fromFirestore(
    snapshot: firestore.QueryDocumentSnapshot,
  ): Business {
    const data = snapshot.data();

    return new Business(data.name);
  },
};
