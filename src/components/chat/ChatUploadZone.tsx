import { useRef, useState, type ChangeEvent } from "react";
import { X } from "lucide-react";

export type ChatUploadZoneProps = {
  onEnvoyer: (files: File[]) => Promise<void>;
  isUploading: boolean;
};

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];

const maxBytes = 10 * 1024 * 1024;

function isFileAccepted(f: File): boolean {
  if (f.size > maxBytes) return false;
  const nameLower = f.name.toLowerCase();
  const extOk = allowedExtensions.some((ext) => nameLower.endsWith(ext));
  const mime = (f.type || "").toLowerCase();
  const mimeOk = allowedMimeTypes.has(mime);
  return extOk || mimeOk;
}

export function ChatUploadZone({ onEnvoyer, isUploading }: ChatUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function addFiles(incoming: File[]) {
    const next: File[] = [];
    for (const f of incoming) {
      if (!isFileAccepted(f)) continue;
      next.push(f);
    }

    const rejectedCount = incoming.length - next.length;
    if (rejectedCount > 0) {
      setUploadError("Certains fichiers ont été ignorés (formats: PDF, JPG, PNG, HEIC · 10 Mo max).");
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

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    addFiles(files);
    e.currentTarget.value = "";
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
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.heif"
        multiple
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      <div
        role="region"
        aria-label="Zone de dépôt des documents"
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          const dropped = Array.from(e.dataTransfer.files ?? []);
          addFiles(dropped);
        }}
        className="rounded-[12px] border-2 border-dashed border-[#5B50F0]/60 bg-[#F8F9FF] p-4 text-left shadow-sm"
      >
        <p className="text-sm font-semibold text-foreground">Glissez vos documents ici</p>
        <p className="mt-1 text-xs text-muted-foreground">PDF, JPG, PNG, HEIC · 10 Mo max</p>
        {uploadError ? <p className="mt-2 text-xs font-medium text-red-600">{uploadError}</p> : null}
      </div>

      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          justifyContent: "center",
          marginTop: "12px",
        }}
      >
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "10px 16px",
            background: "white",
            border: "1px solid #5B50F0",
            borderRadius: "8px",
            color: "#5B50F0",
            fontWeight: 500,
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
        >
          📄 Parcourir mes fichiers
        </button>

        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "10px 16px",
            background: "white",
            border: "1px solid #5B50F0",
            borderRadius: "8px",
            color: "#5B50F0",
            fontWeight: 500,
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
        >
          🖼️ Ma galerie
        </button>

        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "10px 16px",
            background: "white",
            border: "1px solid #5B50F0",
            borderRadius: "8px",
            color: "#5B50F0",
            fontWeight: 500,
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
        >
          📷 Prendre une photo
        </button>
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
