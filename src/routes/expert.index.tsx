import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { LogOut, ArrowRight, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/expert/")({
  component: ExpertHome,
});

function ExpertHome() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dossiers, setDossiers] = useState<
    Array<{
      id: string;
      type_sinistre: string;
      statut: string;
      date_ouverture: string;
      montant_estime: number;
    }>
  >([]);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("dossiers")
        .select("id,type_sinistre,statut,date_ouverture,montant_estime")
        .eq("expert_id", user.id)
        .order("date_ouverture", { ascending: false });
      if (cancelled) return;
      if (error) {
        toast.error(error.message);
        setDossiers([]);
      } else {
        setDossiers((data as any[]) ?? []);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const prenom = useMemo(() => {
    const raw =
      (user?.user_metadata && typeof user.user_metadata.full_name === "string" ? user.user_metadata.full_name : "") ||
      (user?.email ?? "");
    const t = raw.trim();
    if (!t) return "";
    return t.split(/\s+/)[0] ?? "";
  }, [user?.email, user?.user_metadata]);

  const derived = useMemo(() => {
    const isClosed = (s: string) => s === "gagne" || s === "perdu" || s === "clos";
    const actifs = dossiers.filter((d) => !isClosed(d.statut)).length;
    const clotures = dossiers.filter((d) => isClosed(d.statut)).length;
    const total = dossiers.reduce((sum, d) => sum + (Number(d.montant_estime) || 0), 0);
    return { actifs, clotures, total };
  }, [dossiers]);

  const totalLabel = useMemo(() => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(derived.total);
  }, [derived.total]);

  async function handleLogout() {
    await signOut();
    navigate({ to: "/login", replace: true });
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Bonjour {prenom || "Expert"}
            </h1>
            <span className="inline-flex items-center rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              Expert
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Suivez vos dossiers assignés et accédez rapidement aux informations clés.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleLogout()}
          className="inline-flex items-center gap-2 rounded-lg border-2 border-border bg-white px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          <LogOut className="h-4 w-4 text-muted-foreground" />
          Logout
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-5 shadow-[var(--shadow-soft)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dossiers actifs</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">{derived.actifs}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-5 shadow-[var(--shadow-soft)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dossiers clôturés</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">{derived.clotures}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-5 shadow-[var(--shadow-soft)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Montant total estimé</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">{totalLabel}</p>
        </div>
      </div>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Dossiers assignés</h2>
          <p className="text-sm text-muted-foreground">{dossiers.length} dossier(s)</p>
        </div>

        {loading ? (
          <div className="mt-4 flex justify-center py-24">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-primary" />
          </div>
        ) : dossiers.length === 0 ? (
          <div className="mt-4 rounded-xl border border-border bg-white p-10 text-center shadow-[var(--shadow-soft)]">
            <p className="text-sm font-medium text-foreground">Aucun dossier assigné</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Dès qu'un dossier vous sera attribué, il apparaîtra ici.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {dossiers.map((d) => (
              <div key={d.id} className="rounded-xl border border-border bg-white p-5 shadow-[var(--shadow-soft)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                      <FileText className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{d.type_sinistre}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Ouvert le{" "}
                        {new Date(d.date_ouverture).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <StatusBadgeExpert statut={d.statut} />
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-foreground">
                    {Number(d.montant_estime).toLocaleString("fr-FR")} €
                  </p>
                  <Link
                    to="/expert/dossiers/$id"
                    params={{ id: d.id }}
                    className="inline-flex items-center gap-2 rounded-lg border-2 border-primary bg-transparent px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
                  >
                    Voir le dossier <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function StatusBadgeExpert({ statut }: { statut: string }) {
  const bucket = statut === "attente_documents" ? "waiting" : statut === "gagne" || statut === "perdu" || statut === "clos" ? "closed" : "active";
  const ui =
    bucket === "waiting"
      ? { label: "En attente", cls: "bg-accent/10 text-accent" }
      : bucket === "closed"
        ? { label: "Clos", cls: "bg-muted text-muted-foreground" }
        : { label: "En cours", cls: "bg-sky-500/10 text-sky-700" };
  return (
    <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold ${ui.cls}`}>
      {ui.label}
    </span>
  );
}

