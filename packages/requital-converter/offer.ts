export class Offer {
  constructor(
    public description: string,
    public offerAmount: number,
    public threshold: number,
  ) {}
}

export const OfferConverter = {
  toFirestore(offer: Offer) {
    return { description: offer.description, offerAmount: offer.offerAmount, threshold: offer.threshold };
  },
  fromFirestore(
    snapshot: any,
  ): Offer {
    const data = snapshot.data();

    return new Offer(data.description, data.offerAmount, data.threshold);
  },
};

