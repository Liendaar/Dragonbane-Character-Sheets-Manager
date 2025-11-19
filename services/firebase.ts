/**
 * @file firebase.ts
 * @description This file initializes and configures the Firebase app instance.
 * It exports the core Firebase services like Authentication and Firestore
 * so they can be used throughout the application.
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Firebase configuration object.
 * The values are sourced from environment variables (VITE_FIREBASE_*)
 * to keep sensitive credentials secure and configurable.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};


// Initialize the Firebase app with the configuration.
const app = initializeApp(firebaseConfig);

/**
 * The Firebase Authentication service instance.
 * Used for managing user authentication (e.g., login, logout, user sessions).
 */
export const auth = getAuth(app);

/**
 * The Cloud Firestore database service instance.
 * Used for all database operations (e.g., reading, writing, updating documents).
 */
export const db = getFirestore(app);
