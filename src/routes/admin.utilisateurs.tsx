import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
  const navigate = useNavigate();
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
        // Step 1 — detect whether "profiles" is accessible
        const { data: profileProbe, error: profileProbeErr } = await supabase.from("profiles").select("*").limit(1);

        if (!profileProbeErr && profileProbe) {
          // profiles exists and is readable: use it as the source of truth
          const { data: profRows, error: profErr } = await supabase
            .from("profiles")
            .select("id, email, full_name, role, created_at")
            .order("created_at", { ascending: false });
          if (profErr) throw profErr;

          const ids = new Set(((profRows as Pick<ProfileRow, "id">[]) ?? []).map((p) => p.id));
          const { data: dossierRows, error: dossiersErr } = await supabase
            .from("dossiers")
            .select("user_id, nom_assure, prenom_assure");
          if (dossiersErr) throw dossiersErr;
          const dossierCounts = new Map<string, number>();
          const nameByUser = new Map<string, string>();
          ((dossierRows as Pick<DossierRow, "user_id">[]) ?? []).forEach((d) => {
            if (!d.user_id || !ids.has(d.user_id)) return;
            dossierCounts.set(d.user_id, (dossierCounts.get(d.user_id) ?? 0) + 1);
          });
          ((dossierRows as Array<Pick<DossierRow, "user_id" | "nom_assure" | "prenom_assure">>) ?? []).forEach((d) => {
            if (!d.user_id || !ids.has(d.user_id)) return;
            const label = `${String(d.nom_assure ?? "").trim()} ${String(d.prenom_assure ?? "").trim()}`.trim();
            if (label) nameByUser.set(d.user_id, label);
          });

          const ui = ((profRows as Pick<ProfileRow, "id" | "email" | "full_name" | "role" | "created_at">[]) ?? []).map((p) => {
            const role: UiRole = p.role === "admin" || p.role === "expert" || p.role === "assure" ? (p.role as UiRole) : "assure";
            return {
              id: p.id,
              email: p.email,
              fullName: p.full_name ?? nameByUser.get(p.id) ?? null,
              createdAt: p.created_at,
              role,
              dossierCount: dossierCounts.get(p.id) ?? 0,
              status: "active" as const,
            } satisfies UiUser;
          });

          if (!cancelled) setUsers(ui);
          return;
        }

        // Step 2 — build users from dossiers (since profiles isn't available)
        const { data: dossierRows, error: dossiersErr } = await supabase
          .from("dossiers")
          .select("user_id, type_sinistre, statut, date_ouverture, montant_estime, nom_assure, prenom_assure");
        if (dossiersErr) throw dossiersErr;

        const byUser = new Map<string, { count: number; firstOpenedAt: string | null; fullName: string | null }>();
        ((dossierRows as Array<Pick<DossierRow, "user_id" | "date_ouverture" | "nom_assure" | "prenom_assure">>) ?? []).forEach((d) => {
          if (!d.user_id) return;
          const existing = byUser.get(d.user_id);
          const openedAt = (d.date_ouverture as unknown as string | null) ?? null;
          const label = `${String(d.nom_assure ?? "").trim()} ${String(d.prenom_assure ?? "").trim()}`.trim() || null;
          if (!existing) {
            byUser.set(d.user_id, { count: 1, firstOpenedAt: openedAt, fullName: label });
            return;
          }
          existing.count += 1;
          if (openedAt && (!existing.firstOpenedAt || new Date(openedAt).getTime() < new Date(existing.firstOpenedAt).getTime())) {
            existing.firstOpenedAt = openedAt;
          }
          if (!existing.fullName && label) existing.fullName = label;
        });

        const ui: UiUser[] = Array.from(byUser.entries())
          .map(([id, meta]) => ({
            id,
            email: null,
            fullName: meta.fullName,
            createdAt: meta.firstOpenedAt,
            role: "assure",
            dossierCount: meta.count,
            status: "active",
          }))
          .sort((a, b) => {
            const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return tb - ta;
          });

        if (!cancelled) setUsers(ui);
      } catch (e) {
        if (!cancelled) {
          console.error(e);
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

  function shortId(id: string) {
    return `${id.slice(0, 8)}...`;
  }

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
          <div className="p-6 text-sm text-destructive">Erreur de chargement : {error}</div>
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
                  const nameOrEmail = (u.fullName && u.fullName.trim()) || u.email || shortId(u.id);
                  const emailLabel = u.email ?? shortId(u.id);
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
                            onClick={() => navigate({ to: "/admin/utilisateurs/$userId", params: { userId: u.id } })}
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

export default AdminUtilisateursPage;

