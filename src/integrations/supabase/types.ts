export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      case_analyses: {
        Row: {
          analysis_type: string
          case_id: string
          created_at: string
          created_by: string | null
          id: string
          model: string | null
          result: Json
          summary: string | null
        }
        Insert: {
          analysis_type: string
          case_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          model?: string | null
          result?: Json
          summary?: string | null
        }
        Update: {
          analysis_type?: string
          case_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          model?: string | null
          result?: Json
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_analyses_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_documents: {
        Row: {
          case_id: string
          category: string | null
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          id: string
          storage_path: string
          uploaded_by: string
        }
        Insert: {
          case_id: string
          category?: string | null
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          storage_path: string
          uploaded_by: string
        }
        Update: {
          case_id?: string
          category?: string | null
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          storage_path?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_events: {
        Row: {
          actor_id: string | null
          case_id: string
          created_at: string
          description: string | null
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          is_visible_to_client: boolean
          metadata: Json | null
          title: string
        }
        Insert: {
          actor_id?: string | null
          case_id: string
          created_at?: string
          description?: string | null
          event_type: Database["public"]["Enums"]["event_type"]
          id?: string
          is_visible_to_client?: boolean
          metadata?: Json | null
          title: string
        }
        Update: {
          actor_id?: string | null
          case_id?: string
          created_at?: string
          description?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          is_visible_to_client?: boolean
          metadata?: Json | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_messages: {
        Row: {
          case_id: string
          content: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          case_id: string
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          case_id?: string
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_messages_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          claim_type: Database["public"]["Enums"]["claim_type"]
          created_at: string
          description: string | null
          estimated_amount: number | null
          expert_id: string | null
          id: string
          incident_date: string | null
          insurer_name: string | null
          insurer_offer: number | null
          obtained_amount: number | null
          owner_id: string
          policy_number: string | null
          reference: string
          status: Database["public"]["Enums"]["case_status"]
          title: string
          updated_at: string
        }
        Insert: {
          claim_type: Database["public"]["Enums"]["claim_type"]
          created_at?: string
          description?: string | null
          estimated_amount?: number | null
          expert_id?: string | null
          id?: string
          incident_date?: string | null
          insurer_name?: string | null
          insurer_offer?: number | null
          obtained_amount?: number | null
          owner_id: string
          policy_number?: string | null
          reference?: string
          status?: Database["public"]["Enums"]["case_status"]
          title: string
          updated_at?: string
        }
        Update: {
          claim_type?: Database["public"]["Enums"]["claim_type"]
          created_at?: string
          description?: string | null
          estimated_amount?: number | null
          expert_id?: string | null
          id?: string
          incident_date?: string | null
          insurer_name?: string | null
          insurer_offer?: number | null
          obtained_amount?: number | null
          owner_id?: string
          policy_number?: string | null
          reference?: string
          status?: Database["public"]["Enums"]["case_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          chemin: string | null
          created_at: string
          dossier_id: string | null
          id: string
          nom: string
          storage_path: string | null
          statut: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          chemin?: string | null
          created_at?: string
          dossier_id?: string | null
          id?: string
          nom: string
          storage_path?: string | null
          statut?: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          chemin?: string | null
          created_at?: string
          dossier_id?: string | null
          id?: string
          nom?: string
          storage_path?: string | null
          statut?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "dossiers"
            referencedColumns: ["id"]
          },
        ]
      }
      dossiers: {
        Row: {
          analyse_ia: string | null
          analyse_ia_date: string | null
          assureur_nom: string | null
          created_at: string
          date_sinistre: string | null
          date_ouverture: string
          description: string | null
          expert_id: string | null
          id: string
          mandat_signe: boolean
          mandat_signe_le: string | null
          mandat_signature: string | null
          montant_estime: number
          notes_expert: string | null
          numero_contrat: string | null
          offre_assureur: number | null
          statut: string
          titre: string | null
          type_sinistre: string
          user_id: string
        }
        Insert: {
          analyse_ia?: string | null
          analyse_ia_date?: string | null
          assureur_nom?: string | null
          created_at?: string
          date_sinistre?: string | null
          date_ouverture?: string
          description?: string | null
          expert_id?: string | null
          id?: string
          mandat_signe?: boolean
          mandat_signe_le?: string | null
          mandat_signature?: string | null
          montant_estime?: number
          notes_expert?: string | null
          numero_contrat?: string | null
          offre_assureur?: number | null
          statut?: string
          titre?: string | null
          type_sinistre: string
          user_id: string
        }
        Update: {
          analyse_ia?: string | null
          analyse_ia_date?: string | null
          assureur_nom?: string | null
          created_at?: string
          date_sinistre?: string | null
          date_ouverture?: string
          description?: string | null
          expert_id?: string | null
          id?: string
          mandat_signe?: boolean
          mandat_signe_le?: string | null
          mandat_signature?: string | null
          montant_estime?: number
          notes_expert?: string | null
          numero_contrat?: string | null
          offre_assureur?: number | null
          statut?: string
          titre?: string | null
          type_sinistre?: string
          user_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          case_id: string
          fee_rate: number
          id: string
          issued_at: string
          owner_id: string
          paid_at: string | null
          status: string
        }
        Insert: {
          amount: number
          case_id: string
          fee_rate: number
          id?: string
          issued_at?: string
          owner_id: string
          paid_at?: string | null
          status?: string
        }
        Update: {
          amount?: number
          case_id?: string
          fee_rate?: number
          id?: string
          issued_at?: string
          owner_id?: string
          paid_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          auteur: string
          contenu: string
          created_at: string
          dossier_id: string
          id: string
        }
        Insert: {
          auteur: string
          contenu: string
          created_at?: string
          dossier_id: string
          id?: string
        }
        Update: {
          auteur?: string
          contenu?: string
          created_at?: string
          dossier_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "dossiers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          adresse: string | null
          assureur_principal: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          mandat_email: string | null
          mandat_signe: boolean
          mandat_signe_le: string | null
          mandat_signature: string | null
          nom: string | null
          numero_contrat: string | null
          phone: string | null
          prenom: string | null
          role: string
          specialite: string | null
          telephone: string | null
          updated_at: string
        }
        Insert: {
          adresse?: string | null
          assureur_principal?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          mandat_email?: string | null
          mandat_signe?: boolean
          mandat_signe_le?: string | null
          mandat_signature?: string | null
          nom?: string | null
          numero_contrat?: string | null
          phone?: string | null
          prenom?: string | null
          role?: string
          specialite?: string | null
          telephone?: string | null
          updated_at?: string
        }
        Update: {
          adresse?: string | null
          assureur_principal?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          mandat_email?: string | null
          mandat_signe?: boolean
          mandat_signe_le?: string | null
          mandat_signature?: string | null
          nom?: string | null
          numero_contrat?: string | null
          phone?: string | null
          prenom?: string | null
          role?: string
          specialite?: string | null
          telephone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "assure" | "expert" | "admin"
      case_status:
        | "nouveau"
        | "qualification"
        | "en_analyse"
        | "en_negociation"
        | "expertise"
        | "cloture_succes"
        | "cloture_echec"
        | "abandonne"
      claim_type:
        | "degat_des_eaux"
        | "incendie"
        | "vol_cambriolage"
        | "catastrophe_naturelle"
        | "bris_de_glace"
        | "dommage_vehicule"
        | "responsabilite_civile"
        | "autre"
      event_type:
        | "creation"
        | "document_ajoute"
        | "message"
        | "changement_statut"
        | "analyse_ia"
        | "expert_assigne"
        | "note_interne"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["assure", "expert", "admin"],
      case_status: [
        "nouveau",
        "qualification",
        "en_analyse",
        "en_negociation",
        "expertise",
        "cloture_succes",
        "cloture_echec",
        "abandonne",
      ],
      claim_type: [
        "degat_des_eaux",
        "incendie",
        "vol_cambriolage",
        "catastrophe_naturelle",
        "bris_de_glace",
        "dommage_vehicule",
        "responsabilite_civile",
        "autre",
      ],
      event_type: [
        "creation",
        "document_ajoute",
        "message",
        "changement_statut",
        "analyse_ia",
        "expert_assigne",
        "note_interne",
      ],
    },
  },
} as const
