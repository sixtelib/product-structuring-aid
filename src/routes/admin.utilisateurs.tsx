import { createFileRoute, useNavigate, Outlet, useRouterState } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Award, Target, TrendingUp, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/utilisateurs")({
  component: AdminUtilisateursPage,
});

type UiRole = "assure" | "expert" | "admin";
type FilterMode = "all" | "assure" | "expert";
type ProfileRow = Tables<"profiles">;

type DossierMetricRow = {
  id: string;
  user_id: string | null;
  nom_assure: string | null;
  prenom_assure: string | null;
  date_ouverture: string;
  expert_id: string | null;
  statut: string | null;
  montant_estime: number | null;
  type_sinistre: string | null;
};

type ExpertTableRow = {
  profile: ProfileRow;
  nomAffiche: string;
  specialite: string;
  email: string;
  dossiersEnCours: number;
  tauxSucces: number | null;
  revenuGenere: number;
  statut: "Actif" | "Suspendu";
};

type PerfPeriod = "7d" | "30d" | "90d" | "1y" | "all";

type ObjectifsExpert = { objectifDossiers: number; objectifRevenu: number };

const SPECIALITES = [
  "Tous types",
  "Incendie",
  "Dégât des eaux",
  "Tempête",
  "Auto",
  "Multirisque",
  "Cyber",
] as const;

function normalizeStatut(s: string | null | undefined) {
  return (s ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isStatutActif(statut: string | null | undefined) {
  const s = normalizeStatut(statut);
  if (s.includes("gagn") || s.includes("perdu") || s.includes("refus") || s.includes("echec"))
    return false;
  if (s.includes("clotur") || s.includes("clos")) return false;
  return true;
}

function isStatutGagne(statut: string | null | undefined) {
  const s = normalizeStatut(statut);
  return s.includes("gagn");
}

function isStatutCloture(statut: string | null | undefined) {
  const s = normalizeStatut(statut);
  return (
    s.includes("clotur") ||
    s.includes("clos") ||
    s.includes("gagn") ||
    s.includes("perdu") ||
    s.includes("refus") ||
    s.includes("echec")
  );
}

function amountValue(v: unknown) {
  const n = typeof v === "number" ? v : Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function eur(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function periodStartMs(p: PerfPeriod): number | null {
  const now = Date.now();
  if (p === "all") return null;
  const day = 86400000;
  if (p === "7d") return now - 7 * day;
  if (p === "30d") return now - 30 * day;
  if (p === "90d") return now - 90 * day;
  return now - 365 * day;
}

function dossierInPeriod(d: DossierMetricRow, p: PerfPeriod) {
  const start = periodStartMs(p);
  const t = new Date(d.date_ouverture).getTime();
  if (!Number.isFinite(t)) return false;
  if (start == null) return true;
  return t >= start && t <= Date.now();
}

function createEphemeralAuthClient() {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
  if (!url || !key)
    throw new Error("Variables VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY manquantes.");
  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      storage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      },
    },
  });
}

function specialiteBadgeClass(sp: string) {
  const s = sp.toLowerCase();
  if (s.includes("incend")) return "bg-orange-50 text-orange-800";
  if (s.includes("eau")) return "bg-blue-50 text-blue-800";
  if (s.includes("temp")) return "bg-sky-50 text-sky-800";
  if (s.includes("auto")) return "bg-red-50 text-red-800";
  if (s.includes("multi")) return "bg-[#EDE9FE] text-[#5B50F0]";
  if (s.includes("cyber")) return "bg-gray-100 text-gray-800";
  return "bg-[#F3F4F6] text-[#6B7280]";
}

function progressTone(pct: number) {
  if (pct >= 80) return "bg-green-500";
  if (pct >= 50) return "bg-orange-500";
  return "bg-red-500";
}

function AdminUtilisateursPage() {
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });
  const isSubRoute =
    pathname.includes("/admin/utilisateurs/") && pathname !== "/admin/utilisateurs";
  const [users, setUsers] = useState<any[]>([]);
  const [dossiersAll, setDossiersAll] = useState<DossierMetricRow[]>([]);
  const [expertsProfiles, setExpertsProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterMode>("all");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    password: "",
    specialite: SPECIALITES[0],
    telephone: "",
  });

  const [perfExpert, setPerfExpert] = useState<ExpertTableRow | null>(null);
  const [perfPeriod, setPerfPeriod] = useState<PerfPeriod>("30d");
  const [objectifsForm, setObjectifsForm] = useState<ObjectifsExpert>({
    objectifDossiers: 10,
    objectifRevenu: 5000,
  });

  const isMountedRef = useRef(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ data: dossData, error: dossErr }, { data: profilesData }] = await Promise.all([
        supabase
          .from("dossiers")
          .select(
            "id, user_id, nom_assure, prenom_assure, date_ouverture, expert_id, statut, montant_estime, type_sinistre",
          )
          .order("date_ouverture", { ascending: false }),
        supabase.from("profiles").select("id, full_name"),
      ]);

      if (!isMountedRef.current) return;
      if (dossErr) throw new Error(dossErr.message);

      const dossiers = (dossData ?? []) as DossierMetricRow[];
      setDossiersAll(dossiers);

      const profileById = new Map(
        (profilesData ?? []).map((p: { id: string; full_name: string | null }) => [p.id, p]),
      );

      const map = new Map<string, any>();
      dossiers.forEach((d) => {
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
            profile: profileById.get(d.user_id) ?? null,
          });
        } else {
          map.get(d.user_id).nb_dossiers++;
        }
      });
      if (!isMountedRef.current) return;
      setUsers(Array.from(map.values()));

      const { data: expertsData, error: expertsErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "expert");
      if (!isMountedRef.current) return;
      if (expertsErr) throw new Error(expertsErr.message);
      setExpertsProfiles((expertsData as ProfileRow[]) ?? []);
    } catch (err: unknown) {
      if (!isMountedRef.current) return;
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setUsers([]);
      setDossiersAll([]);
      setExpertsProfiles([]);
    } finally {
      if (!isMountedRef.current) return;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    void loadAll();
    return () => {
      isMountedRef.current = false;
    };
  }, [loadAll]);

  const expertTableRows: ExpertTableRow[] = useMemo(() => {
    return expertsProfiles.map((p) => {
      const mine = dossiersAll.filter((d) => d.expert_id && String(d.expert_id) === p.id);
      const enCours = mine.filter((d) => isStatutActif(d.statut)).length;
      const clotures = mine.filter((d) => isStatutCloture(d.statut));
      const gagnes = mine.filter((d) => isStatutGagne(d.statut));
      const taux = clotures.length > 0 ? Math.round((gagnes.length / clotures.length) * 100) : null;
      const revenu = gagnes.reduce((acc, d) => acc + amountValue(d.montant_estime) * 0.1, 0);
      const fn = (p.full_name ?? "").trim();
      const specialite = (p.specialite ?? "Tous types").trim() || "Tous types";
      return {
        profile: p,
        nomAffiche: fn || p.email || p.id.slice(0, 8),
        specialite,
        email: p.email ?? "Non renseigné",
        dossiersEnCours: enCours,
        tauxSucces: taux,
        revenuGenere: revenu,
        statut: "Actif" as const,
      };
    });
  }, [expertsProfiles, dossiersAll]);

  const filteredAssures = useMemo(() => {
    if (filter === "all") return users;
    if (filter === "assure") return users.filter((u: any) => u.role === "Assuré");
    return [];
  }, [filter, users]);

  useEffect(() => {
    if (!perfExpert) return;
    try {
      const raw = localStorage.getItem(`objectifs_${perfExpert.profile.id}`);
      if (raw) {
        const o = JSON.parse(raw) as ObjectifsExpert;
        if (o && typeof o.objectifDossiers === "number" && typeof o.objectifRevenu === "number") {
          setObjectifsForm(o);
        }
      }
    } catch {
      setObjectifsForm({ objectifDossiers: 10, objectifRevenu: 5000 });
    }
  }, [perfExpert?.profile.id]);

  const perfMetrics = useMemo(() => {
    if (!perfExpert) return null;
    const mine = dossiersAll.filter(
      (d) => d.expert_id && String(d.expert_id) === perfExpert.profile.id,
    );
    const inP = mine.filter((d) => dossierInPeriod(d, perfPeriod));
    const traites = inP.length;
    const enCours = inP.filter((d) => isStatutActif(d.statut)).length;
    const clotures = inP.filter((d) => isStatutCloture(d.statut));
    const gagnes = inP.filter((d) => isStatutGagne(d.statut));
    const taux = clotures.length > 0 ? Math.round((gagnes.length / clotures.length) * 100) : null;
    const revenu = gagnes.reduce((acc, d) => acc + amountValue(d.montant_estime) * 0.1, 0);
    const derniers = [...mine]
      .sort((a, b) => new Date(b.date_ouverture).getTime() - new Date(a.date_ouverture).getTime())
      .slice(0, 5);
    return { traites, enCours, taux, revenu, derniers };
  }, [perfExpert, dossiersAll, perfPeriod]);

  const progressDossiersPct = useMemo(() => {
    if (!perfMetrics || objectifsForm.objectifDossiers <= 0) return 0;
    return Math.min(100, Math.round((perfMetrics.traites / objectifsForm.objectifDossiers) * 100));
  }, [perfMetrics, objectifsForm.objectifDossiers]);

  const progressRevenuPct = useMemo(() => {
    if (!perfMetrics || objectifsForm.objectifRevenu <= 0) return 0;
    return Math.min(100, Math.round((perfMetrics.revenu / objectifsForm.objectifRevenu) * 100));
  }, [perfMetrics, objectifsForm.objectifRevenu]);

  function roleBadgeClass(role: UiRole) {
    if (role === "admin") return "bg-[#111827] text-white";
    if (role === "expert") return "bg-[#EDE9FE] text-[#5B50F0]";
    return "bg-[#DBEAFE] text-[#1D4ED8]";
  }

  function statusBadgeClass(statut: string) {
    if (statut === "Suspendu") return "bg-red-50 text-red-700";
    return "bg-green-50 text-green-700";
  }

  async function submitCreateExpert(e: React.FormEvent) {
    e.preventDefault();
    const { prenom, nom, email, password, specialite, telephone } = createForm;
    if (!prenom.trim() || !nom.trim() || !email.trim() || !password.trim()) {
      toast.error("Prénom, nom, email et mot de passe sont obligatoires.");
      return;
    }

    setCreateSubmitting(true);
    try {
      const full_name = `${prenom.trim()} ${nom.trim()}`.trim();
      const meta = {
        role: "expert" as const,
        full_name,
        phone: telephone.trim(),
        specialite: specialite.trim(),
      };

      let userId: string | null = null;

      const authAdmin = (
        supabase.auth as unknown as {
          admin?: {
            createUser: (
              args: Record<string, unknown>,
            ) => Promise<{
              data: { user: { id: string } | null };
              error: { message: string } | null;
            }>;
          };
        }
      ).admin;

      if (authAdmin?.createUser) {
        try {
          const { data: authData, error: authError } = await authAdmin.createUser({
            email: email.trim(),
            password,
            email_confirm: true,
            user_metadata: {
              role: "expert",
              prenom: prenom.trim(),
              nom: nom.trim(),
              full_name,
              specialite: specialite.trim(),
              telephone: telephone.trim(),
              phone: telephone.trim(),
            },
          });
          if (!authError && authData?.user?.id) userId = authData.user.id;
        } catch {
          /* client sans droits admin : fallback signUp */
        }
      }

      if (!userId) {
        const ephemeral = createEphemeralAuthClient();
        const { data: authData, error: authError } = await ephemeral.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              ...meta,
              prenom: prenom.trim(),
              nom: nom.trim(),
            },
          },
        });
        if (authError) throw new Error(authError.message);
        userId = authData.user?.id ?? null;
        if (!userId) throw new Error("Aucun utilisateur retourné après inscription.");
      }

      if (!userId) throw new Error("Impossible de créer le profil : utilisateur introuvable.");

      const { error: upErr } = await supabase.from("profiles").upsert({
        id: userId,
        full_name: `${prenom} ${nom}`,
        prenom,
        nom,
        role: "expert",
        telephone,
        specialite,
      });
      if (upErr) throw new Error(upErr.message);

      toast.success("Expert créé avec succès");
      setCreateModalOpen(false);
      setCreateForm({
        prenom: "",
        nom: "",
        email: "",
        password: "",
        specialite: SPECIALITES[0],
        telephone: "",
      });
      await loadAll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg);
    } finally {
      setCreateSubmitting(false);
    }
  }

  function saveObjectifs() {
    if (!perfExpert) return;
    try {
      localStorage.setItem(`objectifs_${perfExpert.profile.id}`, JSON.stringify(objectifsForm));
      toast.success("Objectifs enregistrés.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Impossible d'enregistrer.");
    }
  }

  const showAssureTable = filter === "all" || filter === "assure";
  const showExpertTable = filter === "expert";

  return isSubRoute ? (
    <Outlet />
  ) : (
    <div className="min-h-[60vh] bg-[#F8F9FF]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-[#111827]">Utilisateurs</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Gérez les assurés et les experts de la plateforme
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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

          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border-2 border-[#5B50F0] bg-white px-4 py-2 text-sm font-semibold text-[#5B50F0] transition-colors hover:bg-[#F5F3FF]"
          >
            <UserPlus className="h-4 w-4 shrink-0" aria-hidden />+ Créer un expert
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
        ) : showExpertTable ? (
          expertTableRows.length === 0 ? (
            <div className="p-6 text-sm text-[#6B7280]">Aucun expert enregistré.</div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-[#F9FAFB]">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-5 py-4">Nom</th>
                    <th className="px-5 py-4">Spécialité</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Dossiers en cours</th>
                    <th className="px-5 py-4">Taux de succès</th>
                    <th className="px-5 py-4">Revenu généré</th>
                    <th className="px-5 py-4">Statut</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expertTableRows.map((row) => (
                    <tr
                      key={row.profile.id}
                      className="border-b border-[#F3F4F6] hover:bg-[#F8F9FF]"
                    >
                      <td className="px-5 py-4 text-sm font-semibold text-[#111827]">
                        {row.nomAffiche}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${specialiteBadgeClass(row.specialite)}`}
                        >
                          {row.specialite}
                        </span>
                      </td>
                      <td className="max-w-[200px] truncate px-5 py-4 text-sm text-[#374151]">
                        {row.email}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-[#111827]">
                        {row.dossiersEnCours}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-[#111827]">
                        {row.tauxSucces == null ? "Non renseigné" : `${row.tauxSucces}%`}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-[#5B50F0]">
                        {eur(row.revenuGenere)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(row.statut)}`}
                        >
                          {row.statut}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setPerfExpert(row)}
                            className="rounded-lg bg-[#F3F4F6] px-3 py-2 text-sm font-medium text-[#111827] hover:bg-[#E5E7EB]"
                          >
                            Voir performance
                          </button>
                          <button
                            type="button"
                            onClick={() => window.alert("Fonctionnalité bientôt disponible")}
                            className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                          >
                            Suspendre
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : filteredAssures.length === 0 ? (
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
                {filteredAssures.map((u: any) => {
                  const prenom = String(u.prenom ?? "").trim();
                  const nom = String(u.nom ?? "").trim();
                  const dossierName = `${prenom} ${nom}`.trim();
                  const profileFullName =
                    typeof u.profile?.full_name === "string"
                      ? String(u.profile.full_name).trim()
                      : "";

                  let primary: string;
                  let subtitle: ReactNode = "Non renseigné";

                  if (profileFullName) {
                    primary = profileFullName;
                  } else if (dossierName) {
                    primary = dossierName;
                  } else {
                    primary = `Utilisateur ${u.id.slice(0, 8)}`;
                    subtitle = <span className="italic text-[#6B7280]">Nom non renseigné</span>;
                  }

                  const createdLabel = u.date_inscription
                    ? new Date(u.date_inscription).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "Non renseigné";

                  return (
                    <tr key={u.id} className="border-b border-[#F3F4F6] hover:bg-[#F8F9FF]">
                      <td className="px-5 py-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#111827]">{primary}</p>
                          <p className="truncate text-xs text-[#6B7280]">{subtitle}</p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${roleBadgeClass("assure")}`}
                        >
                          Assuré
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-[#111827]">{createdLabel}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-[#111827]">
                        {u.nb_dossiers}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(u.statut)}`}
                        >
                          {u.statut}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate({
                                to: "/admin/utilisateurs/$userId",
                                params: { userId: u.id },
                              });
                            }}
                            style={{
                              background: "white",
                              border: "1px solid #E5E7EB",
                              borderRadius: "8px",
                              padding: "6px 14px",
                              cursor: "pointer",
                              fontSize: "0.875rem",
                            }}
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

      {createModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="relative w-full max-w-[480px] rounded-2xl bg-white shadow-[0_18px_60px_rgba(0,0,0,0.25)]"
            style={{ padding: "32px", borderRadius: "16px" }}
          >
            <button
              type="button"
              aria-label="Fermer"
              onClick={() => !createSubmitting && setCreateModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-[#6B7280] hover:bg-[#F3F4F6]"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="pr-10 text-xl font-bold text-[#111827]" style={{ fontWeight: 700 }}>
              Nouvel expert
            </h2>
            <p className="mt-1 text-sm text-[#6B7280]">Créer un compte expert</p>

            <form className="mt-6 space-y-4" onSubmit={(e) => void submitCreateExpert(e)}>
              <div>
                <label className="text-xs font-semibold text-[#6B7280]">Prénom *</label>
                <input
                  required
                  value={createForm.prenom}
                  onChange={(e) => setCreateForm((f) => ({ ...f, prenom: e.target.value }))}
                  className="mt-1 h-11 w-full rounded-lg border border-[#E5E7EB] px-3 text-sm outline-none focus:border-[#5B50F0] focus:ring-1 focus:ring-[#5B50F0]/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#6B7280]">Nom *</label>
                <input
                  required
                  value={createForm.nom}
                  onChange={(e) => setCreateForm((f) => ({ ...f, nom: e.target.value }))}
                  className="mt-1 h-11 w-full rounded-lg border border-[#E5E7EB] px-3 text-sm outline-none focus:border-[#5B50F0] focus:ring-1 focus:ring-[#5B50F0]/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#6B7280]">Email *</label>
                <input
                  required
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                  className="mt-1 h-11 w-full rounded-lg border border-[#E5E7EB] px-3 text-sm outline-none focus:border-[#5B50F0] focus:ring-1 focus:ring-[#5B50F0]/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#6B7280]">
                  Mot de passe temporaire *
                </label>
                <input
                  required
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                  className="mt-1 h-11 w-full rounded-lg border border-[#E5E7EB] px-3 text-sm outline-none focus:border-[#5B50F0] focus:ring-1 focus:ring-[#5B50F0]/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#6B7280]">Spécialité</label>
                <select
                  value={createForm.specialite}
                  onChange={(e) => setCreateForm((f) => ({ ...f, specialite: e.target.value }))}
                  className="mt-1 h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm outline-none focus:border-[#5B50F0] focus:ring-1 focus:ring-[#5B50F0]/20"
                >
                  {SPECIALITES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#6B7280]">Téléphone</label>
                <input
                  value={createForm.telephone}
                  onChange={(e) => setCreateForm((f) => ({ ...f, telephone: e.target.value }))}
                  className="mt-1 h-11 w-full rounded-lg border border-[#E5E7EB] px-3 text-sm outline-none focus:border-[#5B50F0] focus:ring-1 focus:ring-[#5B50F0]/20"
                />
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={createSubmitting}
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-lg bg-[#F3F4F6] px-4 py-2.5 text-sm font-semibold text-[#374151] hover:bg-[#E5E7EB] disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: "#5B50F0" }}
                >
                  {createSubmitting ? "…" : "Créer le compte →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {perfExpert && perfMetrics ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-[0_18px_60px_rgba(0,0,0,0.25)]"
            style={{ padding: "32px", borderRadius: "16px" }}
          >
            <button
              type="button"
              aria-label="Fermer"
              onClick={() => setPerfExpert(null)}
              className="absolute right-4 top-4 rounded-lg p-2 text-[#6B7280] hover:bg-[#F3F4F6]"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="pr-10">
              <h2 className="text-xl font-bold text-[#111827]">{perfExpert.nomAffiche}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${specialiteBadgeClass(perfExpert.specialite)}`}
                >
                  {perfExpert.specialite}
                </span>
                <span className="text-sm text-[#6B7280]">
                  Compte créé le{" "}
                  {new Date(perfExpert.profile.created_at).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {(
                [
                  ["7d", "7 jours"],
                  ["30d", "30 jours"],
                  ["90d", "90 jours"],
                  ["1y", "1 an"],
                  ["all", "Tout"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPerfPeriod(key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    perfPeriod === key
                      ? "bg-[#5B50F0] text-white"
                      : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFBFF] p-4">
                <div className="flex items-center gap-2 text-[#6B7280]">
                  <Award className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Dossiers traités
                  </span>
                </div>
                <p className="mt-2 text-2xl font-bold text-[#111827]">{perfMetrics.traites}</p>
              </div>
              <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFBFF] p-4">
                <div className="flex items-center gap-2 text-[#6B7280]">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Dossiers en cours
                  </span>
                </div>
                <p className="mt-2 text-2xl font-bold text-[#111827]">{perfMetrics.enCours}</p>
              </div>
              <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFBFF] p-4">
                <div className="flex items-center gap-2 text-[#6B7280]">
                  <Target className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Taux de succès
                  </span>
                </div>
                <p className="mt-2 text-2xl font-bold text-[#111827]">
                  {perfMetrics.taux == null ? "Non renseigné" : `${perfMetrics.taux}%`}
                </p>
              </div>
              <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFBFF] p-4">
                <div className="flex items-center gap-2 text-[#6B7280]">
                  <UserPlus className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Revenu généré
                  </span>
                </div>
                <p className="mt-2 text-2xl font-bold text-[#5B50F0]">{eur(perfMetrics.revenu)}</p>
              </div>
            </div>

            <section className="mt-8 rounded-xl border border-[#E5E7EB] bg-white p-5">
              <h3 className="text-sm font-bold text-[#111827]">Objectifs du mois</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-[#6B7280]">Objectif dossiers</label>
                  <input
                    type="number"
                    min={1}
                    value={objectifsForm.objectifDossiers}
                    onChange={(e) =>
                      setObjectifsForm((o) => ({
                        ...o,
                        objectifDossiers: Math.max(1, Number(e.target.value) || 1),
                      }))
                    }
                    className="mt-1 h-10 w-full rounded-lg border border-[#E5E7EB] px-3 text-sm"
                  />
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#EEE9FF]">
                    <div
                      className={`h-full rounded-full transition-all ${progressTone(progressDossiersPct)}`}
                      style={{ width: `${progressDossiersPct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-[#6B7280]">
                    {perfMetrics.traites} / {objectifsForm.objectifDossiers} ({progressDossiersPct}
                    %)
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#6B7280]">Objectif revenu €</label>
                  <input
                    type="number"
                    min={1}
                    value={objectifsForm.objectifRevenu}
                    onChange={(e) =>
                      setObjectifsForm((o) => ({
                        ...o,
                        objectifRevenu: Math.max(1, Number(e.target.value) || 1),
                      }))
                    }
                    className="mt-1 h-10 w-full rounded-lg border border-[#E5E7EB] px-3 text-sm"
                  />
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#EEE9FF]">
                    <div
                      className={`h-full rounded-full transition-all ${progressTone(progressRevenuPct)}`}
                      style={{ width: `${progressRevenuPct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-[#6B7280]">
                    {eur(perfMetrics.revenu)} / {eur(objectifsForm.objectifRevenu)} (
                    {progressRevenuPct}%)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => saveObjectifs()}
                className="mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: "#5B50F0" }}
              >
                Sauvegarder les objectifs
              </button>
            </section>

            <section className="mt-8">
              <h3 className="text-sm font-bold text-[#111827]">Historique dossiers</h3>
              <ul className="mt-3 space-y-3">
                {perfMetrics.derniers.map((d) => (
                  <li
                    key={d.id}
                    className="rounded-lg border border-[#F3F4F6] bg-[#FAFBFF] px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-[#111827]">
                        {d.type_sinistre ?? "Non renseigné"}
                      </span>
                      <span className="text-sm font-semibold text-[#5B50F0]">
                        {eur(amountValue(d.montant_estime))}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-full bg-[#F3F4F6] px-2 py-0.5 text-xs font-medium text-[#6B7280]">
                        {d.statut ?? "Non renseigné"}
                      </span>
                      <span className="text-xs text-[#6B7280]">
                        {new Date(d.date_ouverture).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => setPerfExpert(null)}
                className="rounded-lg bg-[#F3F4F6] px-5 py-2.5 text-sm font-semibold text-[#374151] hover:bg-[#E5E7EB]"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default AdminUtilisateursPage;
