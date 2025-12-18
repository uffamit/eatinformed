
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, DocumentData } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";

// Define the shape of your user profile data stored in Firestore
interface UserProfile extends DocumentData {
  uid: string;
  email: string;
  name: string;
  isAnonymous?: boolean;
}

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, userProfile: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only subscribe to auth changes if Firebase auth is initialized
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setLoading(true);
        if (firebaseUser && firestore) {
          // If the user ID is different from the current one, fetch their profile
          if (firebaseUser.uid !== user?.uid) {
            const userDocRef = doc(firestore, "users", firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              setUserProfile(userDoc.data() as UserProfile);
            }
          }
          setUser(firebaseUser);
        } else {
          setUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // If Firebase isn't configured, stop loading and set user to null.
      setLoading(false);
      setUser(null);
      setUserProfile(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]); // Rerun effect only when user UID changes

  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
