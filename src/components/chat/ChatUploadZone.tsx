import { useRef, useState } from "react";
import { X } from "lucide-react";

export type ChatUploadZoneProps = {
  onEnvoyer: (files: File[]) => Promise<void>;
  isUploading: boolean;
};

export function ChatUploadZone({ onEnvoyer, isUploading }: ChatUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function addFiles(incoming: File[]) {
    const acceptedExt = [".pdf", ".jpg", ".jpeg", ".png"];
    const maxBytes = 10 * 1024 * 1024;

    const next: File[] = [];
    for (const f of incoming) {
      const nameLower = f.name.toLowerCase();
      const okExt = acceptedExt.some((ext) => nameLower.endsWith(ext));
      if (!okExt) continue;
      if (f.size > maxBytes) continue;
      next.push(f);
    }

    const rejectedCount = incoming.length - next.length;
    if (rejectedCount > 0) {
      setUploadError("Certains fichiers ont été ignorés (formats: PDF/JPG/PNG, 10 Mo max par fichier).");
    } else {
      setUploadError(null);
    }

    setSelectedFiles((prev) => {
      const merged = [...prev];
      for (const f of next) {
        const exists = merged.some(
          (m) => m.name === f.name && m.size === f.size && m.lastModified === f.lastModified,
        );
        if (!exists) merged.push(f);
      }
      return merged;
    });
  }

  function removeSelectedFile(idx: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function envoyer() {
    if (selectedFiles.length === 0 || isUploading) return;
    const snapshot = [...selectedFiles];
    try {
      await onEnvoyer(snapshot);
      setSelectedFiles([]);
      setUploadError(null);
    } catch (e) {
      if (e instanceof Error && e.message === "__abandon_envoi_documents") return;
      console.error(e);
      setUploadError("Erreur lors de l'envoi des documents.");
    }
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          const dropped = Array.from(e.dataTransfer.files ?? []);
          addFiles(dropped);
        }}
        className="cursor-pointer rounded-[12px] border-2 border-dashed border-[#5B50F0]/60 bg-[#F8F9FF] p-4 text-left shadow-sm"
      >
        <p className="text-sm font-semibold text-foreground">Glissez vos documents ici ou cliquez pour parcourir</p>
        <p className="mt-1 text-xs text-muted-foreground">PDF, JPG, PNG, 10 Mo max par fichier</p>
        {uploadError ? <p className="mt-2 text-xs font-medium text-red-600">{uploadError}</p> : null}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            addFiles(files);
            e.currentTarget.value = "";
          }}
        />
      </div>

      {selectedFiles.length > 0 ? (
        <div className="mt-3 rounded-[12px] border border-border bg-white p-3 shadow-sm">
          <ul className="space-y-2">
            {selectedFiles.map((f, idx) => (
              <li key={`${f.name}-${f.size}-${f.lastModified}`} className="flex items-center justify-between">
                <span className="truncate text-sm text-foreground">{f.name}</span>
                <button
                  type="button"
                  onClick={() => removeSelectedFile(idx)}
                  className="ml-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-gray-100 hover:text-foreground"
                  aria-label={`Retirer ${f.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => void envoyer()}
              disabled={isUploading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#5B50F0] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#4B41D5] disabled:opacity-60"
            >
              {isUploading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Envoi en cours...
                </>
              ) : (
                "Envoyer les documents →"
              )}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
