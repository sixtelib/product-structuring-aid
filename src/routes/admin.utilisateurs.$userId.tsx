import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/utilisateurs/$userId")({
  component: ProfilUtilisateur,
});

function ProfilUtilisateur() {
  const { userId } = Route.useParams();
  const navigate = useNavigate();
  const [dossiers, setDossiers] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setDossiers(dossiersData ?? []);
      } catch (err: any) {
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
        <h2 style={{ fontWeight: 600, marginBottom: "16px" }}>Informations</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <p style={{ fontSize: "0.75rem", color: "#6B7280", textTransform: "uppercase" }}>
              Prénom
            </p>
            <p>{profile?.prenom || "Non renseigné"}</p>
          </div>
          <div>
            <p style={{ fontSize: "0.75rem", color: "#6B7280", textTransform: "uppercase" }}>Nom</p>
            <p>{profile?.nom || "Non renseigné"}</p>
          </div>
          <div>
            <p style={{ fontSize: "0.75rem", color: "#6B7280", textTransform: "uppercase" }}>
              Téléphone
            </p>
            <p>{profile?.telephone || "Non renseigné"}</p>
          </div>
          <div>
            <p style={{ fontSize: "0.75rem", color: "#6B7280", textTransform: "uppercase" }}>
              Assureur
            </p>
            <p>{profile?.assureur_principal || "Non renseigné"}</p>
          </div>
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
}
