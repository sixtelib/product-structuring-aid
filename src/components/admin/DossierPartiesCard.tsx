import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Users } from "lucide-react";
import type { Dossier, Expert, ProfileShort } from "@/types";
import {
  dossierAdresseUneLigne,
  dossierContactNomPrenom,
  dossierTexteOuDash,
} from "@/utils/calculs";

function cardClass() {
  return "rounded-[12px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_8px_rgba(0,0,0,0.06)]";
}

function expertRowLabel(e: {
  full_name?: string | null;
  prenom_expert?: string | null;
  nom_expert?: string | null;
}) {
  const fn = (e.full_name ?? "").trim();
  if (fn) return fn;
  return `${String(e.nom_expert ?? "").trim()} ${String(e.prenom_expert ?? "").trim()}`.trim();
}

export type DossierPartiesCardProps = {
  dossier: Dossier;
  experts: Expert[];
  assureProfile: ProfileShort | null;
  expertProfile: ProfileShort | null;
  onAssignerExpert: (expertId: string) => Promise<void>;
};

export function DossierPartiesCard({
  dossier,
  experts,
  assureProfile,
  expertProfile,
  onAssignerExpert,
}: DossierPartiesCardProps) {
  const [expertSearch, setExpertSearch] = useState("");
  const [showExpertDropdown, setShowExpertDropdown] = useState(false);
  const [selectedExpertId, setSelectedExpertId] = useState("");
  const [assigningExpert, setAssigningExpert] = useState(false);
  const expertPickerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const el = expertPickerRef.current;
      if (el && e.target instanceof Node && el.contains(e.target)) return;
      setShowExpertDropdown(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const assureNom = useMemo(() => {
    const fromDossier =
      dossier.nom_assure || dossier.prenom_assure
        ? `${dossier.prenom_assure ?? ""} ${dossier.nom_assure ?? ""}`.trim()
        : "";
    if (fromDossier) return fromDossier;
    if (assureProfile?.full_name?.trim()) return assureProfile.full_name.trim();
    return "Inconnu";
  }, [dossier.nom_assure, dossier.prenom_assure, assureProfile?.full_name]);

  const expertNom = useMemo(() => {
    const fromDossier =
      dossier.nom_expert || dossier.prenom_expert
        ? `${dossier.nom_expert ?? ""} ${dossier.prenom_expert ?? ""}`.trim()
        : "";
    if (fromDossier) return fromDossier;
    if (expertProfile?.full_name?.trim()) return expertProfile.full_name.trim();
    return "";
  }, [dossier.nom_expert, dossier.prenom_expert, expertProfile?.full_name]);

  async function confirmAssignExpert() {
    const id = selectedExpertId.trim();
    if (!id) return;
    setAssigningExpert(true);
    try {
      await onAssignerExpert(id);
      setSelectedExpertId("");
      setExpertSearch("");
      setShowExpertDropdown(false);
    } catch {
      /* erreur déjà affichée par le parent */
    } finally {
      setAssigningExpert(false);
    }
  }

  return (
    <section className={cardClass()}>
      <div className="mb-6 flex items-center gap-2 border-b border-[#F3F4F6] pb-4">
        <Users className="h-5 w-5 text-[#5B50F0]" aria-hidden />
        <h2 className="text-lg font-semibold text-[#111827]">Parties prenantes</h2>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-[#111827]">Assuré</h3>
          <p className="mt-2 text-sm text-[#374151]">{assureNom}</p>
          <dl className="mt-4 grid grid-cols-1 gap-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                Email
              </dt>
              <dd className="mt-1 text-sm font-medium text-[#111827]">
                {dossierTexteOuDash(dossier.email_assure)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                Téléphone
              </dt>
              <dd className="mt-1 text-sm font-medium text-[#111827]">
                {dossierTexteOuDash(dossier.telephone_assure)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                Adresse
              </dt>
              <dd className="mt-1 text-sm font-medium text-[#111827]">
                {dossierAdresseUneLigne(
                  dossier.adresse_assure,
                  dossier.code_postal_assure,
                  dossier.ville_assure,
                )}
              </dd>
            </div>
          </dl>
          <Link
            to="/admin/utilisateurs/$userId"
            params={{ userId: dossier.user_id }}
            className="mt-3 inline-flex text-sm font-semibold text-[#5B50F0] hover:underline"
          >
            Voir profil →
          </Link>
        </div>

        <div className="border-t border-[#F3F4F6] pt-6">
          <h3 className="text-sm font-semibold text-[#111827]">Assureur</h3>
          <dl className="mt-4 grid grid-cols-1 gap-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                Compagnie
              </dt>
              <dd className="mt-1 text-sm font-medium text-[#111827]">
                {dossierTexteOuDash(dossier.assureur_compagnie_nom)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                Contact
              </dt>
              <dd className="mt-1 text-sm font-medium text-[#111827]">
                {dossierContactNomPrenom(
                  dossier.assureur_contact_nom,
                  dossier.assureur_contact_prenom,
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                Email contact
              </dt>
              <dd className="mt-1 text-sm font-medium text-[#111827]">
                {dossierTexteOuDash(dossier.assureur_contact_email)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                Téléphone contact
              </dt>
              <dd className="mt-1 text-sm font-medium text-[#111827]">
                {dossierTexteOuDash(dossier.assureur_contact_telephone)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                Adresse agence
              </dt>
              <dd className="mt-1 text-sm font-medium text-[#111827]">
                {dossierAdresseUneLigne(
                  dossier.assureur_adresse,
                  dossier.assureur_code_postal,
                  dossier.assureur_ville,
                )}
              </dd>
            </div>
          </dl>
        </div>

        <div className="border-t border-[#F3F4F6] pt-6">
          <h3 className="text-sm font-semibold text-[#111827]">Expert assurance</h3>
          <dl className="mt-4 grid grid-cols-1 gap-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Nom</dt>
              <dd className="mt-1 text-sm font-medium text-[#111827]">
                {dossier.nom_expert || dossier.prenom_expert
                  ? `${String(dossier.nom_expert ?? "").trim()} ${String(dossier.prenom_expert ?? "").trim()}`.trim()
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                Email
              </dt>
              <dd className="mt-1 text-sm font-medium text-[#111827]">
                {dossierTexteOuDash(dossier.expert_email)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                Téléphone
              </dt>
              <dd className="mt-1 text-sm font-medium text-[#111827]">
                {dossierTexteOuDash(dossier.expert_telephone)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                Adresse
              </dt>
              <dd className="mt-1 text-sm font-medium text-[#111827]">
                {dossierAdresseUneLigne(
                  dossier.expert_adresse,
                  dossier.expert_code_postal,
                  dossier.expert_ville,
                )}
              </dd>
            </div>
          </dl>
        </div>

        <div className="border-t border-[#F3F4F6] pt-6">
          <h3 className="text-sm font-semibold text-[#111827]">Expert</h3>
          {dossier.expert_id ? (
            <>
              <p className="mt-2 text-sm text-[#374151]">{expertNom || "Non renseigné"}</p>
              {expertProfile?.email ? (
                <p className="mt-1 text-sm text-[#6B7280]">{expertProfile.email}</p>
              ) : null}
              <Link
                to="/admin/utilisateurs/$userId"
                params={{ userId: dossier.expert_id }}
                className="mt-3 inline-flex text-sm font-semibold text-[#5B50F0] hover:underline"
              >
                Voir profil →
              </Link>
            </>
          ) : (
            <div className="mt-2 space-y-3">
              <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                Non assigné
              </span>
              <p className="text-sm font-semibold text-[#111827]">Assigner un expert</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div
                  ref={expertPickerRef}
                  className="w-full sm:max-w-md"
                  style={{ position: "relative" }}
                >
                  <input
                    type="text"
                    placeholder="Rechercher un expert..."
                    value={expertSearch}
                    onChange={(e) => {
                      setExpertSearch(e.target.value);
                      setShowExpertDropdown(true);
                    }}
                    onFocus={() => setShowExpertDropdown(true)}
                    style={{
                      width: "100%",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                      padding: "10px 16px",
                      fontSize: "0.95rem",
                    }}
                  />

                  {showExpertDropdown ? (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        background: "white",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                        zIndex: 50,
                        maxHeight: "240px",
                        overflowY: "auto",
                      }}
                    >
                      {(() => {
                        const filtered = experts.filter((ex) =>
                          expertRowLabel(ex).toLowerCase().includes(expertSearch.toLowerCase()),
                        );
                        return (
                          <>
                            {filtered.map((expert) => (
                              <div
                                key={String(expert.id ?? expert.expert_id ?? "")}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(ev) => {
                                  if (ev.key === "Enter" || ev.key === " ") {
                                    ev.preventDefault();
                                    const eid = String(expert.id ?? expert.expert_id);
                                    setSelectedExpertId(eid);
                                    setExpertSearch(expertRowLabel(expert));
                                    setShowExpertDropdown(false);
                                  }
                                }}
                                onClick={() => {
                                  const eid = String(expert.id ?? expert.expert_id);
                                  setSelectedExpertId(eid);
                                  setExpertSearch(expertRowLabel(expert));
                                  setShowExpertDropdown(false);
                                }}
                                style={{
                                  padding: "12px 16px",
                                  cursor: "pointer",
                                  borderBottom: "1px solid #F3F4F6",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                                onMouseEnter={(ev) => {
                                  ev.currentTarget.style.background = "#F8F7FF";
                                }}
                                onMouseLeave={(ev) => {
                                  ev.currentTarget.style.background = "white";
                                }}
                              >
                                <span style={{ fontWeight: 500 }}>{expertRowLabel(expert)}</span>
                                {expert.specialite ? (
                                  <span
                                    style={{
                                      fontSize: "0.75rem",
                                      background: "#EEE9FF",
                                      color: "#5B50F0",
                                      padding: "2px 8px",
                                      borderRadius: "999px",
                                    }}
                                  >
                                    {expert.specialite}
                                  </span>
                                ) : null}
                              </div>
                            ))}
                            {filtered.length === 0 ? (
                              <div
                                style={{
                                  padding: "16px",
                                  color: "#9CA3AF",
                                  textAlign: "center",
                                  fontSize: "0.875rem",
                                }}
                              >
                                Aucun expert trouvé
                              </div>
                            ) : null}
                          </>
                        );
                      })()}
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  disabled={!selectedExpertId.trim() || assigningExpert}
                  onClick={() => void confirmAssignExpert()}
                  className="h-10 shrink-0 rounded-lg bg-[#5B50F0] px-4 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
                >
                  {assigningExpert ? "…" : "Confirmer"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
