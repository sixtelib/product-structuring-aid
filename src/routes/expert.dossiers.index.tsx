import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  getImpersonatedExpertId,
  getImpersonatedExpertNomPrenomForDossierFilter,
  setImpersonationFromProfile,
} from "@/lib/expertImpersonation";
import { expertMisfitRedirectPath } from "@/lib/expertRoleRouting";

export const Route = createFileRoute("/expert/dossiers/")({
  component: ExpertDossiersListPage,
  validateSearch: (search: Record<string, unknown>) => ({
    impersonate: typeof search.impersonate === "string" ? search.impersonate : undefined,
  }),
});

type Row = {
  id: string;
  nom_assure: string | null;
  prenom_assure: string | null;
  type_sinistre: string | null;
  statut: string | null;
  assureur_compagnie_nom: string | null;
  date_ouverture: string | null;
};

function normalize(s: string | null | undefined) {
  return (s ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatStatutBadge(statut: string | null | undefined): { label: string; cls: string } {
  const s = normalize(statut);
  if (!s) return { label: "Non renseigné", cls: "bg-[#F3F4F6] text-[#6B7280]" };
  if (s.includes("qualif")) return { label: "Qualification", cls: "bg-yellow-50 text-yellow-800" };
  if (s.includes("analyse")) return { label: "En analyse", cls: "bg-orange-50 text-orange-700" };
  if (s === "en_cours" || s === "en cours" || s.includes("en_cours")) return { label: "En cours", cls: "bg-blue-50 text-blue-700" };
  if (s.includes("gagn")) return { label: "Gagné", cls: "bg-green-50 text-green-700" };
  if (s.includes("perdu") || s.includes("refus") || s.includes("echec")) return { label: "Perdu", cls: "bg-red-50 text-red-700" };
  if (s.includes("clotur") || s.includes("clos")) return { label: "Clôturé", cls: "bg-[#F3F4F6] text-[#6B7280]" };
  return { label: String(statut).trim() || "—", cls: "bg-[#F3F4F6] text-[#6B7280]" };
}

function ExpertDossiersListPage() {
  const { user, isAdmin, isExpert, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();
  const { impersonate } = Route.useSearch();

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      void navigate({ to: "/login", replace: true });
      return;
    }
    if (!isAdmin && !isExpert) {
      let cancelledGate = false;
      void (async () => {
        const path = user ? await expertMisfitRedirectPath(supabase, user, false) : null;
        if (cancelledGate) return;
        if (path) void navigate({ to: path, replace: true });
        else void navigate({ to: "/dashboard", replace: true });
      })();
      return () => {
        cancelledGate = true;
      };
    }

    if (isAdmin && impersonate) {
      let cancelled = false;
      void (async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name")
          .eq("role", "expert")
          .eq("id", impersonate)
          .maybeSingle();
        if (cancelled) return;
        if (!error && data) {
          setImpersonationFromProfile(data as { id: string; full_name?: string | null });
        }
        await router.navigate({ to: "/expert/dossiers", search: {}, replace: true });
      })();
      return () => {
        cancelled = true;
      };
    }

    const imp = getImpersonatedExpertId();
    if (isAdmin && !imp) {
      void navigate({ to: "/admin", replace: true });
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        if (isAdmin && imp) {
          const { nom, prenom } = getImpersonatedExpertNomPrenomForDossierFilter();
          const { data: byExpert, error: e1 } = await supabase
            .from("dossiers")
            .select("id, nom_assure, prenom_assure, type_sinistre, statut, assureur_compagnie_nom, date_ouverture")
            .eq("expert_id", imp)
            .order("date_ouverture", { ascending: false });
          if (e1) throw e1;
          let list = (byExpert as Row[]) ?? [];
          if (nom !== "" || prenom !== "") {
            const { data: byName, error: e2 } = await supabase
              .from("dossiers")
              .select("id, nom_assure, prenom_assure, type_sinistre, statut, assureur_compagnie_nom, date_ouverture")
              .eq("nom_expert", nom)
              .eq("prenom_expert", prenom)
              .order("date_ouverture", { ascending: false });
            if (e2) throw e2;
            const seen = new Set(list.map((r) => r.id));
            for (const r of (byName as Row[]) ?? []) {
              if (!seen.has(r.id)) {
                seen.add(r.id);
                list.push(r);
              }
            }
            list.sort((a, b) => String(b.date_ouverture).localeCompare(String(a.date_ouverture)));
          }
          if (!cancelled) setRows(list);
        } else if (isExpert && user.id) {
          const { data, error } = await supabase
            .from("dossiers")
            .select("id, nom_assure, prenom_assure, type_sinistre, statut, assureur_compagnie_nom, date_ouverture")
            .eq("expert_id", user.id)
            .order("date_ouverture", { ascending: false });
          if (error) throw error;
          if (!cancelled) setRows((data as Row[]) ?? []);
        } else {
          if (!cancelled) setRows([]);
        }
      } catch {
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, isAdmin, isExpert, navigate, router, impersonate]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-[#111827]">Dossiers</h1>
      <p className="mt-1 text-sm text-[#6B7280]">Dossiers où vous intervenez.</p>

      {loading ? (
        <div className="mt-10 flex justify-center py-20">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#5B50F0]" />
        </div>
      ) : rows.length === 0 ? (
        <p className="mt-8 rounded-xl border border-[#E5E7EB] bg-white p-8 text-center text-sm text-[#6B7280]">
          Aucun dossier à afficher.
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <table className="min-w-full border-collapse text-left">
            <thead className="bg-[#F9FAFB] text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              <tr>
                <th className="px-4 py-3">Assuré</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Assureur</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => {
                const st = formatStatutBadge(d.statut);
                const assured =
                  d.nom_assure || d.prenom_assure
                    ? `${String(d.prenom_assure ?? "").trim()} ${String(d.nom_assure ?? "").trim()}`.trim()
                    : "—";
                const dateStr = d.date_ouverture
                  ? new Date(d.date_ouverture).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—";
                return (
                  <tr
                    key={d.id}
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer border-t border-[#F3F4F6] hover:bg-[#F8F9FF]"
                    onClick={() => void navigate({ to: "/expert/dossiers/$id", params: { id: d.id } })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        void navigate({ to: "/expert/dossiers/$id", params: { id: d.id } });
                      }
                    }}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-[#111827]">{assured}</td>
                    <td className="px-4 py-3 text-sm text-[#374151]">{d.type_sinistre ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#374151]">
                      {d.assureur_compagnie_nom?.trim() ? (
                        d.assureur_compagnie_nom
                      ) : (
                        <span className="italic text-[#9CA3AF]">Non renseigné</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#6B7280]">{dateStr}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
