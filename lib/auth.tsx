"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { PORTAL_PROFILES } from "./mock-data";
import type { PortalRole } from "./portal";

const STORAGE_KEY = "octagone.session";

export interface Session {
  email: string;
  name: string;
  company: string;
  initials: string;
  role: string;
  portal: PortalRole;
  loggedInAt: string;
}

interface AuthContextValue {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  login: (email: string, portal: PortalRole) => Promise<void>;
  logout: () => void;
  updateSession: (patch: Partial<Pick<Session, "name" | "email" | "company">>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");

  // One-time hydration of client-only storage on mount — session state
  // can't be read during SSR, so this can't be derived during render.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as Partial<Session>) : null;
      // Guards against sessions stored before `portal` existed on the
      // Session shape — without this, an old localStorage entry would
      // authenticate with `portal: undefined` and break every redirect.
      if (parsed && parsed.portal) {
        setSession(parsed as Session);
        setStatus("authenticated");
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
        setStatus("unauthenticated");
      }
    } catch {
      setStatus("unauthenticated");
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const login = useCallback(async (email: string, portal: PortalRole) => {
    await new Promise((resolve) => setTimeout(resolve, 650));
    const profile = PORTAL_PROFILES[portal];
    const next: Session = {
      email,
      name: profile.name,
      company: profile.company,
      initials: profile.initials,
      role: profile.role,
      portal,
      loggedInAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setStatus("unauthenticated");
  }, []);

  const updateSession = useCallback((patch: Partial<Pick<Session, "name" | "email" | "company">>) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ session, status, login, logout, updateSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
