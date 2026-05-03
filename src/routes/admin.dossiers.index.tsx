import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AssignModal } from "@/components/admin/AssignModal";
import { DossierRechercheBar, FILTRES_VIDES, type FiltresDossiers, type TypeFilter } from "@/components/admin/DossierRechercheBar";
import { DossierTableau } from "@/components/admin/DossierTableau";
import { nomPrenomExpertFromFullName } from "@/lib/expertFullNameSplit";
import type { Dossier, Expert } from "@/types";

export const Route = createFileRoute("/admin/dossiers/")({
  component: AdminDossiersIndexPage,
});

type AdminDossierListRow = {
  id: string;
  user_id: string;
  expert_id: string | null;
  statut: string | null;
  type_sinistre: string | null;
  date_ouverture: string | null;
  montant_estime: number | null;
  nom_assure: string | null;
  prenom_assure: string | null;
  nom_expert: string | null;
  prenom_expert: string | null;
  assureur_compagnie_nom: string | null;
};

function normalize(s: string | null | undefined) {
  return (s ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function typeKey(raw: string | null | undefined): TypeFilter {
  const s = normalize(raw);
  if (s.includes("incend")) return "incendie";
  if (s.includes("degat") || s.includes("eaux")) return "degat_des_eaux";
  if (s.includes("tempet")) return "tempete";
  if (s.includes("accident") || s.includes("auto") || s.includes("vehic")) return "accident_auto";
  if (s.includes("multirisque")) return "multirisque";
  if (!s) return "autre";
  if (s.includes("autre")) return "autre";
  return "autre";
}

function statusMatchesFilter(statut: string | null | undefined, filter: FiltresDossiers["statut"]) {
  if (filter === "all") return true;
  const s = normalize(statut);
  if (filter === "en_cours") return s === "en_cours" || s === "en cours" || s.includes("en_cours");
  if (filter === "en_analyse") return s.includes("analyse");
  if (filter === "cloture") return s.includes("clotur") || s.includes("clos");
  if (filter === "gagne") return s.includes("gagn");
  if (filter === "perdu") return s.includes("perdu") || s.includes("refus") || s.includes("echec");
  return true;
}

function amountValue(v: unknown) {
  const n = typeof v === "number" ? v : Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function eur(n: unknown) {
  const v = amountValue(n);
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);
}

function AdminDossiersIndexPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dossiers, setDossiers] = useState<AdminDossierListRow[]>([]);

  const [filterExpertProfiles, setFilterExpertProfiles] = useState<
    Array<{ id: string; full_name: string | null; specialite: string | null }>
  >([]);

  const [applied, setApplied] = useState<FiltresDossiers>(FILTRES_VIDES);

  const [page, setPage] = useState(1);

  const [assigning, setAssigning] = useState<AdminDossierListRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dRes, eRes] = await Promise.all([
        supabase
          .from("dossiers")
          .select(
            "id, user_id, expert_id, statut, type_sinistre, date_ouverture, montant_estime, nom_assure, prenom_assure, nom_expert, prenom_expert, assureur_compagnie_nom",
          )
          .order("date_ouverture", { ascending: false }),
        supabase.from("profiles").select("id, full_name, specialite").eq("role", "expert"),
      ]);
      if (dRes.error) throw dRes.error;
      setDossiers((dRes.data ?? []) as unknown as AdminDossierListRow[]);
      if (eRes.error) {
        console.error(eRes.error);
        setFilterExpertProfiles([]);
      } else {
        setFilterExpertProfiles((eRes.data ?? []) as Array<{ id: string; full_name: string | null; specialite: string | null }>);
      }
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Erreur de chargement.");
      setDossiers([]);
      setFilterExpertProfiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await load();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const hasActiveFilters = useMemo(() => {
    return (
      Boolean(applied.client.trim()) ||
      applied.expertIds.length > 0 ||
      applied.assureurs.length > 0 ||
      applied.type !== "all" ||
      applied.statut !== "all" ||
      Boolean(applied.dateFrom) ||
      Boolean(applied.dateTo)
    );
  }, [applied]);

  const assureursUniques = useMemo(() => {
    const s = new Set<string>();
    dossiers.forEach((d) => {
      const a = (d.assureur_compagnie_nom ?? "").toString().trim();
      if (a) s.add(a);
    });
    return Array.from(s).sort((a, b) => a.localeCompare(b, "fr"));
  }, [dossiers]);

  const expertsPourBar = useMemo<Expert[]>(
    () => filterExpertProfiles.map((p) => ({ id: p.id, full_name: p.full_name, specialite: p.specialite, role: "expert" })),
    [filterExpertProfiles],
  );

  const filtered = useMemo(() => {
    const out = dossiers.filter((d) => {
      const clientQ = normalize(applied.client);

      if (clientQ) {
        const id8 = String(d.id ?? "").slice(0, 8);
        const hay = `${normalize(d.nom_assure)} ${normalize(d.prenom_assure)} ${normalize(id8)}`;
        if (!hay.includes(clientQ)) return false;
      }

      const expertMatch =
        applied.expertIds.length === 0 || (d.expert_id != null && applied.expertIds.includes(String(d.expert_id)));

      const assureurMatch =
        applied.assureurs.length === 0 ||
        (d.assureur_compagnie_nom != null &&
          applied.assureurs.includes(String(d.assureur_compagnie_nom).trim()));

      if (!expertMatch || !assureurMatch) return false;

      if (applied.type !== "all" && typeKey(d.type_sinistre) !== applied.type) return false;
      if (!statusMatchesFilter(d.statut, applied.statut)) return false;

      if (applied.dateFrom || applied.dateTo) {
        const t = d.date_ouverture ? new Date(d.date_ouverture).getTime() : NaN;
        if (!Number.isFinite(t)) return false;
        if (applied.dateFrom) {
          const fromT = new Date(`${applied.dateFrom}T00:00:00`).getTime();
          if (Number.isFinite(fromT) && t < fromT) return false;
        }
        if (applied.dateTo) {
          const toT = new Date(`${applied.dateTo}T23:59:59`).getTime();
          if (Number.isFinite(toT) && t > toT) return false;
        }
      }

      return true;
    });
    return out;
  }, [applied, dossiers]);

  const stats = useMemo(() => {
    const displayed = filtered.length;
    const totalAmount = filtered.reduce((acc, d) => acc + amountValue(d.montant_estime), 0);
    const withoutExpert = filtered.filter((d) => !d.expert_id).length;
    return { displayed, totalAmount, withoutExpert };
  }, [filtered]);

  const pagination = useMemo(() => {
    const pageSize = 20;
    const total = filtered.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), pageCount);
    const start = (safePage - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    return { pageSize, total, pageCount, page: safePage, items };
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [applied]);

  function goToDossier(dossierId: string) {
    void navigate({ to: "/admin/dossiers/$dossierId", params: { dossierId } });
  }

  const handleChangerStatut = useCallback(async (id: string, statut: string) => {
    try {
      const { error } = await supabase.from("dossiers").update({ statut }).eq("id", id);
      if (error) throw error;
      setDossiers((prev) => prev.map((d) => (d.id === id ? { ...d, statut } : d)));
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Mise à jour du statut impossible.");
    }
  }, []);

  const handleConfirmerAssign = useCallback(
    async (expertId: string) => {
      if (!assigning?.id) return;
      const profile = filterExpertProfiles.find((p) => p.id === expertId);
      const { nom_expert, prenom_expert } = nomPrenomExpertFromFullName(profile?.full_name ?? null);
      const { error: uErr } = await supabase
        .from("dossiers")
        .update({ expert_id: expertId, nom_expert, prenom_expert })
        .eq("id", assigning.id);
      if (uErr) throw uErr;
      await load();
    },
    [assigning, filterExpertProfiles, load],
  );

  return (
    <div className="min-h-[60vh] bg-[#F8F9FF]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-[#111827]">Dossiers</h1>
          <p className="mt-1 text-sm text-[#6B7280]">Tous les dossiers de la plateforme</p>
        </div>
        <span className="inline-flex items-center rounded-full bg-[#EDE9FE] px-3 py-1.5 text-sm font-semibold text-[#5B50F0]">
          {dossiers.length} total
        </span>
      </div>

      <DossierRechercheBar
        experts={expertsPourBar}
        assureurs={assureursUniques}
        onFiltrer={setApplied}
        onReinitialiser={() => setApplied(FILTRES_VIDES)}
      />

      {hasActiveFilters ? <p className="mt-3 text-sm text-[#6B7280]">{filtered.length} dossier(s) trouvé(s)</p> : null}

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="flex items-center justify-between gap-3 rounded-lg border border-[#E5E7EB] bg-white px-5 py-3">
          <p className="text-sm font-semibold text-[#111827]">Dossiers affichés</p>
          <p className="text-sm font-bold text-[#111827]">{stats.displayed}</p>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-[#E5E7EB] bg-white px-5 py-3">
          <p className="text-sm font-semibold text-[#111827]">Montant total</p>
          <p className="text-sm font-bold text-[#5B50F0]">{eur(stats.totalAmount)}</p>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-[#E5E7EB] bg-white px-5 py-3">
          <p className="text-sm font-semibold text-[#111827]">Sans expert</p>
          <p className="text-sm font-bold text-[#111827]">{stats.withoutExpert}</p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-primary" />
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-destructive">Erreur de chargement : {error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-[#6B7280]">Aucun dossier ne correspond à vos filtres</div>
        ) : (
          <DossierTableau
            dossiers={pagination.items as Dossier[]}
            page={pagination.page}
            pageCount={pagination.pageCount}
            onVoir={goToDossier}
            onAssigner={(d) => setAssigning(d as AdminDossierListRow)}
            onChangerStatut={handleChangerStatut}
            onPagePrev={() => setPage((p) => Math.max(1, p - 1))}
            onPageNext={() => setPage((p) => Math.min(pagination.pageCount, p + 1))}
          />
        )}
      </div>

      {assigning ? (
        <AssignModal
          dossier={assigning as Dossier}
          experts={expertsPourBar}
          onConfirmer={handleConfirmerAssign}
          onFermer={() => setAssigning(null)}
        />
      ) : null}
    </div>
  );
}
