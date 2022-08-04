export class User {
  constructor(
    public accessToken?: string,
    public itemID?: string,
    public cursor?: string,
    public pushToken?: string,
  ) {}
}

export const UserConverter = {
  toFirestore(user: User) {
    return { accessToken: user.accessToken, itemID: user.itemID, cursor: user.cursor, pushToken: user.pushToken };
  },
  fromFirestore(
    snapshot: {data: () => User},
  ): User {
    const data = snapshot.data();

    return new User(data.accessToken, data.itemID, data.cursor, data.pushToken);
  },
};
