import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessages, type Msg } from "@/components/chat/ChatMessages";
import { ChatSuggestions } from "@/components/chat/ChatSuggestions";
import { ChatUploadZone } from "@/components/chat/ChatUploadZone";
import {
  migrateLegacyQualificationLocalStorage,
  QUALIFICATION_STORAGE_KEYS,
} from "@/lib/qualificationLocalStorage";

type CollectedData = {
  type_sinistre: string;
  assureur: string;
  montant_propose: string;
  date_sinistre: string;
  description: string;
};

const EXTRACTION_PROMPT = `Tu es un assistant spécialisé dans 
l'extraction d'informations depuis des documents d'assurance.

Analyse ce document et extrais TOUTES les informations pertinentes 
dans ce format JSON exact, sans aucun texte avant ou après :
{
  "numero_contrat": "",
  "nom_assure": "",
  "prenom_assure": "",
  "adresse_assure": "",
  "telephone_assure": "",
  "email_assure": "",
  "nom_assureur": "",
  "adresse_assureur": "",
  "telephone_assureur": "",
  "contact_assureur": "",
  "numero_sinistre": "",
  "date_sinistre": "",
  "type_sinistre": "",
  "montant_expertise": "",
  "nom_expert_assurance": "",
  "telephone_expert_assurance": "",
  "email_expert_assurance": "",
  "conclusions_expert": "",
  "reserves_expert": "",
  "autres_informations": []
}

Si une information n'est pas trouvée, laisse le champ vide "".
Pour autres_informations, liste toute info pertinente non couverte 
par les champs ci-dessus.`;

const EMPTY_DATA: CollectedData = {
  type_sinistre: "",
  assureur: "",
  montant_propose: "",
  date_sinistre: "",
  description: "",
};

const WELCOME = "Bonjour 👋 Quel type de sinistre avez-vous subi ?";

const SYSTEM_PROMPT = `Tu es un assistant de qualification pour Vertual, 
plateforme française d'expert d'assuré.

Ton rôle : qualifier le sinistre de l'assuré en 
5-7 questions maximum pour créer son dossier.

Questions à poser dans l'ordre :
1. Type de sinistre
2. Ce que l'assureur a proposé
3. Montant proposé
4. Nom de l'assureur
5. Date du sinistre
6. Documents disponibles

Règles :
- Une question à la fois
- Réponses courtes (max 2 phrases)
- Quand tu as toutes les infos, génère l'évaluation

À la fin génère :
<data>{"type_sinistre":"...","assureur":"...","montant_propose":"...","date_sinistre":"..."}</data>
<evaluation>Score: X/10. [2 phrases max]</evaluation>
<suggest>TYPE</suggest>`;

/** Pills initiales (type de sinistre), même jeu que type_sinistre ; codées en dur, sans balise suggest sur l'accueil. */
const STARTUP_TYPE_SINISTRE_PILLS: { label: string; text: string }[] = [
  { label: "Dégât des eaux", text: "Mon sinistre est de type : Dégât des eaux" },
  { label: "Incendie", text: "Mon sinistre est de type : Incendie" },
  { label: "Tempête", text: "Mon sinistre est de type : Tempête" },
  { label: "Accident auto", text: "Mon sinistre est de type : Accident auto" },
  { label: "Multirisque", text: "Mon sinistre est de type : Multirisque habitation" },
  { label: "Autre", text: "Mon sinistre est de type : Autre" },
];

function uid() {
  return Math.random().toString(36).slice(2);
}

function claudeAsksForDocuments(text: string): boolean {
  const t = text.toLowerCase();
  return (
    t.includes("document") ||
    t.includes("police d'assurance") ||
    t.includes("police d’assurance") ||
    t.includes("rapport") ||
    t.includes("courrier") ||
    t.includes("pièce")
  );
}

function parseClaudeResponse(text: string) {
  const dataMatch = text.match(/<data>([\s\S]*?)<\/data>/i);
  const evalMatch = text.match(/<evaluation>([\s\S]*?)<\/evaluation>/i);
  let parsedData: Partial<CollectedData> | null = null;
  let evaluation: string | null = null;
  if (dataMatch?.[1]) {
    try {
      parsedData = JSON.parse(dataMatch[1]) as Partial<CollectedData>;
    } catch {
      parsedData = null;
    }
  }
  if (evalMatch?.[1]) evaluation = evalMatch[1].trim();
  const cleanText = text
    .replace(/<data>[\s\S]*?<\/data>/gi, "")
    .replace(/<evaluation>[\s\S]*?<\/evaluation>/gi, "")
    .trim();
  return { cleanText, parsedData, evaluation };
}

function suggestionsFromLastClaude(text: string): string[] {
  const suggestMatch = text.match(/<suggest>([\s\S]*?)<\/suggest>/i);
  const suggestType = suggestMatch ? suggestMatch[1].trim().toLowerCase() : "none";

  const suggestionSets: Record<string, string[]> = {
    type_sinistre: [
      "Dégât des eaux",
      "Incendie",
      "Tempête",
      "Accident auto",
      "Multirisque",
      "Autre",
    ],
    reponse_assureur: [
      "Refus total",
      "Offre trop basse",
      "Pas encore de réponse",
      "Offre partielle",
      "Sinistre ignoré",
    ],
    montant: [
      "Moins de 1 000€",
      "1 000€ à 5 000€",
      "5 000€ à 20 000€",
      "20 000€ à 50 000€",
      "Plus de 50 000€",
    ],
    assureur: ["AXA", "MAAF", "Allianz", "MMA", "Groupama", "Macif", "MAIF", "Autre assureur"],
    anciennete: ["Moins d'1 mois", "1 à 3 mois", "3 à 6 mois", "Plus de 6 mois"],
    oui_non: ["Oui", "Non"],
    none: [],
  };

  return suggestionSets[suggestType] ?? [];
}

function cleanMessageText(text: string): string {
  return text
    .replace(/<suggest>[\s\S]*?<\/suggest>/gi, "")
    .replace(/<data>[\s\S]*?<\/data>/gi, "")
    .replace(/<evaluation>[\s\S]*?<\/evaluation>/gi, "")
    .trim();
}

export function QualificationChatbot() {
  const [messages, setMessages] = useState<Msg[]>(() => [
    { id: uid(), role: "claude", text: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [collectedData, setCollectedData] = useState<CollectedData>(EMPTY_DATA);
  const [evaluationPreview, setEvaluationPreview] = useState<string | null>(null);
  const [dismissedUploadForClaudeMsgId, setDismissedUploadForClaudeMsgId] = useState<string | null>(
    null,
  );
  const [sendingDocs, setSendingDocs] = useState(false);
  const [extractedData, setExtractedData] = useState<Record<string, any>>({});

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    migrateLegacyQualificationLocalStorage();
  }, []);

  useEffect(() => {
    const lastClaude = messages.filter((m) => m.role === "claude").slice(-1)[0];
    const onlyWelcome =
      messages.length === 1 && lastClaude?.role === "claude" && lastClaude.text === WELCOME;
    if (onlyWelcome) {
      setSuggestions([]);
      return;
    }
    setSuggestions(suggestionsFromLastClaude(lastClaude?.text ?? ""));
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  function mergeData(incoming: Partial<CollectedData> | null) {
    if (!incoming) return;
    setCollectedData((prev) => ({
      type_sinistre: incoming.type_sinistre?.trim() || prev.type_sinistre,
      assureur: incoming.assureur?.trim() || prev.assureur,
      montant_propose: incoming.montant_propose?.trim() || prev.montant_propose,
      date_sinistre: incoming.date_sinistre?.trim() || prev.date_sinistre,
      description: incoming.description?.trim() || prev.description,
    }));
  }

  async function askClaude(next: Msg[]) {
    const anthropicMessages = next.map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("assistant" as const),
      content: m.role === "user" ? m.text : cleanMessageText(m.text),
    }));

    const res = await fetch("/.netlify/functions/anthropic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: anthropicMessages.slice(-8),
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || `Erreur Anthropic (${res.status})`);
    }

    const data = (await res.json()) as { content?: Array<{ type?: string; text?: string }> };
    const text = data.content?.find((c) => c.type === "text")?.text?.trim() ?? "";
    if (!text) throw new Error("Réponse Claude vide.");
    return text;
  }

  async function callAnthropicExtraction(payload: any) {
    const res = await fetch("/.netlify/functions/anthropic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || `Erreur Anthropic (${res.status})`);
    }

    const data = (await res.json()) as { content?: Array<{ type?: string; text?: string }> };
    const text = data.content?.find((c) => c.type === "text")?.text?.trim() ?? "";
    if (!text) throw new Error("Réponse extraction vide.");
    return text;
  }

  function sanitizeJsonText(text: string) {
    const t = text.trim();
    const match = t.match(/\{[\s\S]*\}/);
    return (match?.[0] ?? t).trim();
  }

  function nonEmptyExtracted(obj: Record<string, any>) {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v == null) continue;
      if (Array.isArray(v) && v.length === 0) continue;
      if (typeof v === "string" && !v.trim()) continue;
      out[k] = v;
    }
    return out;
  }

  async function blobToBase64(blob: Blob): Promise<string> {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Lecture du fichier impossible."));
      reader.onload = () => {
        const s = String(reader.result ?? "");
        const idx = s.indexOf("base64,");
        resolve(idx >= 0 ? s.slice(idx + "base64,".length) : s);
      };
      reader.readAsDataURL(blob);
    });
  }

  async function extractFromUploaded(path: string, originalFile: File) {
    try {
      const { data: urlData, error: urlErr } = await supabase.storage
        .from("documents")
        .createSignedUrl(path, 3600);
      if (urlErr || !urlData?.signedUrl) throw urlErr ?? new Error("Signed URL indisponible");

      const lower = originalFile.name.toLowerCase();
      const isPdf = lower.endsWith(".pdf");
      const isImage = /\.(png|jpg|jpeg)$/i.test(lower) || originalFile.type.startsWith("image/");

      let userContent: any;
      if (isImage) {
        const b = await fetch(urlData.signedUrl).then((r) => r.blob());
        const base64 = await blobToBase64(b);
        const mediaType =
          originalFile.type && originalFile.type.startsWith("image/")
            ? originalFile.type
            : lower.endsWith(".png")
              ? "image/png"
              : "image/jpeg";

        userContent = [
          {
            type: "text",
            text: "Analyse cette image (document d'assurance) et extrais les informations demandées.",
          },
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
        ];
      } else if (isPdf) {
        userContent = `Ce document est un PDF : ${originalFile.name}. Extrais les informations disponibles depuis le nom et contexte.`;
      } else {
        userContent = `Document : ${originalFile.name}. Extrais les informations disponibles depuis le nom et contexte.`;
      }

      const payload = {
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: EXTRACTION_PROMPT,
        messages: [{ role: "user", content: userContent }],
      };

      const txt = await callAnthropicExtraction(payload);
      const parsed = JSON.parse(sanitizeJsonText(txt)) as Record<string, any>;
      setExtractedData((prev) => ({ ...prev, ...parsed }));
      return parsed;
    } catch (e) {
      console.error("Extraction failed:", e);
      return null;
    }
  }

  function getDossierIdFromLocalStorage(): string | null {
    if (typeof window === "undefined") return null;
    const candidates = ["dossierId", "vertual_dossier_id", "vertual_dossierId", "currentDossierId"];
    for (const k of candidates) {
      const v = window.localStorage.getItem(k);
      if (v && v.trim()) return v.trim();
    }
    return null;
  }

  function profileFieldFilled(v: unknown): boolean {
    return v != null && String(v).trim() !== "";
  }

  async function enrichProfileFromExtraction(data: Record<string, any>) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: row, error: selErr } = await supabase
        .from("profiles")
        .select(
          "nom, prenom, adresse, telephone, email, numero_contrat, assureur_principal",
        )
        .eq("id", user.id)
        .maybeSingle();
      if (selErr) {
        console.error("Profile fetch for enrichment:", selErr);
        return;
      }

      const cur = (row ?? {}) as Record<string, unknown>;
      const profileUpdate: Record<string, string> = {};

      const maybeSet = (profileKey: string, extractedVal: unknown) => {
        const t =
          typeof extractedVal === "string"
            ? extractedVal.trim()
            : extractedVal != null
              ? String(extractedVal).trim()
              : "";
        if (!t) return;
        if (profileFieldFilled(cur[profileKey])) return;
        profileUpdate[profileKey] = t;
      };

      maybeSet("nom", data.nom_assure);
      maybeSet("prenom", data.prenom_assure);
      maybeSet("adresse", data.adresse_assure);
      maybeSet("telephone", data.telephone_assure);
      maybeSet("email", data.email_assure);
      maybeSet("numero_contrat", data.numero_contrat);
      maybeSet("assureur_principal", data.nom_assureur);

      if (Object.keys(profileUpdate).length === 0) return;

      const { error: upProfErr } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", user.id);
      if (upProfErr) console.error("Profile enrichment update:", upProfErr);
    } catch (e) {
      console.error("enrichProfileFromExtraction:", e);
    }
  }

  async function saveExtractionToDossier(dossierId: string, data: Record<string, any>) {
    const update: Record<string, any> = {
      nom_assure: data.nom_assure || undefined,
      prenom_assure: data.prenom_assure || undefined,
      assureur: data.nom_assureur || undefined,
      nom_expert: data.nom_expert_assurance || undefined,
      montant_estime: data.montant_expertise
        ? parseFloat(String(data.montant_expertise).replace(/[^0-9.]/g, ""))
        : undefined,
    };
    const cleaned: Record<string, any> = {};
    for (const [k, v] of Object.entries(update)) {
      if (v !== undefined && v !== null && !(typeof v === "number" && Number.isNaN(v)))
        cleaned[k] = v;
    }
    try {
      if (Object.keys(cleaned).length > 0) {
        const { error: upErr } = await supabase
          .from("dossiers")
          .update(cleaned)
          .eq("id", dossierId);
        if (upErr) throw upErr;
      }
    } catch (e) {
      console.error("Save extraction to dossier failed:", e);
    }

    try {
      await enrichProfileFromExtraction(data);
    } catch (e) {
      console.error("enrichProfileFromExtraction:", e);
    }
  }

  async function sendUserText(text: string) {
    const t = text.trim();
    if (!t || isLoading || messages.length > 20) return;

    const userMsg: Msg = { id: uid(), role: "user", text: t };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await askClaude(next);
      const { cleanText, parsedData, evaluation } = parseClaudeResponse(reply);
      mergeData(parsedData);
      if (evaluation) setEvaluationPreview(evaluation);
      setMessages((prev) => [...prev, { id: uid(), role: "claude", text: cleanText }]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "claude",
          text: "Je rencontre un problème temporaire. Réessayez dans quelques secondes.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function goToSignup() {
    if (typeof window === "undefined") return;
    migrateLegacyQualificationLocalStorage();
    window.localStorage.setItem(
      QUALIFICATION_STORAGE_KEYS.collectedData,
      JSON.stringify(collectedData),
    );
    if (evaluationPreview) {
      window.localStorage.setItem(QUALIFICATION_STORAGE_KEYS.evaluation, evaluationPreview);
    }
  }

  const onlyWelcome =
    messages.length === 1 && messages[0]?.role === "claude" && messages[0]?.text === WELCOME;

  const conversationEnded = messages.length > 20;

  const lastClaude = messages.filter((m) => m.role === "claude").slice(-1)[0];
  const lastClaudeVisibleText = cleanMessageText(lastClaude?.text ?? "");
  const wantsDocumentsUpload =
    !onlyWelcome &&
    !!lastClaude &&
    claudeAsksForDocuments(lastClaudeVisibleText) &&
    dismissedUploadForClaudeMsgId !== lastClaude.id;

  async function sendDocumentsFromFiles(filesSnapshot: File[]) {
    if (!lastClaude || filesSnapshot.length === 0 || sendingDocs || isLoading) {
      throw new Error("__abandon_envoi_documents");
    }

    const names = filesSnapshot.map((f) => f.name).join(", ");
    const msg = `📎 ${filesSnapshot.length} document(s) envoyé(s) : ${names}`;

    const userMsg: Msg = { id: uid(), role: "user", text: msg };
    const next = [...messages, userMsg];
    setMessages(next);
    setDismissedUploadForClaudeMsgId(lastClaude.id);

    setSendingDocs(true);
    setIsLoading(true);

    const uploadedItems: Array<{ path: string; file: File }> = [];
    for (const file of filesSnapshot) {
      const fileName = `chatbot/${Date.now()}_${file.name}`;
      try {
        const { error } = await supabase.storage
          .from("documents")
          .upload(fileName, file, { upsert: true });
        if (error) throw error;
        uploadedItems.push({ path: fileName, file });

        try {
          const existingFiles = JSON.parse(
            window.localStorage.getItem("vertual_uploaded_files") ?? "[]",
          );
          const list = Array.isArray(existingFiles) ? existingFiles : [];
          list.push(fileName);
          window.localStorage.setItem("vertual_uploaded_files", JSON.stringify(list));
        } catch {
          // best-effort localStorage, do not block upload
        }
      } catch (e) {
        console.error("Upload failed:", e);
      }
    }

    let merged: Record<string, any> = {};
    for (const item of uploadedItems) {
      const parsed = await extractFromUploaded(item.path, item.file);
      if (parsed) merged = { ...merged, ...parsed };
    }

    const cleanedForChat = nonEmptyExtracted(merged);
    const dossierId = getDossierIdFromLocalStorage();
    if (dossierId) {
      await saveExtractionToDossier(dossierId, merged);
    }

    try {
      const hidden = `L'utilisateur a envoyé ces documents : ${names}. \nInformations extraites : ${JSON.stringify(
        cleanedForChat,
      )}. \nContinue la conversation en confirmant la réception et en mentionnant les informations clés que tu as pu identifier.`;
      const reply = await askClaude([...next, { id: uid(), role: "user", text: hidden }]);
      const { cleanText, parsedData, evaluation } = parseClaudeResponse(reply);
      mergeData(parsedData);
      if (evaluation) setEvaluationPreview(evaluation);
      setMessages((prev) => [...prev, { id: uid(), role: "claude", text: cleanText }]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "claude",
          text: "Je rencontre un problème temporaire. Réessayez dans quelques secondes.",
        },
      ]);
    } finally {
      setSendingDocs(false);
      setIsLoading(false);
    }
  }

  return (
    <div
      id="chatbot"
      className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 font-['Inter'] shadow-md"
    >
      <div className="min-h-[120px] max-h-[320px] space-y-3 overflow-y-auto bg-transparent">
        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          evaluationPreview={evaluationPreview}
          onRevelerEvaluation={goToSignup}
          bottomRef={bottomRef}
          showDocumentsUpload={wantsDocumentsUpload}
          documentsUpload={
            <ChatUploadZone
              onEnvoyer={(files) => sendDocumentsFromFiles(files)}
              isUploading={sendingDocs || isLoading}
            />
          }
        />

        {Object.keys(nonEmptyExtracted(extractedData)).length > 0 && (
          <div
            style={{
              background: "linear-gradient(135deg, #F0EFFE, #E8F5E9)",
              border: "1px solid #5B50F0",
              borderRadius: "12px",
              padding: "16px",
              marginTop: "8px",
            }}
          >
            <p style={{ fontWeight: 600, color: "#5B50F0", marginBottom: "8px" }}>
              ✨ Informations extraites automatiquement
            </p>
            {(() => {
              const data = nonEmptyExtracted(extractedData);
              const lines: string[] = [];
              const add = (label: string, value: any) => {
                if (value == null) return;
                if (Array.isArray(value)) {
                  if (value.length === 0) return;
                  lines.push(`${label} : ${value.join(", ")}`);
                  return;
                }
                const s = String(value).trim();
                if (!s) return;
                lines.push(`${label} : ${s}`);
              };

              add("Numéro de contrat", data.numero_contrat);
              const assure =
                `${String(data.prenom_assure ?? "").trim()} ${String(data.nom_assure ?? "").trim()}`.trim();
              if (assure) lines.push(`Assuré : ${assure}`);
              add("Adresse assuré", data.adresse_assure);
              add("Téléphone assuré", data.telephone_assure);
              add("Email assuré", data.email_assure);
              add("Assureur", data.nom_assureur);
              add("Contact assureur", data.contact_assureur);
              add("Numéro de sinistre", data.numero_sinistre);
              add("Date du sinistre", data.date_sinistre);
              add("Type de sinistre", data.type_sinistre);
              add("Montant expertise", data.montant_expertise);
              add("Expert assurance", data.nom_expert_assurance);
              add("Téléphone expert", data.telephone_expert_assurance);
              add("Email expert", data.email_expert_assurance);
              add("Conclusions expert", data.conclusions_expert);
              add("Réserves expert", data.reserves_expert);
              add("Autres informations", data.autres_informations);

              if (lines.length === 0) {
                return <p className="text-sm text-foreground">Non renseigné</p>;
              }

              return (
                <ul className="space-y-1">
                  {lines.map((line) => (
                    <li key={line} className="text-sm text-foreground">
                      {line}
                    </li>
                  ))}
                </ul>
              );
            })()}
            <p style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "8px" }}>
              Ces informations enrichiront votre dossier automatiquement.
            </p>
          </div>
        )}
      </div>

      {!isLoading && !conversationEnded && onlyWelcome ? (
        <ChatSuggestions
          suggestions={STARTUP_TYPE_SINISTRE_PILLS.map((p) => p.text)}
          getDisplayText={(s) => STARTUP_TYPE_SINISTRE_PILLS.find((p) => p.text === s)?.label ?? s}
          onSelect={(s) => void sendUserText(s)}
        />
      ) : null}

      {!isLoading && !conversationEnded && !onlyWelcome && suggestions.length > 0 ? (
        <ChatSuggestions suggestions={suggestions} onSelect={(s) => void sendUserText(s)} />
      ) : null}

      {conversationEnded ? (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-[12px] bg-white px-4 py-2.5 text-sm leading-relaxed text-foreground shadow-sm">
              <p>Votre dossier est qualifié. Créez votre compte pour continuer avec un expert.</p>
            </div>
          </div>
          <div className="mt-3 flex justify-center">
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              onClick={goToSignup}
              className="inline-flex items-center justify-center rounded-lg bg-[#5B50F0] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4B41D5]"
            >
              Créer mon compte →
            </Link>
          </div>
        </div>
      ) : (
        <ChatInput
          value={input}
          onChange={setInput}
          onEnvoyer={() => void sendUserText(input)}
          isLoading={isLoading}
        />
      )}
      <p className="mt-2 text-right text-[10px] text-muted-foreground">
        Vertual n'est pas un cabinet juridique.
      </p>
    </div>
  );
}
