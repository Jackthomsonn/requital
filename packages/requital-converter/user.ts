import * as admin from 'firebase-admin';

export class User {
  constructor(
    readonly accessToken: string,
    readonly itemID: string,
    readonly cursor: string,
    readonly pushToken: string,
  ) {}
}

export const UserConverter = {
  toFirestore(user: User): admin.firestore.DocumentData {
    return { accessToken: user.accessToken, itemID: user.itemID, cursor: user.cursor, pushToken: user.pushToken };
  },
  fromFirestore(
    snapshot: any,
  ): User {
    const data = snapshot.data();

    return new User(data.accessToken, data.itemID, data.cursor, data.pushToken);
  },
};
