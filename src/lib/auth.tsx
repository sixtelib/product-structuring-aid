import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "assure" | "expert" | "admin";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  isAdmin: boolean;
  isExpert: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = roles.includes("admin");
  const isExpert = roles.includes("expert");

  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === "TOKEN_REFRESHED") {
        // session rafraîchie, tout va bien
      }
      if (event === "SIGNED_OUT" || !newSession) {
        if (typeof window !== "undefined") {
          const path = window.location.pathname;
          const publicPaths = ["/", "/login", "/auth", "/comment-ca-marche", "/tarifs", "/faq"];
          const isPublic =
            publicPaths.some((p) => path === p) ||
            path.startsWith("/guides") ||
            path.startsWith("/sinistres");
          if (!isPublic) {
            window.location.href = "/login";
          }
        }
      }

      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        // Ensure guards don't run with stale roles after sign-in/out
        setLoading(true);
        // Defer role fetch to avoid recursion in callback
        setTimeout(() => {
          fetchRoles(newSession.user!.id).finally(() => setLoading(false));
        }, 0);
      } else {
        setRoles([]);
        setLoading(false);
      }
    });

    // Then check existing session
    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      setUser(existing?.user ?? null);
      if (existing?.user) {
        fetchRoles(existing.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchRoles(userId: string) {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const next = (data ?? [])
      .map((r) => String((r as { role?: unknown }).role ?? "").trim())
      .filter(Boolean) as AppRole[];
    setRoles(next);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setRoles([]);
  }

  return (
    <AuthContext.Provider value={{ user, session, roles, isAdmin, isExpert, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function isAdmin(roles: AppRole[]) {
  return roles.includes("admin");
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
