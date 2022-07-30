export class User {
  constructor(
    public accessToken: string,
    public itemID: string,
    public cursor?: string,
  ) {}
}

export const UserConverter = {
  toFirestore(user: User) {
    return { accessToken: user.accessToken, cursor: user.cursor, itemID: user.itemID };
  },
  fromFirestore(
    snapshot: any,
  ): User {
    const data = snapshot.data();

    return new User(data.accessToken, data.cursor, data.itemID);
  },
};
