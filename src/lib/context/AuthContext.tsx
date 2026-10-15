"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, ScreenPermissions, ScreenAccessLevel } from "@/types";
import { dataStore } from "@/lib/services/dataService";
import { signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase/config";

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
          const registeredUsers = dataStore.getUsers();
          let matched = registeredUsers.find(u => u.email.toLowerCase() === email && u.isActive);

          if (!matched && email === "szbutman7@gmail.com") {
            const ownerUser: UserProfile = {
              id: "user-szbutman7",
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
              }
            };
            await dataStore.addUser(ownerUser);
            matched = ownerUser;
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

      // Check Whitelist
      const registeredUsers = dataStore.getUsers();
      let matched = registeredUsers.find(u => u.email.toLowerCase() === email && u.isActive);

      // Failsafe: primary administrator szbutman7@gmail.com is always authorized as SUPER_ADMIN
      if (!matched && email === "szbutman7@gmail.com") {
        const ownerUser: UserProfile = {
          id: "user-szbutman7",
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
          }
        };
        await dataStore.addUser(ownerUser);
        matched = ownerUser;
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
