export class Business {
  constructor(
    public name: string,
  ) {}
}

export const BusinessConverter = {
  toFirestore(business: Business) {
    return { name: business.name };
  },
  fromFirestore(
    snapshot: any,
  ): Business {
    const data = snapshot.data();

    return new Business(data.name);
  },
};
