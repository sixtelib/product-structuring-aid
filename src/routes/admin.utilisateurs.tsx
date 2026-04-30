import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/utilisateurs")({
  component: AdminUtilisateursPage,
});

type UiRole = "assure" | "expert" | "admin";
type FilterMode = "all" | "assure" | "expert";

function AdminUtilisateursPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterMode>("all");

  useEffect(() => {
    let isMounted = true;

    async function fetchUsers() {
      try {
        const { data, error } = await supabase
          .from("dossiers")
          .select("user_id, nom_assure, prenom_assure, date_ouverture")
          .order("date_ouverture", { ascending: false });

        if (!isMounted) return;
        if (error) throw new Error(error.message);

        // Grouper par user_id unique
        const map = new Map();
        data?.forEach((d) => {
          if (!d.user_id) return;
          if (!map.has(d.user_id)) {
            map.set(d.user_id, {
              id: d.user_id,
              nom: d.nom_assure || "",
              prenom: d.prenom_assure || "",
              nb_dossiers: 1,
              date_inscription: d.date_ouverture,
              role: "Assuré",
              statut: "Actif",
            });
          } else {
            map.get(d.user_id).nb_dossiers++;
          }
        });

        if (!isMounted) return;
        setUsers(Array.from(map.values()));
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    }

    fetchUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    if (filter === "all") return users;
    if (filter === "expert") return [];
    if (filter === "assure") return users.filter((u: any) => u.role === "Assuré");
    return users;
  }, [filter, users]);

  function roleBadgeClass(role: UiRole) {
    if (role === "admin") return "bg-[#111827] text-white";
    if (role === "expert") return "bg-[#EDE9FE] text-[#5B50F0]";
    return "bg-[#DBEAFE] text-[#1D4ED8]";
  }

  function statusBadgeClass(statut: string) {
    if (statut === "Suspendu") return "bg-red-50 text-red-700";
    return "bg-green-50 text-green-700";
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
          <div className="p-6 text-sm text-red-700">
            <p className="font-semibold">Erreur Supabase</p>
            <p className="mt-2 whitespace-pre-wrap break-words">{error}</p>
          </div>
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
                {filteredUsers.map((u: any) => {
                  const nameOrEmail = `${u.prenom} ${u.nom}`.trim() || u.id.slice(0, 8);
                  const createdLabel = u.date_inscription
                    ? new Date(u.date_inscription).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
                    : "—";

                  return (
                    <tr key={u.id} className="border-b border-[#F3F4F6] hover:bg-[#F8F9FF]">
                      <td className="px-5 py-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#111827]">{nameOrEmail}</p>
                          <p className="truncate text-xs text-[#6B7280]">—</p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${roleBadgeClass("assure")}`}>
                          Assuré
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-[#111827]">{createdLabel}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-[#111827]">{u.nb_dossiers}</td>

                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(u.statut)}`}>
                          {u.statut}
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
                              u.statut === "Suspendu"
                                ? "bg-green-50 text-green-700 hover:bg-green-100"
                                : "bg-red-50 text-red-700 hover:bg-red-100"
                            }`}
                          >
                            {u.statut === "Suspendu" ? "Réactiver" : "Suspendre"}
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

