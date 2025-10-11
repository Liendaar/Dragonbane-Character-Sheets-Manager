import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBy8_tbrP8N37ki7L7nvb2e5a6E1ixmJA0",
  authDomain: "dragonbane-character-sheet.firebaseapp.com",
  projectId: "dragonbane-character-sheet",
  storageBucket: "dragonbane-character-sheet.appspot.com",
  messagingSenderId: "495188862487",
  appId: "1:495188862487:web:c34a4653130fdb35051e52",
  measurementId: "G-NMQJX3JWZP"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
