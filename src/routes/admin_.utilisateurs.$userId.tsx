import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin_/utilisateurs/$userId")({
  component: ProfilUtilisateur,
});

function ProfilUtilisateur() {
  const { userId } = Route.useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [dossiers, setDossiers] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    assureur_principal: "",
    adresse: "",
    numero_contrat: "",
    email_contact: "",
  });

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        const { data: dossiersData, error: dossiersError } = await supabase
          .from("dossiers")
          .select("*")
          .eq("user_id", userId)
          .order("date_ouverture", { ascending: false });

        if (dossiersError) throw dossiersError;
        if (!isMounted) return;

        setProfile(profileData);
        if (profileData) {
          setForm({
            prenom: profileData.prenom || "",
            nom: profileData.nom || "",
            telephone: profileData.telephone || "",
            assureur_principal: profileData.assureur_principal || "",
            adresse: profileData.adresse || "",
            numero_contrat: profileData.numero_contrat || "",
            email_contact: profileData.email_contact || "",
          });
        }
        setDossiers(dossiersData ?? []);
      } catch (err: any) {
        console.error("Erreur chargement profil:", err);
        if (!isMounted) return;
        setError(err.message);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  function Field({ label, value, field }: { label: string; value: string; field: string }) {
    return (
      <div>
        <p
          style={{
            fontSize: "0.75rem",
            color: "#6B7280",
            textTransform: "uppercase",
            marginBottom: "4px",
          }}
        >
          {label}
        </p>
        {editing ? (
          <input
            value={form[field as keyof typeof form]}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                [field]: e.target.value,
              }))
            }
            style={{
              border: "1px solid #5B50F0",
              borderRadius: "6px",
              padding: "6px 10px",
              width: "100%",
              fontSize: "0.95rem",
            }}
          />
        ) : (
          <p>{value || "Non renseigné"}</p>
        )}
      </div>
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        prenom: form.prenom,
        nom: form.nom,
        telephone: form.telephone,
        assureur_principal: form.assureur_principal,
        adresse: form.adresse,
        numero_contrat: form.numero_contrat,
        email_contact: form.email_contact,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Sync avec la table dossiers
      if (form.nom || form.prenom) {
        await supabase
          .from("dossiers")
          .update({
            nom_assure: form.nom,
            prenom_assure: form.prenom,
            assureur: form.assureur_principal,
          })
          .eq("user_id", userId);
      }

      setProfile((prev: any) => ({ ...prev, ...form }));
      setEditing(false);
      setSuccessMsg("Profil mis à jour");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setError("Erreur : " + err.message);
    } finally {
      setSaving(false);
    }
  }

  try {
    if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Chargement...</div>;

    if (error)
      return (
        <div style={{ padding: "40px" }}>
          <p style={{ color: "red" }}>Erreur : {error}</p>
          <button onClick={() => navigate({ to: "/admin/utilisateurs" })}>Retour</button>
        </div>
      );

    return (
      <div style={{ padding: "40px", maxWidth: "900px" }}>
        {successMsg && (
          <div
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              background: "#D4EDDA",
              border: "1px solid #C3E6CB",
              color: "#155724",
              padding: "12px 20px",
              borderRadius: "8px",
              zIndex: 1000,
              fontWeight: 500,
            }}
          >
            ✓ {successMsg}
          </div>
        )}
        <button
          onClick={() => navigate({ to: "/admin/utilisateurs" })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#5B50F0",
            background: "none",
            border: "none",
            cursor: "pointer",
            marginBottom: "24px",
            fontSize: "0.875rem",
          }}
        >
          <ArrowLeft size={16} /> Utilisateurs
        </button>

        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "8px" }}>
          {profile?.prenom || ""} {profile?.nom || "Profil utilisateur"}
        </h1>
        <p style={{ color: "#6B7280", marginBottom: "32px" }}>ID : {userId.slice(0, 8)}...</p>

        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <h2 style={{ fontWeight: 600, marginBottom: 0 }}>Informations</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                style={{
                  background: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  cursor: "pointer",
                }}
              >
                ✏️ Modifier
              </button>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    background: "#5B50F0",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    cursor: "pointer",
                  }}
                >
                  {saving ? "Sauvegarde..." : "✓ Sauvegarder"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  style={{
                    background: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    cursor: "pointer",
                  }}
                >
                  Annuler
                </button>
              </div>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Field label="Prénom" value={form.prenom} field="prenom" />
            <Field label="Nom" value={form.nom} field="nom" />
            <Field label="Téléphone" value={form.telephone} field="telephone" />
            <Field label="Assureur" value={form.assureur_principal} field="assureur_principal" />
            <Field label="Adresse" value={form.adresse} field="adresse" />
            <Field label="Numéro de contrat" value={form.numero_contrat} field="numero_contrat" />
            <Field label="Email contact" value={form.email_contact} field="email_contact" />
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          <h2 style={{ fontWeight: 600, marginBottom: "16px" }}>Dossiers ({dossiers.length})</h2>
          {dossiers.length === 0 ? (
            <p style={{ color: "#6B7280" }}>Aucun dossier</p>
          ) : (
            dossiers.map((d) => (
              <div
                key={d.id}
                onClick={() =>
                  navigate({
                    to: "/admin/dossiers/$dossierId",
                    params: { dossierId: d.id },
                  })
                }
                style={{
                  padding: "16px",
                  border: "1px solid #F3F4F6",
                  borderRadius: "8px",
                  marginBottom: "8px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p style={{ fontWeight: 500 }}>{d.type_sinistre}</p>
                  <p style={{ fontSize: "0.875rem", color: "#6B7280" }}>
                    {d.statut} ·{" "}
                    {d.montant_estime ? d.montant_estime + " €" : "Montant non renseigné"}
                  </p>
                </div>
                <span style={{ color: "#5B50F0", fontSize: "0.875rem" }}>Voir →</span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  } catch (err) {
    return (
      <div style={{ padding: "40px" }}>
        <h2 style={{ color: "red" }}>Erreur de rendu</h2>
        <pre>{String(err)}</pre>
        <button onClick={() => window.history.back()}>Retour</button>
      </div>
    );
  }
}
