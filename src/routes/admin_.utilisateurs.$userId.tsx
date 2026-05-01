import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin_/utilisateurs/$userId")({
  component: ProfilUtilisateur,
});

type ProfilEditForm = {
  prenom: string;
  nom: string;
  telephone: string;
  assureur_principal: string;
};

function Field({
  label,
  value,
  field,
  editing,
  form,
  setForm,
}: {
  label: string;
  value: string;
  field: keyof ProfilEditForm;
  editing: boolean;
  form: ProfilEditForm;
  setForm: Dispatch<SetStateAction<ProfilEditForm>>;
}) {
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
          value={form[field]}
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
  const [form, setForm] = useState<ProfilEditForm>({
    prenom: "",
    nom: "",
    telephone: "",
    assureur_principal: "",
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

  async function handleSave() {
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        prenom: form.prenom,
        nom: form.nom,
        telephone: form.telephone,
        full_name: `${form.prenom} ${form.nom}`.trim(),
        assureur_principal: form.assureur_principal,
      });

      if (error) throw error;

      await supabase
        .from("dossiers")
        .update({
          nom_assure: form.nom,
          prenom_assure: form.prenom,
          assureur: form.assureur_principal,
        })
        .eq("user_id", userId);

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
    if (loading)
      return (
        <div
          style={{
            padding: "40px",
            maxWidth: "900px",
            background: "#F8F9FF",
            minHeight: "100vh",
          }}
        >
          <div style={{ textAlign: "center" }}>Chargement...</div>
        </div>
      );

    if (error)
      return (
        <div
          style={{
            padding: "40px",
            maxWidth: "900px",
            background: "#F8F9FF",
            minHeight: "100vh",
          }}
        >
          <p style={{ color: "red" }}>Erreur : {error}</p>
          <button type="button" onClick={() => navigate({ to: "/admin/utilisateurs" })}>
            Retour
          </button>
        </div>
      );

    return (
      <div
        style={{
          padding: "40px",
          maxWidth: "900px",
          background: "#F8F9FF",
          minHeight: "100vh",
        }}
      >
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
            ✓ Profil mis à jour
          </div>
        )}
        <button
          type="button"
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
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    if (profile) {
                      setForm({
                        prenom: profile.prenom || "",
                        nom: profile.nom || "",
                        telephone: profile.telephone || "",
                        assureur_principal: profile.assureur_principal || "",
                      });
                    }
                  }}
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
            <Field
              label="Prénom"
              value={form.prenom}
              field="prenom"
              editing={editing}
              form={form}
              setForm={setForm}
            />
            <Field label="Nom" value={form.nom} field="nom" editing={editing} form={form} setForm={setForm} />
            <Field
              label="Téléphone"
              value={form.telephone}
              field="telephone"
              editing={editing}
              form={form}
              setForm={setForm}
            />
            <Field
              label="Assureur"
              value={form.assureur_principal}
              field="assureur_principal"
              editing={editing}
              form={form}
              setForm={setForm}
            />
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
      <div
        style={{
          padding: "40px",
          maxWidth: "900px",
          background: "#F8F9FF",
          minHeight: "100vh",
        }}
      >
        <h2 style={{ color: "red" }}>Erreur de rendu</h2>
        <pre>{String(err)}</pre>
        <button type="button" onClick={() => window.history.back()}>
          Retour
        </button>
      </div>
    );
  }
}
