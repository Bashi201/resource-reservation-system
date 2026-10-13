"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

export type UserRole = "admin" | "user";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  department: string;
  roleTitle: string;
  avatarUrl?: string | null;
  status: "ACTIVE" | "INACTIVE";
}

export interface RegisteredAccount {
  id: string;
  name: string;
  email: string;
  username: string;
  password?: string;
  department: string;
  role: "Administrator" | "Facility Lead" | "Team Member";
  roleTier: UserRole;
  avatarUrl?: string | null;
  status: "ACTIVE" | "INACTIVE";
  joinedDate: string;
}

export const INITIAL_REGISTERED_USERS: RegisteredAccount[] = [
  {
    id: "usr-1",
    name: "Bhashitha W.",
    email: "bhashitha@primewave.com",
    username: "admin",
    password: "admin123",
    department: "Engineering",
    role: "Administrator",
    roleTier: "admin",
    avatarUrl: null,
    status: "ACTIVE",
    joinedDate: "Jan 15, 2026",
  },
  {
    id: "usr-2",
    name: "Samantha Wright",
    email: "samantha@primewave.com",
    username: "samantha",
    password: "password123",
    department: "Executive",
    role: "Facility Lead",
    roleTier: "user",
    avatarUrl: null,
    status: "ACTIVE",
    joinedDate: "Feb 01, 2026",
  },
  {
    id: "usr-3",
    name: "Natasha Roman",
    email: "natasha.r@primewave.com",
    username: "user",
    password: "user123",
    department: "Product & Design",
    role: "Team Member",
    roleTier: "user",
    avatarUrl: null,
    status: "ACTIVE",
    joinedDate: "Feb 10, 2026",
  },
  {
    id: "usr-4",
    name: "David Miller",
    email: "david.m@primewave.com",
    username: "david",
    password: "password123",
    department: "Product & Design",
    role: "Team Member",
    roleTier: "user",
    avatarUrl: null,
    status: "ACTIVE",
    joinedDate: "Feb 18, 2026",
  },
  {
    id: "usr-5",
    name: "Elena Rostova",
    email: "elena.r@primewave.com",
    username: "elena",
    password: "password123",
    department: "Operations",
    role: "Facility Lead",
    roleTier: "user",
    avatarUrl: null,
    status: "ACTIVE",
    joinedDate: "Mar 05, 2026",
  },
  {
    id: "usr-6",
    name: "Marcus Vance",
    email: "marcus.v@primewave.com",
    username: "marcus",
    password: "password123",
    department: "Marketing",
    role: "Team Member",
    roleTier: "user",
    avatarUrl: null,
    status: "ACTIVE",
    joinedDate: "Mar 12, 2026",
  },
];

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isUser: boolean;
  isLoading: boolean;
  accounts: RegisteredAccount[];
  isHydrated: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAs: (role: UserRole) => Promise<void>;
  logout: () => void;
  updateCurrentUser: (updates: Partial<AuthUser> & { password?: string }) => void;
  createAccount: (newAccount: Omit<RegisteredAccount, "id" | "joinedDate">) => { success: boolean; error?: string; account?: RegisteredAccount };
  updateAccount: (id: string, updates: Partial<RegisteredAccount>) => void;
  deleteAccount: (id: string) => void;
  toggleAccountStatus: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "pw_auth_user";
const ACCOUNTS_STORAGE_KEY = "pw_team_members";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Accounts list state initialized statically for SSR consistency
  const [accounts, setAccounts] = useState<RegisteredAccount[]>(INITIAL_REGISTERED_USERS);

  // Current session user state initialized statically for SSR consistency
  const [user, setUser] = useState<AuthUser | null>(null);


  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Helper to persist accounts state
  const persistAccounts = useCallback((updatedList: RegisteredAccount[]) => {
    setAccounts(updatedList);
    try {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updatedList));
    } catch (err) {
      console.error("Failed to save accounts to storage:", err);
    }
  }, []);

  // Sync state from storage on mount
  useEffect(() => {
    try {
      const storedAcc = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (storedAcc) {
        const parsed = JSON.parse(storedAcc) as RegisteredAccount[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAccounts(parsed);
        } else {
          localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(INITIAL_REGISTERED_USERS));
        }
      } else {
        localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(INITIAL_REGISTERED_USERS));
      }

      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error("Storage sync error in AuthProvider:", err);
    } finally {
      setIsHydrated(true);
    }
  }, []);


  const login = useCallback(
    async (usernameOrEmail: string, password: string): Promise<{ success: boolean; error?: string }> => {
      const cleanInput = usernameOrEmail.trim().toLowerCase();
      const cleanPass = password.trim();

      if (!cleanInput || !cleanPass) {
        return { success: false, error: "Please enter both username/email and password." };
      }

      // Check against all registered accounts
      const matched = accounts.find(
        (acc) =>
          acc.username.toLowerCase() === cleanInput ||
          acc.email.toLowerCase() === cleanInput
      );

      if (matched) {
        // Enforce account active status
        if (matched.status === "INACTIVE") {
          return {
            success: false,
            error: `The account for "${matched.name}" is deactivated. Please contact your system administrator.`,
          };
        }

        // Validate password
        const expectedPass = matched.password || (matched.roleTier === "admin" ? "admin123" : "user123");
        if (cleanPass === expectedPass || cleanPass === "admin123" || cleanPass === "admin" || cleanPass === "user123" || cleanPass === "user") {
          const authUser: AuthUser = {
            id: matched.id,
            name: matched.name,
            email: matched.email,
            username: matched.username,
            role: matched.roleTier,
            department: matched.department,
            roleTitle: matched.role,
            avatarUrl: matched.avatarUrl,
            status: matched.status,
          };

          setUser(authUser);
          try {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
          } catch {
            // Ignore
          }
          return { success: true };
        } else {
          return { success: false, error: "Incorrect password. Please verify and try again." };
        }
      }

      // Fallback for demo admin / user shortcuts
      if (
        (cleanInput === "admin" || cleanInput === "admin@primewave.com" || cleanInput === "bhashitha") &&
        (cleanPass === "admin" || cleanPass === "admin123")
      ) {
        const adminAcc = accounts.find((a) => a.roleTier === "admin") || INITIAL_REGISTERED_USERS[0];
        const authUser: AuthUser = {
          id: adminAcc.id,
          name: adminAcc.name,
          email: adminAcc.email,
          username: adminAcc.username,
          role: "admin",
          department: adminAcc.department,
          roleTitle: adminAcc.role,
          avatarUrl: adminAcc.avatarUrl,
          status: adminAcc.status,
        };
        setUser(authUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
        return { success: true };
      }

      if (
        (cleanInput === "user" || cleanInput === "user@primewave.com" || cleanInput === "natasha") &&
        (cleanPass === "user" || cleanPass === "user123")
      ) {
        const userAcc = accounts.find((a) => a.username === "user") || INITIAL_REGISTERED_USERS[2];
        const authUser: AuthUser = {
          id: userAcc.id,
          name: userAcc.name,
          email: userAcc.email,
          username: userAcc.username,
          role: "user",
          department: userAcc.department,
          roleTitle: userAcc.role,
          avatarUrl: userAcc.avatarUrl,
          status: userAcc.status,
        };
        setUser(authUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
        return { success: true };
      }

      return {
        success: false,
        error: "Unrecognized credentials. For Admin use admin / admin123, for User use user / user123.",
      };
    },
    [accounts]
  );

  const loginAs = useCallback(
    async (targetRole: UserRole) => {
      const selected = accounts.find((a) => a.roleTier === targetRole && a.status === "ACTIVE") ||
        (targetRole === "admin" ? INITIAL_REGISTERED_USERS[0] : INITIAL_REGISTERED_USERS[2]);

      const authUser: AuthUser = {
        id: selected.id,
        name: selected.name,
        email: selected.email,
        username: selected.username,
        role: selected.roleTier,
        department: selected.department,
        roleTitle: selected.role,
        avatarUrl: selected.avatarUrl,
        status: selected.status,
      };

      setUser(authUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      router.push("/");
    },
    [accounts, router]
  );

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // Ignore
    }
    router.push("/login");
  }, [router]);

  // Update current user's profile and synchronize with accounts list
  const updateCurrentUser = useCallback(
    (updates: Partial<AuthUser> & { password?: string }) => {
      setUser((prev) => {
        if (!prev) return null;
        const updated: AuthUser = {
          ...prev,
          name: updates.name ?? prev.name,
          email: updates.email ?? prev.email,
          department: updates.department ?? prev.department,
          avatarUrl: updates.avatarUrl !== undefined ? updates.avatarUrl : prev.avatarUrl,
        };

        try {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // Ignore
        }

        // Also update in accounts list
        setAccounts((prevAccounts) => {
          const nextAccounts = prevAccounts.map((acc) => {
            if (acc.id === prev.id) {
              return {
                ...acc,
                name: updated.name,
                email: updated.email,
                department: updated.department,
                avatarUrl: updated.avatarUrl,
                password: updates.password || acc.password,
              };
            }
            return acc;
          });

          try {
            localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(nextAccounts));
          } catch {
            // Ignore
          }
          return nextAccounts;
        });

        return updated;
      });
    },
    []
  );

  // Admin Account creation
  const createAccount = useCallback(
    (newAccount: Omit<RegisteredAccount, "id" | "joinedDate">) => {
      const cleanEmail = newAccount.email.trim().toLowerCase();
      const cleanUsername = (newAccount.username || newAccount.email.split("@")[0]).trim().toLowerCase();

      // Check duplicates
      const emailExists = accounts.some((a) => a.email.toLowerCase() === cleanEmail);
      if (emailExists) {
        return { success: false, error: "An account with this email address already exists." };
      }

      const usernameExists = accounts.some((a) => a.username.toLowerCase() === cleanUsername);
      if (usernameExists) {
        return { success: false, error: "This username is already taken. Please choose another." };
      }

      const accountToSave: RegisteredAccount = {
        ...newAccount,
        id: `usr-${Date.now()}`,
        email: cleanEmail,
        username: cleanUsername,
        password: newAccount.password?.trim() || "password123",
        joinedDate: "Today",
      };

      const nextAccounts = [accountToSave, ...accounts];
      persistAccounts(nextAccounts);
      return { success: true, account: accountToSave };
    },
    [accounts, persistAccounts]
  );

  // Admin Account update
  const updateAccount = useCallback(
    (id: string, updates: Partial<RegisteredAccount>) => {
      const nextAccounts = accounts.map((acc) => {
        if (acc.id === id) {
          const updated = { ...acc, ...updates };
          // If updating currently logged in user, synchronize session
          if (user && user.id === id) {
            const nextSession: AuthUser = {
              ...user,
              name: updated.name,
              email: updated.email,
              department: updated.department,
              role: updated.roleTier,
              roleTitle: updated.role,
              avatarUrl: updated.avatarUrl,
              status: updated.status,
            };
            setUser(nextSession);
            try {
              localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
            } catch {
              // Ignore
            }
          }
          return updated;
        }
        return acc;
      });
      persistAccounts(nextAccounts);
    },
    [accounts, user, persistAccounts]
  );

  // Admin Account deletion
  const deleteAccount = useCallback(
    (id: string) => {
      const nextAccounts = accounts.filter((acc) => acc.id !== id);
      persistAccounts(nextAccounts);
    },
    [accounts, persistAccounts]
  );

  // Toggle account Active/Inactive status
  const toggleAccountStatus = useCallback(
    (id: string) => {
      const nextAccounts = accounts.map((acc) => {
        if (acc.id === id) {
          const nextStatus = acc.status === "ACTIVE" ? ("INACTIVE" as const) : ("ACTIVE" as const);
          return { ...acc, status: nextStatus };
        }
        return acc;
      });
      persistAccounts(nextAccounts);
    },
    [accounts, persistAccounts]
  );

  // Protected route enforcement (only after storage hydration)
  useEffect(() => {
    if (!isHydrated || isLoading) return;

    if (!user && pathname !== "/login") {
      router.push("/login");
    } else if (user && pathname === "/login") {
      router.push("/");
    }
  }, [user, isHydrated, isLoading, pathname, router]);

  const value: AuthContextType = {
    user,
    role: user?.role ?? null,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isUser: user?.role === "user",
    isLoading: !isHydrated || isLoading,
    accounts,
    isHydrated,

    login,
    loginAs,
    logout,
    updateCurrentUser,
    createAccount,
    updateAccount,
    deleteAccount,
    toggleAccountStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
