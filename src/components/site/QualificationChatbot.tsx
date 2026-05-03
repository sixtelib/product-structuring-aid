import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
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
  raison_contestation: string;
};

const EXTRACTION_PROMPT = `Tu es un assistant spécialisé dans l'extraction d'informations depuis des documents d'assurance.
Analyse ce document et extrais TOUTES les informations pertinentes dans ce format JSON exact, sans aucun texte avant ou après :
{
  "assuré": {
    "nom": "",
    "prenom": "",
    "email": "",
    "telephone": "",
    "adresse": "",
    "code_postal": "",
    "ville": ""
  },
  "assureur": {
    "compagnie_nom": "",
    "contact_nom": "",
    "contact_prenom": "",
    "contact_email": "",
    "contact_telephone": "",
    "adresse": "",
    "code_postal": "",
    "ville": ""
  },
  "expert_assurance": {
    "nom": "",
    "prenom": "",
    "email": "",
    "telephone": "",
    "adresse": "",
    "code_postal": "",
    "ville": ""
  },
  "sinistre": {
    "numero_dossier": "",
    "date": "",
    "adresse": "",
    "code_postal": "",
    "ville": "",
    "type": ""
  },
  "expertise": {
    "date_edition": "",
    "montant_propose": "",
    "numero_contrat": ""
  },
  "autres_informations": []
}
Si une information n'est pas trouvée, laisse le champ vide "".
Pour date_sinistre et date_edition, utilise le format YYYY-MM-DD.
Pour montant_propose, retourne uniquement le nombre sans symbole ni espace (ex: 15000.00).`;

const EMPTY_DATA: CollectedData = {
  type_sinistre: "",
  assureur: "",
  montant_propose: "",
  date_sinistre: "",
  description: "",
  raison_contestation: "",
};

const WELCOME =
  "Bonjour 👋 Qu'est-ce qui vous semble injuste dans la réponse de votre assureur ?";

const SYSTEM_PROMPT = `Tu es un assistant de qualification pour Vertual,
plateforme française d'expert d'assuré.

Ton objectif : comprendre pourquoi l'assuré conteste
et l'encourager à uploader ses documents.

Flow en 3 étapes maximum :

ÉTAPE 1 — Première question uniquement :
"Bonjour 👋 Qu'est-ce qui vous semble injuste
dans la réponse de votre assureur ?"

ÉTAPE 2 — Après leur réponse :
Reformule en 1 phrase ce que tu as compris,
puis envoie ce message exact pour demander les documents (sans le modifier) :

"Pour analyser votre dossier, nous avons besoin
de ces documents :

📄 **Essentiels :**
- Votre contrat d'assurance (la police concernée)
- Le rapport d'expertise de votre assureur

📎 **Utiles si vous les avez :**
- Photos des dommages
- Courriers échangés avec votre assureur
- Devis de réparation

Vous pouvez commencer avec juste les 2 essentiels.
Les autres peuvent être ajoutés plus tard
depuis votre espace personnel."

Termine ce tour avec <suggest>upload</suggest> (la zone d'upload s'affiche côté interface — pas de pills).

ÉTAPE 3 — Si documents uploadés :
L'IA a extrait les informations automatiquement.
Génère immédiatement l'évaluation.

ÉTAPE 3 bis — Si pas de documents :
Pose ces questions une par une :
- Type de sinistre (<suggest>type_sinistre</suggest>)
- Nom de l'assureur (<suggest>assureur</suggest>)
- Montant proposé par l'assureur (<suggest>montant</suggest>)
Puis génère l'évaluation.

RÈGLES :
- Maximum 4 échanges avant l'évaluation
- Ne jamais demander le montant souhaité par l'assuré
- Ne jamais promettre un montant de récupération
- L'évaluation donne uniquement :
  un score de contestabilité (Faible/Modéré/Élevé)
  et les points identifiés pour contester
- Si l'assuré dit ne pas avoir les documents :
  répondre exactement "Pas de problème, vous pourrez les ajouter depuis votre espace personnel après la création de votre compte. Continuons l'évaluation."
  puis poursuivre le flow (questions ÉTAPE 3 bis ou évaluation) sans insister pour les documents.
- Ne jamais bloquer la conversation faute de documents.

FORMAT évaluation finale :
<data>{"type_sinistre":"...","assureur":"...","montant_propose":"...","raison_contestation":"..."}</data>
<evaluation>
Score : [Faible|Modéré|Élevé]
[2 phrases max sur les points identifiés pour contester]
</evaluation>
<suggest>none</suggest>`;

/** Pills initiales (première question — réponse assureur). */
const STARTUP_INITIAL_PILLS: { label: string; text: string }[] = [
  { label: "Refus total", text: "Refus total" },
  { label: "Offre trop basse", text: "Offre trop basse" },
  { label: "Pas encore de réponse", text: "Pas encore de réponse" },
  { label: "Sinistre ignoré", text: "Sinistre ignoré" },
  { label: "Offre partielle", text: "Offre partielle" },
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

function getSuggestTypeFromText(text: string): string {
  const suggestMatch = text.match(/<suggest>([\s\S]*?)<\/suggest>/i);
  return suggestMatch ? suggestMatch[1].trim().toLowerCase() : "none";
}

function suggestionsFromLastClaude(text: string): string[] {
  const suggestType = getSuggestTypeFromText(text);

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
    upload: [],
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
  const [cguAccepted, setCguAccepted] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const noUserMessageYet = !messages.some((m) => m.role === "user");

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
    const raw = lastClaude?.text ?? "";
    const suggestType = getSuggestTypeFromText(raw);
    if (suggestType === "upload") {
      setSuggestions([]);
      return;
    }
    setSuggestions(suggestionsFromLastClaude(raw));
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
      raison_contestation: incoming.raison_contestation?.trim() || prev.raison_contestation,
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
    const a = data.assuré || {};
    const assureur = data.assureur || {};
    const expert = data.expert_assurance || {};
    const sinistre = data.sinistre || {};
    const expertise = data.expertise || {};

    const update: Record<string, any> = {
      // Assuré
      nom_assure: a.nom || undefined,
      prenom_assure: a.prenom || undefined,
      email_assure: a.email || undefined,
      telephone_assure: a.telephone || undefined,
      adresse_assure: a.adresse || undefined,
      code_postal_assure: a.code_postal || undefined,
      ville_assure: a.ville || undefined,
      // Assureur
      assureur_compagnie_nom: assureur.compagnie_nom || undefined,
      assureur_contact_nom: assureur.contact_nom || undefined,
      assureur_contact_prenom: assureur.contact_prenom || undefined,
      assureur_contact_email: assureur.contact_email || undefined,
      assureur_contact_telephone: assureur.contact_telephone || undefined,
      assureur_adresse: assureur.adresse || undefined,
      assureur_code_postal: assureur.code_postal || undefined,
      assureur_ville: assureur.ville || undefined,
      // Expert assurance
      nom_expert: expert.nom || undefined,
      prenom_expert: expert.prenom || undefined,
      expert_email: expert.email || undefined,
      expert_telephone: expert.telephone || undefined,
      expert_adresse: expert.adresse || undefined,
      expert_code_postal: expert.code_postal || undefined,
      expert_ville: expert.ville || undefined,
      // Sinistre
      sinistre_numero_dossier: sinistre.numero_dossier || undefined,
      date_sinistre: sinistre.date || undefined,
      sinistre_adresse: sinistre.adresse || undefined,
      sinistre_code_postal: sinistre.code_postal || undefined,
      sinistre_ville: sinistre.ville || undefined,
      type_sinistre: sinistre.type || undefined,
      // Expertise
      expertise_date_edition: expertise.date_edition || undefined,
      expertise_montant_propose: expertise.montant_propose
        ? parseFloat(String(expertise.montant_propose).replace(/[^0-9.]/g, ""))
        : undefined,
      numero_contrat: expertise.numero_contrat || undefined,
    };

    const cleaned: Record<string, any> = {};
    for (const [k, v] of Object.entries(update)) {
      if (v !== undefined && v !== null && v !== "" && !(typeof v === "number" && Number.isNaN(v)))
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

    if (noUserMessageYet && !cguAccepted) {
      toast.error("Veuillez accepter les CGU avant de continuer.");
      return;
    }

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
  const lastSuggestType = lastClaude ? getSuggestTypeFromText(lastClaude.text) : "none";
  const wantsDocumentsUpload =
    !onlyWelcome &&
    !!lastClaude &&
    dismissedUploadForClaudeMsgId !== lastClaude.id &&
    (lastSuggestType === "upload" || claudeAsksForDocuments(lastClaudeVisibleText));

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

  const showStartupPills = !isLoading && !conversationEnded && onlyWelcome;
  const showDynamicPills = !isLoading && !conversationEnded && !onlyWelcome && suggestions.length > 0;
  const showPills = showStartupPills || showDynamicPills;

  return (
    <div
      id="chatbot"
      className="flex flex-col rounded-[16px] border border-solid border-[#E5E7EB] bg-white p-[20px] font-['Inter']"
    >
      <p className="mb-3 font-medium text-[#7F77DD]" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
        ÉVALUEZ VOTRE DOSSIER
      </p>
      <div className="min-h-[120px] max-h-[320px] space-y-3 overflow-y-auto">
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
            className="mt-2 rounded-[12px] border border-solid border-[#E5E7EB] bg-white p-4"
          >
            <p className="mb-2 text-sm font-semibold text-[#111827]">Informations extraites automatiquement</p>
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
            <p className="mt-2 text-xs text-[#6B7280]">Ces informations enrichiront votre dossier automatiquement.</p>
          </div>
        )}
      </div>

      {showStartupPills ? (
        <ChatSuggestions
          variant="primary"
          suggestions={STARTUP_INITIAL_PILLS.map((p) => p.text)}
          getDisplayText={(s) => STARTUP_INITIAL_PILLS.find((p) => p.text === s)?.label ?? s}
          onSelect={(s) => void sendUserText(s)}
        />
      ) : null}

      {showDynamicPills ? (
        <ChatSuggestions variant="secondary" suggestions={suggestions} onSelect={(s) => void sendUserText(s)} />
      ) : null}

      {showPills && !conversationEnded ? <div className="mt-3 border-t border-solid border-[#E5E7EB]" aria-hidden /> : null}

      {conversationEnded ? (
        <div className="mt-3 border-t border-solid border-[#E5E7EB] pt-3">
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-tl-none rounded-tr-[14px] rounded-br-[14px] rounded-bl-[14px] border border-solid border-[#E5E7EB] bg-[#F8F9FF] px-4 py-3 text-[14px] leading-relaxed text-foreground">
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
        <>
          {noUserMessageYet && (
            <label className="mt-3 flex items-start gap-2 px-1 text-xs text-gray-500">
              <input
                type="checkbox"
                checked={cguAccepted}
                onChange={(e) => setCguAccepted(e.target.checked)}
                className="mt-0.5 accent-[#5B50F0]"
              />
              <span>
                J'accepte les{" "}
                <a href="/cgu" target="_blank" rel="noreferrer" className="text-[#5B50F0] underline">
                  Conditions Générales d'Utilisation
                </a>{" "}
                et la collecte de mes données pour le traitement de mon dossier.
              </span>
            </label>
          )}
          <ChatInput
            value={input}
            onChange={setInput}
            onEnvoyer={() => void sendUserText(input)}
            isLoading={isLoading}
          />
        </>
      )}
      <p className="mt-2 text-right text-[10px] text-[#9CA3AF]">Vertual n&apos;est pas un cabinet juridique.</p>
    </div>
  );
}
