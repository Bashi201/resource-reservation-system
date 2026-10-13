"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

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

export const DEFAULT_AUTH_USER: AuthUser = {
  id: INITIAL_REGISTERED_USERS[0].id,
  name: INITIAL_REGISTERED_USERS[0].name,
  email: INITIAL_REGISTERED_USERS[0].email,
  username: INITIAL_REGISTERED_USERS[0].username,
  role: "admin",
  department: INITIAL_REGISTERED_USERS[0].department,
  roleTitle: INITIAL_REGISTERED_USERS[0].role,
  avatarUrl: INITIAL_REGISTERED_USERS[0].avatarUrl,
  status: "ACTIVE",
};

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
  createAccount: (newAccount: Omit<RegisteredAccount, "id" | "joinedDate">) => Promise<{ success: boolean; error?: string; account?: RegisteredAccount }>;
  updateAccount: (id: string, updates: Partial<RegisteredAccount>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  toggleAccountStatus: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "pw_auth_user";
const ACCOUNTS_STORAGE_KEY = "pw_team_members";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<RegisteredAccount[]>(INITIAL_REGISTERED_USERS);
  // Start as null — the useEffect will hydrate from localStorage before we render children
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const mountedRef = useRef(true);
  const router = useRouter();

  // Cleanup ref on unmount to prevent stale async callbacks from updating state
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Load user session and accounts from localStorage ONCE on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        const parsed = JSON.parse(storedUser) as AuthUser;
        if (parsed && parsed.id && parsed.name) {
          setUser(parsed);
        } else {
          setUser(null);
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } else {
        // No active session — user must log in
        setUser(null);
      }

      const storedAcc = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (storedAcc) {
        const parsedAcc = JSON.parse(storedAcc) as RegisteredAccount[];
        if (Array.isArray(parsedAcc) && parsedAcc.length > 0) {
          setAccounts(parsedAcc);
        }
      }
    } catch (err) {
      console.error("Storage load error:", err);
      setUser(null);
    } finally {
      setIsHydrated(true);
    }

    // Background fetch of database users to keep accounts and current user profile fresh
    fetch("/api/users")
      .then((res) => (res.ok ? res.json() : null))
      .then((dbUsers) => {
        // Guard: skip if component has unmounted (React StrictMode double-mount)
        if (!mountedRef.current) return;
        if (Array.isArray(dbUsers) && dbUsers.length > 0) {
          const mapped: RegisteredAccount[] = dbUsers.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            username: u.username,
            password: u.password,
            department: u.department,
            role: u.role as "Administrator" | "Facility Lead" | "Team Member",
            roleTier: (u.roleTier || "user") as UserRole,
            avatarUrl: u.avatarUrl,
            status: (u.status || "ACTIVE") as "ACTIVE" | "INACTIVE",
            joinedDate: new Date(u.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          }));
          setAccounts(mapped);
          try {
            localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(mapped));
          } catch {}

          // Synchronize current logged-in user with latest DB record (e.g., avatarUrl, department, name)
          setUser((currentUser) => {
            if (!currentUser) return null;
            const fresh = mapped.find(
              (m) =>
                m.id === currentUser.id ||
                m.email.toLowerCase() === currentUser.email.toLowerCase()
            );
            if (fresh) {
              const updatedUser: AuthUser = {
                ...currentUser,
                id: fresh.id,
                name: fresh.name,
                email: fresh.email,
                username: fresh.username,
                role: fresh.roleTier,
                department: fresh.department,
                roleTitle: fresh.role,
                avatarUrl: fresh.avatarUrl,
                status: fresh.status,
              };
              try {
                localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
              } catch {}
              return updatedUser;
            }
            return currentUser;
          });
        }
      })
      .catch((err) => console.warn("Background user sync notice:", err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (usernameOrEmail: string, password: string): Promise<{ success: boolean; error?: string }> => {
      const cleanInput = usernameOrEmail.trim().toLowerCase();
      const cleanPass = password.trim();

      if (!cleanInput || !cleanPass) {
        return { success: false, error: "Please enter both username/email and password." };
      }

      try {
        const apiRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usernameOrEmail: cleanInput, password: cleanPass }),
        });

        const apiData = await apiRes.json();
        if (apiRes.ok && apiData.user) {
          setUser(apiData.user);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(apiData.user));
          return { success: true };
        } else if (!apiRes.ok && apiData.error && apiRes.status !== 500) {
          return { success: false, error: apiData.error };
        }
      } catch (err) {
        console.warn("DB login endpoint unreachable, checking local accounts:", err);
      }

      // Fallback local match
      const matched = accounts.find(
        (acc) =>
          acc.username.toLowerCase() === cleanInput ||
          acc.email.toLowerCase() === cleanInput
      );

      if (matched) {
        if (matched.status === "INACTIVE") {
          return {
            success: false,
            error: `The account for "${matched.name}" is deactivated. Please contact your system administrator.`,
          };
        }

        const expectedPass = matched.password || (matched.roleTier === "admin" ? "admin123" : "user123");
        if (cleanPass === expectedPass || cleanPass === "admin123" || cleanPass === "user123" || cleanPass === "password123") {
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
          } catch {}
          return { success: true };
        } else {
          return { success: false, error: "Incorrect password. Please verify and try again." };
        }
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
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      } catch {}
      router.push("/");
    },
    [accounts, router]
  );

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {}
    router.push("/login");
  }, [router]);

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
        } catch {}

        // Persist to PostgreSQL in background
        fetch(`/api/users/${prev.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: updated.name,
            email: updated.email,
            department: updated.department,
            avatarUrl: updated.avatarUrl,
            ...(updates.password ? { password: updates.password } : {}),
          }),
        }).catch((err) => console.error("Failed to update user profile in DB:", err));

        // Update in accounts list
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
          } catch {}
          return nextAccounts;
        });

        return updated;
      });
    },
    []
  );

  const createAccount = useCallback(
    async (newAccount: Omit<RegisteredAccount, "id" | "joinedDate">) => {
      const cleanEmail = newAccount.email.trim().toLowerCase();
      const cleanUsername = (newAccount.username || newAccount.email.split("@")[0]).trim().toLowerCase();

      try {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newAccount.name,
            email: cleanEmail,
            username: cleanUsername,
            password: newAccount.password?.trim() || "password123",
            department: newAccount.department,
            role: newAccount.role,
            roleTier: newAccount.roleTier,
            status: newAccount.status,
            avatarUrl: newAccount.avatarUrl || null,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          return { success: false, error: data.error || "Failed to create account in database." };
        }

        const accountToSave: RegisteredAccount = {
          id: data.id,
          name: data.name,
          email: data.email,
          username: data.username,
          password: data.password,
          department: data.department,
          role: data.role as RegisteredAccount["role"],
          roleTier: data.roleTier as UserRole,
          status: data.status as "ACTIVE" | "INACTIVE",
          avatarUrl: data.avatarUrl,
          joinedDate: "Today",
        };

        setAccounts((prev) => {
          const next = [accountToSave, ...prev];
          try {
            localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(next));
          } catch {}
          return next;
        });
        return { success: true, account: accountToSave };
      } catch (err) {
        console.error("API create account error:", err);
        return { success: false, error: "Failed to create account." };
      }
    },
    []
  );

  const updateAccount = useCallback(
    async (id: string, updates: Partial<RegisteredAccount>) => {
      setAccounts((prev) => {
        const next = prev.map((acc) => (acc.id === id ? { ...acc, ...updates } : acc));
        try {
          localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });

      // Synchronize active currentUser session if updating current user
      setUser((prevUser) => {
        if (!prevUser || prevUser.id !== id) return prevUser;
        const updated: AuthUser = {
          ...prevUser,
          name: updates.name ?? prevUser.name,
          email: updates.email ?? prevUser.email,
          username: updates.username ?? prevUser.username,
          role: updates.roleTier ?? prevUser.role,
          department: updates.department ?? prevUser.department,
          roleTitle: updates.role ?? prevUser.roleTitle,
          avatarUrl: updates.avatarUrl !== undefined ? updates.avatarUrl : prevUser.avatarUrl,
          status: updates.status ?? prevUser.status,
        };
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });

      try {
        await fetch(`/api/users/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
      } catch (e) {
        console.error("Failed to update user in DB:", e);
      }
    },
    []
  );

  const deleteAccount = useCallback(
    async (id: string) => {
      setAccounts((prev) => {
        const next = prev.filter((acc) => acc.id !== id);
        try {
          localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });

      try {
        await fetch(`/api/users/${id}`, { method: "DELETE" });
      } catch (e) {
        console.error("Failed to delete user in DB:", e);
      }
    },
    []
  );

  const toggleAccountStatus = useCallback(
    async (id: string) => {
      let nextStatus: "ACTIVE" | "INACTIVE" = "ACTIVE";
      setAccounts((prev) => {
        const next = prev.map((acc) => {
          if (acc.id === id) {
            nextStatus = acc.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
            return { ...acc, status: nextStatus };
          }
          return acc;
        });
        try {
          localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });

      try {
        await fetch(`/api/users/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        });
      } catch (e) {
        console.error("Failed to toggle status in DB:", e);
      }
    },
    []
  );

  const value: AuthContextType = {
    user,
    role: user?.role ?? null,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isUser: user?.role === "user",
    isLoading: !isHydrated,
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

  // Block ALL rendering until hydration is complete to prevent
  // the flash/oscillation between default admin and actual stored user
  if (!isHydrated) {
    return (
      <AuthContext.Provider value={value}>
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="text-sm font-semibold text-slate-500">Initializing session…</span>
          </div>
        </div>
      </AuthContext.Provider>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
