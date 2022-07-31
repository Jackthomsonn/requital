export class ActivatedOffer {
  constructor(
    public originalOfferId: string,
  ) {}
}

export const ActivatedOfferConverter = {
  toFirestore(activatedOffer: ActivatedOffer) {
    return { originalOfferId: activatedOffer.originalOfferId };
  },
  fromFirestore(
    snapshot: any,
  ): ActivatedOffer {
    const data = snapshot.data();

    return new ActivatedOffer(data.originalOfferId);
  },
};

