import { Download, Eye, FileText, Image as ImageIcon, X } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatDocumentStatusDb } from "@/lib/client-dashboard-ui";
import type { Document } from "@/types";

function cardClass() {
  return "rounded-[12px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_8px_rgba(0,0,0,0.06)]";
}

function docIcon(nom: string) {
  const lower = nom.toLowerCase();
  if (lower.endsWith(".pdf")) return <FileText className="h-5 w-5 shrink-0 text-red-600" aria-hidden />;
  if (/\.(png|jpg|jpeg|webp|gif)$/i.test(lower))
    return <ImageIcon className="h-5 w-5 shrink-0 text-[#5B50F0]" aria-hidden />;
  return <FileText className="h-5 w-5 shrink-0 text-[#6B7280]" aria-hidden />;
}

function storagePathFor(doc: Document): string | null {
  const raw = doc as Document & { storage_path?: string | null };
  const chemin = doc.chemin ?? null;
  const path = chemin ?? raw.storage_path ?? doc.nom;
  return path && String(path).trim() ? String(path).trim() : null;
}

function previewKindFromNom(nom: string): "pdf" | "image" | "other" {
  const lower = nom.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (/\.(jpg|jpeg|png|webp)$/i.test(lower)) return "image";
  return "other";
}

export type DossierDocumentsSectionProps = {
  documents: Document[];
  onTelecharger: (doc: Document) => void | Promise<void>;
  onApercu: (doc: Document) => void;
};

export function DossierDocumentsSection({ documents, onTelecharger, onApercu }: DossierDocumentsSectionProps) {
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [previewSignedUrl, setPreviewSignedUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const closePreview = useCallback(() => {
    setPreviewDoc(null);
    setPreviewSignedUrl(null);
    setPreviewError(false);
    setPreviewLoading(false);
  }, []);

  async function openPreview(doc: Document) {
    onApercu(doc);
    const path = storagePathFor(doc);
    if (!path) {
      toast.error("Chemin de fichier manquant.");
      setPreviewDoc(doc);
      setPreviewSignedUrl(null);
      setPreviewError(true);
      setPreviewLoading(false);
      return;
    }
    setPreviewDoc(doc);
    setPreviewSignedUrl(null);
    setPreviewError(false);
    setPreviewLoading(true);
    try {
      const { data, error } = await supabase.storage.from("documents").createSignedUrl(path, 3600);
      if (error || !data?.signedUrl) throw error ?? new Error("signed url");
      setPreviewSignedUrl(data.signedUrl);
    } catch {
      setPreviewError(true);
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleTelecharger(doc: Document) {
    setDownloadingId(doc.id);
    try {
      await Promise.resolve(onTelecharger(doc));
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <>
      {previewDoc ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div role="presentation" className="absolute inset-0 bg-[rgba(0,0,0,0.7)]" onClick={closePreview} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-doc-title"
            className="relative z-10 flex max-h-[90vh] w-[90vw] max-w-[900px] flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#E5E7EB] px-6 py-5">
              <h2 id="preview-doc-title" className="min-w-0 flex-1 break-words pr-2 text-base font-semibold text-[#111827]">
                {previewDoc.nom}
              </h2>
              <button
                type="button"
                onClick={closePreview}
                className="shrink-0 rounded-lg p-2 text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827]"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-6">
              {previewLoading ? (
                <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 py-12">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#5B50F0]" />
                  <p className="text-sm font-medium text-[#6B7280]">Chargement de l&apos;aperçu…</p>
                </div>
              ) : previewError || !previewSignedUrl ? (
                <div className="flex flex-col items-center justify-center gap-6 py-8 text-center">
                  <p className="max-w-md text-sm leading-relaxed text-[#374151]">
                    Impossible de charger l&apos;aperçu. Essayez de télécharger le fichier.
                  </p>
                  <button
                    type="button"
                    onClick={() => void handleTelecharger(previewDoc)}
                    disabled={downloadingId === previewDoc.id}
                    className="inline-flex items-center gap-2 rounded-[10px] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                    style={{ backgroundColor: "#5B50F0" }}
                  >
                    <Download className="h-4 w-4" aria-hidden />
                    Télécharger
                  </button>
                </div>
              ) : (
                (() => {
                  const kind = previewKindFromNom(previewDoc.nom);
                  if (kind === "pdf") {
                    return (
                      <iframe
                        title={previewDoc.nom}
                        src={previewSignedUrl}
                        className="w-full rounded-lg border-0"
                        style={{ height: "70vh", border: "none", borderRadius: "8px" }}
                      />
                    );
                  }
                  if (kind === "image") {
                    return (
                      <img
                        src={previewSignedUrl}
                        alt={previewDoc.nom}
                        className="mx-auto rounded-lg"
                        style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: "8px" }}
                      />
                    );
                  }
                  return (
                    <div className="flex flex-col items-center justify-center gap-6 py-8 text-center">
                      <p className="text-sm leading-relaxed text-[#374151]">Aperçu non disponible pour ce type de fichier</p>
                      <button
                        type="button"
                        onClick={() => void handleTelecharger(previewDoc)}
                        disabled={downloadingId === previewDoc.id}
                        className="inline-flex items-center gap-2 rounded-[10px] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                        style={{ backgroundColor: "#5B50F0" }}
                      >
                        <Download className="h-4 w-4" aria-hidden />
                        Télécharger
                      </button>
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      ) : null}

      <section className={`${cardClass()} mt-6`}>
        <div className="mb-6 flex items-center gap-2 border-b border-[#F3F4F6] pb-4">
          <FileText className="h-5 w-5 text-[#5B50F0]" aria-hidden />
          <h2 className="text-lg font-semibold text-[#111827]">Documents ({documents.length})</h2>
        </div>
        {documents.length === 0 ? (
          <p className="text-sm text-[#6B7280]">Aucun document</p>
        ) : (
          <ul className="space-y-3">
            {documents.map((doc) => {
              const st = formatDocumentStatusDb(doc.statut);
              return (
                <li
                  key={doc.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#F3F4F6] bg-[#FAFBFF] px-4 py-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => void openPreview(doc)}
                      className="flex min-w-0 flex-1 items-center gap-3 rounded-md text-left transition-opacity hover:opacity-80"
                    >
                      {docIcon(doc.nom)}
                      <span className="truncate text-sm font-medium text-[#111827]">{doc.nom}</span>
                    </button>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${st.className}`}>{st.label}</span>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void openPreview(doc)}
                      className="inline-flex items-center gap-2 rounded-lg border border-solid border-[#E5E7EB] bg-white px-[14px] py-2 text-sm font-semibold text-[#111827] hover:bg-[#F9FAFB]"
                      style={{ paddingTop: 8, paddingBottom: 8 }}
                    >
                      <Eye className="h-4 w-4 shrink-0" aria-hidden />
                      Aperçu
                    </button>
                    <button
                      type="button"
                      disabled={downloadingId === doc.id}
                      onClick={() => void handleTelecharger(doc)}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#5B50F0] bg-white px-3 py-2 text-sm font-semibold text-[#5B50F0] hover:bg-[#F5F3FF] disabled:opacity-50"
                    >
                      <Download className="h-4 w-4" aria-hidden />
                      Télécharger
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
