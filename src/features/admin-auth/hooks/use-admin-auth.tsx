"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { apiErrorMessage } from "@/lib/api/axios";
import { setAdminSessionBootstrapInProgress } from "@/lib/api/axios";
import {
  clearAdminAccessToken,
  setAdminAccessToken,
} from "@/lib/api/token-store";

import { adminAuthApi } from "../api/admin-auth.api";
import type { Admin, AdminLoginInput } from "../types/admin-auth.types";
import { AdminRoleEnum } from "@/features/admin-management/types/admin.types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AdminAuthContextValue {
  admin: Admin | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  error: string | null;
  login: (input: AdminLoginInput) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshProfile: () => Promise<Admin>;
  updateProfile: (input: {
    firstName?: string;
    lastName?: string;
  }) => Promise<Admin>;
  changePassword: (input: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const initialPathname = useRef(pathname);

  const [admin, setAdmin] = useState<Admin | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const clearSession = useCallback(() => {
    clearAdminAccessToken();
    setAdmin(null);
    setStatus("unauthenticated");
  }, []);

  const refreshProfile = useCallback(async () => {
    const currentAdmin = await adminAuthApi.profile();

    setAdmin(currentAdmin);
    setStatus("authenticated");

    return currentAdmin;
  }, []);

  const login = useCallback(
    async (input: AdminLoginInput) => {
      setError(null);

      try {
        const response = await adminAuthApi.login(input);

        setAdminAccessToken(response.tokens.accessToken);
        setAdmin(response.admin);
        setStatus("authenticated");

        router.replace("/");
      } catch (cause) {
        const message = apiErrorMessage(cause);
        setError(message);
        throw new Error(message);
      }
    },
    [router],
  );

  const logout = useCallback(async () => {
    try {
      await adminAuthApi.logout();
    } finally {
      clearSession();
      router.replace("/login");
    }
  }, [clearSession, router]);

  const logoutAll = useCallback(async () => {
    try {
      await adminAuthApi.logoutAll();
    } finally {
      clearSession();
      router.replace("/login");
    }
  }, [clearSession, router]);

  const updateProfile = useCallback(
    async (input: { firstName?: string; lastName?: string }) => {
      const updatedAdmin = await adminAuthApi.updateProfile(input);

      setAdmin(updatedAdmin);

      return updatedAdmin;
    },
    [],
  );

  const changePassword = useCallback(
    async (input: { currentPassword: string; newPassword: string }) => {
      await adminAuthApi.changePassword(input);

      clearSession();
      router.replace("/login");
    },
    [clearSession, router],
  );

  useEffect(() => {
    let active = true;

    const initializeSession = async () => {
      // The login screen is public. Avoid repeatedly attempting an expired
      // refresh cookie there; protected routes will still restore the session.
      if (initialPathname.current === "/login") {
        setStatus("unauthenticated");
        return;
      }

      setAdminSessionBootstrapInProgress(true);
      try {
        await adminAuthApi.refresh();
        const currentAdmin = await adminAuthApi.profile();

        if (!active) return;

        setAdmin(currentAdmin);
        setStatus("authenticated");
      } catch {
        if (!active) return;

        clearSession();
      } finally {
        setAdminSessionBootstrapInProgress(false);
      }
    };

    void initializeSession();

    return () => {
      active = false;
    };
  }, [clearSession]);

  useEffect(() => {
    const onSessionExpired = () => {
      if (pathname === "/login") return;

      clearSession();
      router.replace("/login");
    };

    window.addEventListener("admin-session-expired", onSessionExpired);

    return () => {
      window.removeEventListener("admin-session-expired", onSessionExpired);
    };
  }, [clearSession, pathname, router]);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      admin,
      status,
      isAuthenticated: status === "authenticated",
      isSuperAdmin: admin?.role === AdminRoleEnum.SUPER_ADMIN,
      error,
      login,
      logout,
      logoutAll,
      refreshProfile,
      updateProfile,
      changePassword,
    }),
    [
      admin,
      status,
      error,
      login,
      logout,
      logoutAll,
      refreshProfile,
      updateProfile,
      changePassword,
    ],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }

  return context;
}
