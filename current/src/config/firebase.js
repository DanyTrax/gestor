import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyB1ddVOczgt5n2NkoIq3H_5x_eB0Aqw2HI",
  authDomain: "alojamientos-3c46b.firebaseapp.com",
  projectId: "alojamientos-3c46b",
  storageBucket: "alojamientos-3c46b.appspot.com",
  messagingSenderId: "858434059981",
  appId: "1:858434059981:web:f235cea133b874f985b384"
};

const appId = "alojamientos-3c46b";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

export { app, auth, db, functions, storage, appId };


