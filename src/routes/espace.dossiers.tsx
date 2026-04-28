import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, FileText, Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { StatusBadge } from "@/components/app/StatusBadge";
import { claimTypeLabel } from "@/lib/claim-types";

export const Route = createFileRoute("/espace/dossiers")({
  component: DossiersPage,
});

interface CaseRow {
  id: string;
  reference: string;
  title: string;
  claim_type: string;
  status: string;
  estimated_amount: number | null;
  created_at: string;
}

function DossiersPage() {
  const { user } = useAuth();
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("cases")
      .select("id,reference,title,claim_type,status,estimated_amount,created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setCases((data as CaseRow[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Mes dossiers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Suivez l'avancement de vos recours et échangez avec nos experts.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-glow"
        >
          <Plus className="h-4 w-4" />
          Aller au dashboard
        </Link>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="rounded-lg border border-border bg-background p-12 text-center text-sm text-muted-foreground">
            Chargement...
          </div>
        ) : cases.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-background p-12 text-center">
            <Inbox className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">Aucun dossier pour le moment</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Créez votre premier dossier pour démarrer la qualification.
            </p>
            <Link
              to="/dashboard"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
              Aller au dashboard
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cases.map((c) => (
              <Link
                key={c.id}
                to="/dashboard/dossiers/$id"
                params={{ id: c.id }}
                className="group rounded-lg border border-border bg-background p-5 transition hover:border-primary/40 hover:shadow-[var(--shadow-soft)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <StatusBadge status={c.status} />
                </div>
                <h3 className="mt-3 font-semibold text-foreground line-clamp-2 group-hover:text-primary">
                  {c.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {claimTypeLabel(c.claim_type)} · Réf. {c.reference}
                </p>
                {c.estimated_amount != null && (
                  <p className="mt-3 text-sm font-medium text-foreground">
                    Estimation : {Number(c.estimated_amount).toLocaleString("fr-FR")} €
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
