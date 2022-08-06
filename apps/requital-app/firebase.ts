import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import Constants from 'expo-constants';

const app = initializeApp({
  apiKey: 'AIzaSyCuvx2-ojSjN-48VJPI4tk6KtdFdkh1uCo',
  authDomain: 'requital-39e1f.firebaseapp.com',
  projectId: 'requital-39e1f',
  storageBucket: 'requital-39e1f.appspot.com',
  messagingSenderId: '824640626132',
  appId: '1:824640626132:web:0d5697fb9dee444f258a41',
  measurementId: 'G-0X982VHQ2B',
});

const firestore = getFirestore(app);
const auth = getAuth(app);

if (Constants.manifest?.extra?.environment === 'local') {
  connectFirestoreEmulator(firestore, '192.168.0.44', 8080);

  connectAuthEmulator(auth, 'http://192.168.0.44:9099');
}


export { firestore, auth };
