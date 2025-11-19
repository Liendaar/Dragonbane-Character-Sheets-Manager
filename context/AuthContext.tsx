/**
 * @file AuthContext.tsx
 * @description This file defines the authentication context for the application.
 * It provides a way to share user authentication status and data across all components,
 * abstracting the underlying Firebase authentication logic.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../services/firebase';
import type { User } from '../types';

/**
 * The shape of the authentication context.
 * @property {User | null} user - The current authenticated user object, or null if not logged in.
 * @property {boolean} loading - True while the authentication status is being determined, false otherwise.
 */
interface AuthContextType {
  user: User | null;
  loading: boolean;
}

/**
 * The React Context object for authentication.
 * It is initialized with a default value of a null user and loading set to true.
 */
const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

/**
 * The provider component that wraps the application and makes authentication data available.
 * It listens for changes in the Firebase authentication state and updates the context value accordingly.
 * @param {object} props - The component props.
 * @param {ReactNode} props.children - The child components to be rendered within the provider.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // This effect runs once on component mount.
  // It sets up a listener to the Firebase authentication state.
  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // If a user is logged in, create a simplified user object for our app state.
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        });
      } else {
        // If no user is logged in, set the user state to null.
        setUser(null);
      }
      // Once the initial check is complete, set loading to false.
      setLoading(false);
    });

    // The cleanup function will be called when the component unmounts.
    // This prevents memory leaks by removing the listener.
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * A custom hook for consuming the authentication context.
 * This provides a simple and clean way for components to access the user and loading state.
 * @returns {AuthContextType} The current authentication context value.
 */
export const useAuth = () => useContext(AuthContext);
