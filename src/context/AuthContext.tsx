"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/config/firebase";
import { getDocument } from "@/config/db";
import { useRouter, usePathname } from "next/navigation";

// Define the User Profile as stored in Firestore
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "team_leader" | "agent";
  teamId?: string;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

const PUBLIC_ROUTES = ["/login", "/forgot-password", "/signup"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          // Fetch the extended user profile from Firestore
          const userProfile = await getDocument<Omit<UserProfile, 'id'>>("users", firebaseUser.uid);
          if (userProfile && userProfile.isActive) {
            setProfile(userProfile as UserProfile);
          } else {
            // User exists in Auth but not in Firestore or is inactive
            console.warn("User profile not found or inactive.");
            await firebaseSignOut(auth);
            setUser(null);
            setProfile(null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Basic Route Protection
  useEffect(() => {
    if (!loading) {
      const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
      if (!user && !isPublicRoute) {
        // Redirect unauthenticated users to login
        router.push("/login");
      } else if (user && isPublicRoute) {
        // Redirect authenticated users trying to access login page to dashboard
        router.push("/dashboard");
      }
    }
  }, [user, loading, pathname, router]);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Hook to use the Auth context securely
export function useAuth() {
  return useContext(AuthContext);
}
