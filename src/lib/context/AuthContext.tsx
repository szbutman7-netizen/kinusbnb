"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, ScreenPermissions, ScreenAccessLevel } from "@/types";
import { dataStore } from "@/lib/services/dataService";
import { signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase/config";
import { INITIAL_USERS } from "@/lib/services/mockData";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  loginWithGoogle: () => Promise<{ success: boolean; message: string }>;
  loginAsDemoUser: (role: "SUPER_ADMIN" | "HOUSING_MANAGER" | "RECEPTION_STAFF") => void;
  logout: () => Promise<void>;
  hasAccess: (screen: keyof ScreenPermissions, requiredLevel?: ScreenAccessLevel) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser && fbUser.email) {
          const email = fbUser.email.toLowerCase();
          
          let matched: UserProfile | null = null;
          if (email === "szbutman7@gmail.com") {
            matched = {
              id: fbUser.uid || "user-szbutman7",
              email: "szbutman7@gmail.com",
              displayName: fbUser.displayName || "זלמן בוטמן (מנהל ראשי)",
              role: "SUPER_ADMIN",
              isActive: true,
              screenAccess: {
                shluchim: "EDIT",
                apartments: "EDIT",
                placement: "EDIT",
                reception: "EDIT",
                emails: "EDIT",
                users: "EDIT",
                audit: "EDIT",
              }
            };
          } else {
            // Check Firestore for user profile
            try {
              if (db) {
                const userSnap = await getDoc(doc(db, "users", fbUser.uid));
                if (userSnap.exists()) {
                  const data = userSnap.data() as UserProfile;
                  if (data.isActive) matched = { ...data, id: fbUser.uid };
                }
              }
            } catch (err) {
              console.warn("Firestore user profile check fallback:", err);
            }

            // Fallback: check INITIAL_USERS
            if (!matched) {
              const fromInitial = INITIAL_USERS.find(u => u.email.toLowerCase() === email && u.isActive);
              if (fromInitial) {
                matched = { ...fromInitial, id: fbUser.uid };
              }
            }
          }

          if (matched) {
            setUser(matched);
            localStorage.setItem("kinus_auth_user", JSON.stringify(matched));
            dataStore.startStaffSync();
          } else {
            setUser(null);
            localStorage.removeItem("kinus_auth_user");
            dataStore.stopStaffSync();
          }
        } else {
          // No active Firebase session
          const savedUser = localStorage.getItem("kinus_auth_user");
          if (savedUser && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
            try {
              setUser(JSON.parse(savedUser));
            } catch {
              setUser(null);
              localStorage.removeItem("kinus_auth_user");
            }
          } else {
            setUser(null);
            localStorage.removeItem("kinus_auth_user");
            dataStore.stopStaffSync();
          }
        }
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else {
      const savedUser = localStorage.getItem("kinus_auth_user");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      }
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = async (): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email?.toLowerCase();

      if (!email) {
        return { success: false, message: "לא התקבל אימייל מחשבון Google" };
      }

      // Check Whitelist against Firestore and INITIAL_USERS (prevent localStorage spoofing)
      let matched: UserProfile | null = null;
      if (email === "szbutman7@gmail.com") {
        matched = {
          id: result.user.uid || "user-szbutman7",
          email: "szbutman7@gmail.com",
          displayName: result.user.displayName || "זלמן בוטמן (מנהל ראשי)",
          role: "SUPER_ADMIN",
          isActive: true,
          screenAccess: {
            shluchim: "EDIT",
            apartments: "EDIT",
            placement: "EDIT",
            reception: "EDIT",
            emails: "EDIT",
            users: "EDIT",
            audit: "EDIT",
          }
        };
        try {
          if (db && result.user.uid) {
            await setDoc(doc(db, "users", result.user.uid), matched, { merge: true });
          }
        } catch (e) {
          console.warn("Could not sync owner user to firestore:", e);
        }
      } else {
        // Query Firestore /users/{uid}
        try {
          if (db) {
            const userSnap = await getDoc(doc(db, "users", result.user.uid));
            if (userSnap.exists()) {
              const data = userSnap.data() as UserProfile;
              if (data.isActive) matched = { ...data, id: result.user.uid };
            }
          }
        } catch (err) {
          console.warn("Firestore user profile check in loginWithGoogle fallback:", err);
        }

        // Fallback: INITIAL_USERS
        if (!matched) {
          const fromInitial = INITIAL_USERS.find(u => u.email.toLowerCase() === email && u.isActive);
          if (fromInitial) {
            matched = { ...fromInitial, id: result.user.uid };
            try {
              if (db && result.user.uid) {
                await setDoc(doc(db, "users", result.user.uid), matched, { merge: true });
              }
            } catch (e) {
              // ignore
            }
          }
        }
      }

      if (!matched) {
        await fbSignOut(auth);
        return { 
          success: false, 
          message: `כתובת הדוא"ל (${email}) אינה מורשית לגישה למערכת. נא לפנות למנהל המערכת.` 
        };
      }

      // Sync display name if user has one in Google account
      if (result.user.displayName && matched.email === "szbutman7@gmail.com" && matched.displayName !== result.user.displayName) {
        matched.displayName = result.user.displayName;
      }

      // Update lastLogin
      await dataStore.updateUser(matched.id, { 
        displayName: matched.displayName,
        lastLoginAt: new Date().toISOString() 
      });
      setUser(matched);
      localStorage.setItem("kinus_auth_user", JSON.stringify(matched));
      return { success: true, message: `ברוך הבא, ${matched.displayName}` };
    } catch (error: any) {
      console.warn("Google Sign-In fallback/cancelled:", error);
      return { success: false, message: error.message || "ההתחברות בוטלה או נכשלה" };
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemoUser = (role: "SUPER_ADMIN" | "HOUSING_MANAGER" | "RECEPTION_STAFF") => {
    const demoUser = dataStore.getUsers().find(u => u.role === role) || dataStore.getUsers()[0];
    if (demoUser) {
      setUser(demoUser);
      localStorage.setItem("kinus_auth_user", JSON.stringify(demoUser));
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      // ignore
    }
    dataStore.stopStaffSync();
    setUser(null);
    localStorage.removeItem("kinus_auth_user");
  };

  const hasAccess = (screen: keyof ScreenPermissions, requiredLevel: ScreenAccessLevel = "VIEW"): boolean => {
    if (!user) return false;
    if (user.role === "SUPER_ADMIN") return true;

    const currentLevel = user.screenAccess?.[screen] ?? "NONE";
    if (currentLevel === "NONE") return false;
    if (requiredLevel === "EDIT" && currentLevel !== "EDIT") return false;
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginWithGoogle, loginAsDemoUser, logout, hasAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
