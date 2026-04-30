import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/site/Logo";
import { AppGuard } from "@/components/app/AppGuard";
import { QUALIFICATION_STORAGE_KEYS } from "@/lib/qualificationLocalStorage";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Mandat de représentation ,  Vertual" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: OnboardingPage,
});

function normalizeForSignature(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function signatureMatchesMandant(signature: string, reference: string): boolean {
  const sig = normalizeForSignature(signature);
  const ref = normalizeForSignature(reference);
  if (sig.length < 3 || ref.length < 2) return false;
  if (sig === ref) return true;
  if (ref.includes(sig) || sig.includes(ref)) return true;
  const sigParts = sig.split(" ").filter((p) => p.length > 1);
  if (sigParts.length === 0) return false;
  return sigParts.every((part) => ref.includes(part));
}

function mandantReferenceForMatch(user: User | null): string {
  if (!user) return "";
  const meta = user.user_metadata as { full_name?: string } | undefined;
  const fn = typeof meta?.full_name === "string" ? meta.full_name.trim() : "";
  const email = user.email?.trim() ?? "";
  const local = email.includes("@") ? email.split("@")[0].replace(/\./g, " ") : email;
  return [fn, local, email].filter(Boolean).join(" ");
}

function isMandatSigned(profile: { mandat_signe?: boolean } | null | undefined, user: User | null): boolean {
  if (!user) return false;
  const meta = user.user_metadata as { mandat_signe?: boolean } | undefined;
  return profile?.mandat_signe === true || meta?.mandat_signe === true;
}

function generateMandatText(userEmail: string, signature: string, date: string, userId: string): string {
  return `MANDAT DE REPRÉSENTATION ET CONVENTION D'HONORAIRES

Date de signature : ${date}
Signataire : ${signature}
Email : ${userEmail}

Mandant : ${signature}
Mandataire : Vertual

Article 1 - Objet du mandat
Le mandant confie à Vertual mission de le représenter 
et défendre ses intérêts auprès de son assureur 
pour tout sinistre confié à la plateforme.

Article 2 - Étendue du mandat
Vertual est autorisée à contacter l'assureur, accéder 
aux pièces du dossier, mandater un expert agréé et 
négocier le montant de l'indemnisation.
Vertual ne peut pas accepter une offre sans accord 
explicite du mandant.

Article 3 - Honoraires
Rémunération au succès uniquement : 10% HT du montant 
supplémentaire obtenu. Aucun frais en cas d'échec.

Article 4 - Engagements du mandant
Fournir les documents demandés et informer Vertual 
de tout contact direct avec l'assureur.

Article 5 - Durée et résiliation
Prend effet à la signature électronique.
Résiliable à tout moment avec préavis de 15 jours.

Article 6 - Droit applicable
Soumis au droit français.

---
Document signé électroniquement le ${date}
Signature : ${signature}
Référence : MANDAT-${userId.slice(0, 8)}-${Date.now()}
`;
}

async function persistSignedMandatAsDocument(user: User, signatureText: string, signedAtIso: string) {
  const email = user.email?.trim() ?? "";
  if (!email) {
    console.error("persistSignedMandatAsDocument: email manquant");
    return;
  }
  try {
    const dateLabel = new Date(signedAtIso).toLocaleDateString("fr-FR");
    const mandatContent = generateMandatText(email, signatureText, dateLabel, user.id);
    const blob = new Blob([mandatContent], { type: "text/plain;charset=utf-8" });
    const fileName = `mandats/${user.id}/mandat_${Date.now()}.txt`;

    const { error: uploadError } = await supabase.storage.from("documents").upload(fileName, blob, {
      contentType: "text/plain",
      upsert: true,
    });
    if (uploadError) {
      console.error("Mandat storage upload:", uploadError);
      return;
    }

    const nom = `Mandat de représentation - ${dateLabel}`;
    const fullRow = {
      user_id: user.id,
      nom,
      chemin: fileName,
      storage_path: fileName,
      statut: "signé",
      type: "mandat",
      dossier_id: null as string | null,
    };

    const { error: insertErr } = await supabase.from("documents").insert(fullRow);
    if (insertErr) console.error("Mandat document insert:", insertErr);
  } catch (e) {
    console.error("persistSignedMandatAsDocument:", e);
  }
}

function OnboardingPage() {
  return (
    <AppGuard signInRedirect="/login">
      <OnboardingContent />
    </AppGuard>
  );
}

function OnboardingContent() {
  const navigate = useNavigate();
  const { user, loading, isAdmin, isExpert } = useAuth();
  const [checking, setChecking] = useState(true);
  const [mandatAccepted, setMandatAccepted] = useState(false);
  const [signatureText, setSignatureText] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const mandantRef = useMemo(() => mandantReferenceForMatch(user), [user]);
  const dateShort = useMemo(
    () =>
      new Date().toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    [],
  );

  useEffect(() => {
    if (loading || !user) return;
    if (isAdmin) {
      navigate({ to: "/admin", replace: true });
      return;
    }
    if (isExpert) {
      navigate({ to: "/expert", replace: true });
      return;
    }

    let cancelled = false;
    void (async () => {
      setChecking(true);
      const { data } = await supabase.from("profiles").select("mandat_signe").eq("id", user.id).maybeSingle();
      if (cancelled) return;
      if (isMandatSigned(data ?? undefined, user)) {
        navigate({ to: "/dashboard", replace: true });
        return;
      }
      setChecking(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, loading, isAdmin, isExpert, navigate]);

  async function handleSignAndContinue(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id || !user.email) {
      toast.error("Session invalide.");
      return;
    }
    setFormError(null);
    if (!mandatAccepted) {
      setFormError("Vous devez accepter le mandat pour continuer.");
      return;
    }
    const sig = signatureText.trim();
    if (!sig) {
      setFormError("Veuillez signer en indiquant votre nom complet.");
      return;
    }
    if (!signatureMatchesMandant(sig, mandantRef)) {
      setFormError("La signature ne correspond pas à votre identité (nom ou email).");
      return;
    }

    const signedAt = new Date().toISOString();
    setSaving(true);
    try {
      const { error: upErr } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          mandat_signe: true,
          mandat_signe_le: signedAt,
          mandat_signature: sig,
          mandat_email: user.email,
        },
        { onConflict: "id" },
      );

      const { error: metaErr } = await supabase.auth.updateUser({
        data: {
          mandat_signe: true,
          mandat_signe_le: signedAt,
          mandat_signature: sig,
        },
      });

      if (upErr && metaErr) throw upErr;
      if (metaErr && !upErr) console.warn("Mandat enregistré en base ; métadonnées session :", metaErr.message);

      await persistSignedMandatAsDocument(user, sig, signedAt);

      const hasEvaluation =
        typeof window !== "undefined" && !!window.localStorage.getItem(QUALIFICATION_STORAGE_KEYS.evaluation);
      navigate({ to: hasEvaluation ? "/dashboard/nouveau" : "/dashboard", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossible d'enregistrer votre signature.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FF] px-5">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#5B50F0]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF] px-5 py-8 sm:px-8 sm:py-12">
      <header className="flex justify-center">
        <Link to="/" className="inline-block" aria-label="Accueil Vertual">
          <Logo />
        </Link>
      </header>

      <div className="mx-auto mt-10 max-w-[640px]">
        <div className="mb-10 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check className="h-5 w-5" strokeWidth={2.5} aria-hidden />
            </div>
            <span className="text-center text-xs font-medium text-emerald-700 sm:text-sm">Compte créé ✓</span>
          </div>
          <div className="h-px flex-1 bg-[#E5E7EB]" aria-hidden />
          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5B50F0] text-sm font-bold text-white">
              2
            </div>
            <span className="text-center text-xs font-semibold text-[#5B50F0] sm:text-sm">Mandat</span>
          </div>
          <div className="h-px flex-1 bg-[#E5E7EB]" aria-hidden />
          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#E5E7EB] bg-white text-sm font-semibold text-[#9CA3AF]">
              3
            </div>
            <span className="text-center text-xs font-medium text-[#9CA3AF] sm:text-sm">Mon dossier</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:p-10">
          <h1 className="text-center text-xl font-semibold tracking-tight text-[#111827] sm:text-2xl">
            Une dernière étape avant de commencer
          </h1>
          <p className="mt-3 text-center text-sm leading-relaxed text-[#6B7280] sm:text-base">
            Signez notre mandat pour que nous puissions défendre vos intérêts auprès de votre assureur.
          </p>

          <div className="mt-6 rounded-lg border border-emerald-500/40 bg-[#F0FFFE] px-4 py-3 text-sm leading-relaxed text-[#065F46]">
            <p>✓ Gratuit si nous n&apos;obtenons rien</p>
            <p className="mt-1">✓ Vous restez décisionnaire à chaque étape</p>
            <p className="mt-1">✓ Résiliable à tout moment</p>
          </div>

          <form onSubmit={(e) => void handleSignAndContinue(e)} className="mt-6 space-y-6">
            <div
              className="overflow-y-auto rounded-xl border border-[#E5E7EB] bg-[#F8F9FF] p-8 text-[0.875rem] leading-[1.7] text-[#374151]"
              style={{ height: 360 }}
            >
              <p className="text-center text-sm font-bold uppercase tracking-wide text-[#111827]">
                MANDAT DE REPRÉSENTATION ET CONVENTION D&apos;HONORAIRES
              </p>
              <p className="mt-6">
                <span className="font-semibold">Mandant :</span> {user?.email ?? "—"}
              </p>
              <p className="mt-2">
                <span className="font-semibold">Mandataire :</span> Vertual
              </p>
              <p className="mt-2">
                <span className="font-semibold">Date :</span> {dateShort}
              </p>
              <p className="mt-6 font-semibold text-[#111827]">Article 1 - Objet</p>
              <p className="mt-2">
                Vous confiez à Vertual mission de vous représenter et défendre vos intérêts auprès de votre assureur
                pour tout sinistre confié à la plateforme.
              </p>
              <p className="mt-6 font-semibold text-[#111827]">Article 2 - Ce que Vertual peut faire en votre nom</p>
              <p className="mt-2">
                Vertual est autorisée à contacter votre assureur, accéder aux pièces de votre dossier, mandater un
                expert agréé et négocier le montant de votre indemnisation.
              </p>
              <p className="mt-2">Vertual ne peut pas accepter une offre sans votre accord explicite.</p>
              <p className="mt-6 font-semibold text-[#111827]">Article 3 - Honoraires</p>
              <p className="mt-2">
                Vertual est rémunérée uniquement en cas de succès : 10% HT du montant supplémentaire obtenu au-delà
                de l&apos;offre initiale de votre assureur. Aucun frais si nous n&apos;obtenons rien.
              </p>
              <p className="mt-6 font-semibold text-[#111827]">Article 4 - Vos engagements</p>
              <p className="mt-2">
                Vous vous engagez à fournir les documents demandés et à informer Vertual de tout contact direct avec
                votre assureur.
              </p>
              <p className="mt-6 font-semibold text-[#111827]">Article 5 - Durée et résiliation</p>
              <p className="mt-2">
                Ce mandat prend effet à la signature électronique et peut être résilié à tout moment par email avec un
                préavis de 15 jours.
              </p>
              <p className="mt-6 font-semibold text-[#111827]">Article 6 - Droit applicable</p>
              <p className="mt-2">Ce mandat est soumis au droit français.</p>
            </div>

            <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-[#374151]">
              <input
                type="checkbox"
                checked={mandatAccepted}
                onChange={(e) => {
                  setMandatAccepted(e.target.checked);
                  if (e.target.checked) setFormError(null);
                }}
                className="mt-1 h-4 w-4 shrink-0 rounded border-[#E5E7EB] text-[#5B50F0] focus:ring-[#5B50F0]/30"
              />
              <span>
                J&apos;ai lu et j&apos;accepte le mandat de représentation et la convention d&apos;honoraires (10% du
                gain obtenu)
              </span>
            </label>

            <div>
              <label className="block text-sm font-medium text-[#111827]">Signez en tapant votre nom complet</label>
              <input
                type="text"
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                placeholder="Prénom Nom"
                className="mt-2 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] outline-none focus:border-[#5B50F0] focus:ring-2 focus:ring-[#5B50F0]/20"
                autoComplete="name"
              />
            </div>

            {formError && <p className="text-sm font-medium text-destructive">{formError}</p>}

            <button
              type="submit"
              disabled={saving || !mandatAccepted || !signatureText.trim()}
              className="w-full rounded-[10px] bg-[#5B50F0] px-7 py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-45"
            >
              {saving ? "Enregistrement…" : "Signer et accéder à mon espace →"}
            </button>
          </form>

          <p className="mt-8 text-center text-[0.8rem] text-[#9CA3AF]">
            <a href="mailto:contact@vertual.fr" className="underline decoration-[#9CA3AF]/50 hover:text-[#6B7280]">
              Questions sur ce mandat ? Contactez-nous
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
