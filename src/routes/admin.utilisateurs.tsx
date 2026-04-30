import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/utilisateurs")({
  component: AdminUtilisateursPage,
});

type ProfileRow = Tables<"profiles">;
type DossierRow = Tables<"dossiers">;

type UiRole = "assure" | "expert" | "admin";
type FilterMode = "all" | "assure" | "expert";

type UiUser = {
  id: string;
  email: string | null;
  fullName?: string | null;
  createdAt?: string | null;
  role: UiRole;
  dossierCount: number;
  status: "active" | "suspended";
};

function AdminUtilisateursPage() {
  const [filter, setFilter] = useState<FilterMode>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UiUser[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const dossierCounts = new Map<string, number>();
        const { data: dossierRows, error: dossiersErr } = await supabase.from("dossiers").select("user_id");
        if (dossiersErr) throw dossiersErr;
        ((dossierRows as Pick<DossierRow, "user_id">[]) ?? []).forEach((d) => {
          if (!d.user_id) return;
          dossierCounts.set(d.user_id, (dossierCounts.get(d.user_id) ?? 0) + 1);
        });

        // Try auth.users (may fail from client depending on permissions/RLS)
        try {
          const { data: authUsers, error: authErr } = await (supabase as any)
            .from("auth.users")
            .select("id, email, created_at, raw_user_meta_data")
            .order("created_at", { ascending: false });

          if (authErr) throw authErr;

          const ui = ((authUsers as any[]) ?? []).map((u) => {
            const raw = (u?.raw_user_meta_data ?? {}) as Record<string, unknown>;
            const rawRole = String((raw as any).role ?? (raw as any).app_role ?? "");
            const role: UiRole = rawRole === "admin" || rawRole === "expert" || rawRole === "assure" ? (rawRole as UiRole) : "assure";
            return {
              id: String(u.id),
              email: (u.email ?? null) as string | null,
              fullName: (raw as any).full_name ?? null,
              createdAt: (u.created_at ?? null) as string | null,
              role,
              dossierCount: dossierCounts.get(String(u.id)) ?? 0,
              status: "active" as const,
            } satisfies UiUser;
          });

          if (!cancelled) setUsers(ui);
          return;
        } catch {
          // ignore and fallback
        }

        // Fallback 1: profiles table
        const { data: profRows, error: profErr } = await supabase
          .from("profiles")
          .select("id, email, full_name, role, created_at")
          .order("created_at", { ascending: false });

        if (!profErr && profRows) {
          const ui = ((profRows as Pick<ProfileRow, "id" | "email" | "full_name" | "role" | "created_at">[]) ?? []).map(
            (p) => {
              const role: UiRole = p.role === "admin" || p.role === "expert" || p.role === "assure" ? (p.role as UiRole) : "assure";
              return {
                id: p.id,
                email: p.email,
                fullName: p.full_name,
                createdAt: p.created_at,
                role,
                dossierCount: dossierCounts.get(p.id) ?? 0,
                status: "active" as const,
              } satisfies UiUser;
            },
          );
          if (!cancelled) setUsers(ui);
          return;
        }

        // Fallback 2: deduce from dossiers user_id
        const uniqueUserIds = Array.from(dossierCounts.keys());
        const ui: UiUser[] = uniqueUserIds.map((id) => ({
          id,
          email: null,
          fullName: null,
          createdAt: null,
          role: "assure",
          dossierCount: dossierCounts.get(id) ?? 0,
          status: "active",
        }));

        if (!cancelled) setUsers(ui);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Erreur de chargement.");
          setUsers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    if (filter === "all") return users;
    return users.filter((u) => u.role === filter);
  }, [filter, users]);

  function roleLabel(role: UiRole) {
    if (role === "admin") return "Admin";
    if (role === "expert") return "Expert";
    return "Assuré";
  }

  function roleBadgeClass(role: UiRole) {
    if (role === "admin") return "bg-[#111827] text-white";
    if (role === "expert") return "bg-[#EDE9FE] text-[#5B50F0]";
    return "bg-[#DBEAFE] text-[#1D4ED8]";
  }

  function statusBadgeClass(status: UiUser["status"]) {
    if (status === "suspended") return "bg-red-50 text-red-700";
    return "bg-green-50 text-green-700";
  }

  function statusLabel(status: UiUser["status"]) {
    return status === "suspended" ? "Suspendu" : "Actif";
  }

  return (
    <div className="min-h-[60vh] bg-[#F8F9FF]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-[#111827]">Utilisateurs</h1>
          <p className="mt-1 text-sm text-[#6B7280]">Gérez les assurés et les experts de la plateforme</p>
        </div>

        <div className="inline-flex rounded-full bg-[#F3F4F6] p-1">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === "all" ? "bg-[#5B50F0] text-white" : "text-[#6B7280]"
            }`}
          >
            Tous
          </button>
          <button
            type="button"
            onClick={() => setFilter("assure")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === "assure" ? "bg-[#5B50F0] text-white" : "text-[#6B7280]"
            }`}
          >
            Assurés
          </button>
          <button
            type="button"
            onClick={() => setFilter("expert")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === "expert" ? "bg-[#5B50F0] text-white" : "text-[#6B7280]"
            }`}
          >
            Experts
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-primary" />
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-destructive">{error}</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-6 text-sm text-[#6B7280]">Aucun utilisateur trouvé</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-[#F9FAFB]">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-4">Nom / Email</th>
                  <th className="px-5 py-4">Rôle</th>
                  <th className="px-5 py-4">Date d'inscription</th>
                  <th className="px-5 py-4">Nb de dossiers</th>
                  <th className="px-5 py-4">Statut</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((u) => {
                  const nameOrEmail = (u.fullName && u.fullName.trim()) || u.email || u.id;
                  const emailLabel = u.email ?? u.id;
                  const createdLabel = u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
                    : "—";

                  return (
                    <tr key={u.id} className="border-b border-[#F3F4F6] hover:bg-[#F8F9FF]">
                      <td className="px-5 py-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#111827]">{nameOrEmail}</p>
                          <p className="truncate text-xs text-[#6B7280]">{u.email ?? "—"}</p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${roleBadgeClass(u.role)}`}>
                          {roleLabel(u.role)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-[#111827]">{createdLabel}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-[#111827]">{u.dossierCount}</td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(
                            u.status,
                          )}`}
                        >
                          {statusLabel(u.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => window.alert(`Profil utilisateur : ${emailLabel}`)}
                            className="rounded-lg bg-[#F3F4F6] px-3 py-2 text-sm font-medium text-[#111827] hover:bg-[#E5E7EB]"
                          >
                            Voir profil
                          </button>
                          <button
                            type="button"
                            onClick={() => window.alert("Fonctionnalité bientôt disponible")}
                            className={`rounded-lg px-3 py-2 text-sm font-medium ${
                              u.status === "suspended"
                                ? "bg-green-50 text-green-700 hover:bg-green-100"
                                : "bg-red-50 text-red-700 hover:bg-red-100"
                            }`}
                          >
                            {u.status === "suspended" ? "Réactiver" : "Suspendre"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

