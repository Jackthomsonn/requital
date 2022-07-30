export class RedeemedOffer {
  constructor(
    public business: string,
    public redeemed: boolean,
    public offerAmount: number,
    public created: string,
    public originalOfferId: string,
  ) {}
}

export const RedeemedOfferConverter = {
  toFirestore(offer: RedeemedOffer) {
    return { business: offer.business, redeemed: offer.redeemed, offerAmount: offer.offerAmount, created: offer.created, originalOfferId: offer.originalOfferId };
  },
  fromFirestore(
    snapshot: any,
  ): RedeemedOffer {
    const data = snapshot.data();

    return new RedeemedOffer(data.business, data.redeemed, data.offerAmount, data.created, data.originalOfferId);
  },
};
