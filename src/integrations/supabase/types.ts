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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      driver_location_history: {
        Row: {
          created_at: string
          driver_id: string
          heading: number | null
          id: string
          latitude: number
          longitude: number
          order_id: string
          recorded_at: string
          speed: number | null
        }
        Insert: {
          created_at?: string
          driver_id: string
          heading?: number | null
          id?: string
          latitude: number
          longitude: number
          order_id: string
          recorded_at?: string
          speed?: number | null
        }
        Update: {
          created_at?: string
          driver_id?: string
          heading?: number | null
          id?: string
          latitude?: number
          longitude?: number
          order_id?: string
          recorded_at?: string
          speed?: number | null
        }
        Relationships: []
      }
      drivers: {
        Row: {
          created_at: string
          current_location: string | null
          current_location_lat: number | null
          current_location_lng: number | null
          email: string | null
          id: string
          license_number: string | null
          location_updated_at: string | null
          name: string
          phone: string
          rating: number | null
          status: string
          total_deliveries: number | null
          vehicle_color: string | null
          vehicle_plate: string | null
          vehicle_type: string
        }
        Insert: {
          created_at?: string
          current_location?: string | null
          current_location_lat?: number | null
          current_location_lng?: number | null
          email?: string | null
          id?: string
          license_number?: string | null
          location_updated_at?: string | null
          name: string
          phone: string
          rating?: number | null
          status?: string
          total_deliveries?: number | null
          vehicle_color?: string | null
          vehicle_plate?: string | null
          vehicle_type: string
        }
        Update: {
          created_at?: string
          current_location?: string | null
          current_location_lat?: number | null
          current_location_lng?: number | null
          email?: string | null
          id?: string
          license_number?: string | null
          location_updated_at?: string | null
          name?: string
          phone?: string
          rating?: number | null
          status?: string
          total_deliveries?: number | null
          vehicle_color?: string | null
          vehicle_plate?: string | null
          vehicle_type?: string
        }
        Relationships: []
      }
      hubspot_sync_status: {
        Row: {
          created_at: string | null
          error_message: string | null
          hubspot_deal_id: string | null
          id: string
          last_attempt_at: string | null
          order_id: string | null
          retry_count: number | null
          sync_status: string
          sync_type: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          hubspot_deal_id?: string | null
          id?: string
          last_attempt_at?: string | null
          order_id?: string | null
          retry_count?: number | null
          sync_status: string
          sync_type: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          hubspot_deal_id?: string | null
          id?: string
          last_attempt_at?: string | null
          order_id?: string | null
          retry_count?: number | null
          sync_status?: string
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "hubspot_sync_status_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string
          order_id: string | null
          read: boolean | null
          title: string | null
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message: string
          order_id?: string | null
          read?: boolean | null
          title?: string | null
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string
          order_id?: string | null
          read?: boolean | null
          title?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          assigned_at: string | null
          base_rate: number
          completed_at: string | null
          created_at: string
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          delivered_at: string | null
          distance: number
          driver_id: string | null
          driver_name: string | null
          driver_phone: string | null
          dropoff_address: string
          dropoff_lat: number | null
          dropoff_lng: number | null
          estimated_delivery: string | null
          hubspot_deal_id: string | null
          hubspot_properties: Json | null
          id: string
          in_transit_at: string | null
          invoice_approved_manually: boolean | null
          mileage_charge: number
          order_number: string
          package_description: string
          package_weight: number
          picked_up_at: string | null
          pickup_address: string
          pickup_lat: number | null
          pickup_lng: number | null
          special_instructions: string | null
          status: string
          stripe_session_id: string | null
          surcharge: number | null
          total_price: number
        }
        Insert: {
          assigned_at?: string | null
          base_rate: number
          completed_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          delivered_at?: string | null
          distance: number
          driver_id?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          dropoff_address: string
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          estimated_delivery?: string | null
          hubspot_deal_id?: string | null
          hubspot_properties?: Json | null
          id?: string
          in_transit_at?: string | null
          invoice_approved_manually?: boolean | null
          mileage_charge: number
          order_number?: string
          package_description: string
          package_weight: number
          picked_up_at?: string | null
          pickup_address: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          special_instructions?: string | null
          status?: string
          stripe_session_id?: string | null
          surcharge?: number | null
          total_price: number
        }
        Update: {
          assigned_at?: string | null
          base_rate?: number
          completed_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          delivered_at?: string | null
          distance?: number
          driver_id?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          dropoff_address?: string
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          estimated_delivery?: string | null
          hubspot_deal_id?: string | null
          hubspot_properties?: Json | null
          id?: string
          in_transit_at?: string | null
          invoice_approved_manually?: boolean | null
          mileage_charge?: number
          order_number?: string
          package_description?: string
          package_weight?: number
          picked_up_at?: string | null
          pickup_address?: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          special_instructions?: string | null
          status?: string
          stripe_session_id?: string | null
          surcharge?: number | null
          total_price?: number
        }
        Relationships: []
      }
      pricing_audit: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
        }
        Relationships: []
      }
      pricing_rules: {
        Row: {
          active: boolean | null
          base_rate: number
          created_at: string
          heavy_package_surcharge: number
          heavy_package_threshold: number
          id: string
          per_mile_rate: number
          per_pound_rate: number
          updated_at: string
          urgent_surcharge_percent: number
        }
        Insert: {
          active?: boolean | null
          base_rate?: number
          created_at?: string
          heavy_package_surcharge?: number
          heavy_package_threshold?: number
          id?: string
          per_mile_rate?: number
          per_pound_rate?: number
          updated_at?: string
          urgent_surcharge_percent?: number
        }
        Update: {
          active?: boolean | null
          base_rate?: number
          created_at?: string
          heavy_package_surcharge?: number
          heavy_package_threshold?: number
          id?: string
          per_mile_rate?: number
          per_pound_rate?: number
          updated_at?: string
          urgent_surcharge_percent?: number
        }
        Relationships: []
      }
      proof_of_delivery: {
        Row: {
          created_at: string
          delivery_location_lat: number | null
          delivery_location_lng: number | null
          driver_id: string | null
          id: string
          notes: string | null
          order_id: string
          photo_url: string | null
          recipient_name: string | null
          signature_url: string | null
        }
        Insert: {
          created_at?: string
          delivery_location_lat?: number | null
          delivery_location_lng?: number | null
          driver_id?: string | null
          id?: string
          notes?: string | null
          order_id: string
          photo_url?: string | null
          recipient_name?: string | null
          signature_url?: string | null
        }
        Update: {
          created_at?: string
          delivery_location_lat?: number | null
          delivery_location_lng?: number | null
          driver_id?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          photo_url?: string | null
          recipient_name?: string | null
          signature_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proof_of_delivery_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
      webhook_config: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          updated_at: string
          webhook_name: string
          webhook_type: string
          webhook_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          webhook_name: string
          webhook_type: string
          webhook_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          webhook_name?: string
          webhook_type?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string | null
          direction: string
          error_message: string | null
          id: string
          payload: Json | null
          response: Json | null
          status: string
          webhook_name: string
        }
        Insert: {
          created_at?: string | null
          direction: string
          error_message?: string | null
          id?: string
          payload?: Json | null
          response?: Json | null
          status: string
          webhook_name: string
        }
        Update: {
          created_at?: string | null
          direction?: string
          error_message?: string | null
          id?: string
          payload?: Json | null
          response?: Json | null
          status?: string
          webhook_name?: string
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
      app_role: "admin" | "dispatcher" | "driver" | "customer"
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
      app_role: ["admin", "dispatcher", "driver", "customer"],
    },
  },
} as const
