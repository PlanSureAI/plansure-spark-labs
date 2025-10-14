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
      activity_logs: {
        Row: {
          action: string
          action_details: Json | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          action: string
          action_details?: Json | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          action?: string
          action_details?: Json | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      analysis_comments: {
        Row: {
          analysis_id: string
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_id: string
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_id?: string
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analysis_comments_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "investment_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_alerts: {
        Row: {
          alert_date: string
          alert_type: string
          compliance_id: string
          created_at: string
          id: string
          property_id: string
          resolved: boolean | null
          updated_at: string
        }
        Insert: {
          alert_date: string
          alert_type: string
          compliance_id: string
          created_at?: string
          id?: string
          property_id: string
          resolved?: boolean | null
          updated_at?: string
        }
        Update: {
          alert_date?: string
          alert_type?: string
          compliance_id?: string
          created_at?: string
          id?: string
          property_id?: string
          resolved?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_alerts_compliance_id_fkey"
            columns: ["compliance_id"]
            isOneToOne: false
            referencedRelation: "compliance_requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_alerts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_requirements: {
        Row: {
          applicable_property_types: string[] | null
          created_at: string
          description: string | null
          id: string
          jurisdiction: string
          name: string
          renewal_period_days: number | null
          threshold_values: Json | null
          updated_at: string
        }
        Insert: {
          applicable_property_types?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          jurisdiction: string
          name: string
          renewal_period_days?: number | null
          threshold_values?: Json | null
          updated_at?: string
        }
        Update: {
          applicable_property_types?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          jurisdiction?: string
          name?: string
          renewal_period_days?: number | null
          threshold_values?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      compliance_tracking: {
        Row: {
          change_history: Json | null
          compliance_id: string
          created_at: string
          document_urls: string[] | null
          id: string
          last_audit_date: string | null
          last_updated_by: string | null
          next_deadline: string
          notes: string | null
          property_id: string
          status: string
          updated_at: string
        }
        Insert: {
          change_history?: Json | null
          compliance_id: string
          created_at?: string
          document_urls?: string[] | null
          id?: string
          last_audit_date?: string | null
          last_updated_by?: string | null
          next_deadline: string
          notes?: string | null
          property_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          change_history?: Json | null
          compliance_id?: string
          created_at?: string
          document_urls?: string[] | null
          id?: string
          last_audit_date?: string | null
          last_updated_by?: string | null
          next_deadline?: string
          notes?: string | null
          property_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_tracking_compliance_id_fkey"
            columns: ["compliance_id"]
            isOneToOne: false
            referencedRelation: "compliance_requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_tracking_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      energy_analyses: {
        Row: {
          ai_recommendations: string | null
          ai_summary: string | null
          annual_savings: number | null
          annual_sunshine_hours: number | null
          battery_storage_kwh: number | null
          building_type: string
          climate_zone: string | null
          cooling_system: string | null
          created_at: string
          current_annual_carbon_kg: number | null
          current_annual_cost: number | null
          current_annual_energy_kwh: number | null
          embodied_carbon_kg: number | null
          floor_area_sqft: number
          forecast_annual_carbon_kg: number | null
          forecast_annual_cost: number | null
          forecast_annual_energy_kwh: number | null
          forecast_carbon_reduction_kg: number | null
          forecast_cost_savings_annual: number | null
          forecast_energy_savings_percent: number | null
          government_incentives: number | null
          green_certification_readiness: string | null
          heat_pump_installed: boolean | null
          heating_system: string | null
          id: string
          improvement_priorities: Json | null
          insulation_quality: string | null
          insulation_upgrade: boolean | null
          is_shared: boolean | null
          operational_carbon_kg: number | null
          payback_period_years: number | null
          property_id: string | null
          roi_20_year: number | null
          share_expires_at: string | null
          share_token: string | null
          shared_at: string | null
          smart_controls: boolean | null
          solar_panel_kw: number | null
          sustainability_score: number | null
          total_upgrade_cost: number | null
          updated_at: string
          user_id: string
          workspace_id: string | null
          year_built: number | null
        }
        Insert: {
          ai_recommendations?: string | null
          ai_summary?: string | null
          annual_savings?: number | null
          annual_sunshine_hours?: number | null
          battery_storage_kwh?: number | null
          building_type: string
          climate_zone?: string | null
          cooling_system?: string | null
          created_at?: string
          current_annual_carbon_kg?: number | null
          current_annual_cost?: number | null
          current_annual_energy_kwh?: number | null
          embodied_carbon_kg?: number | null
          floor_area_sqft: number
          forecast_annual_carbon_kg?: number | null
          forecast_annual_cost?: number | null
          forecast_annual_energy_kwh?: number | null
          forecast_carbon_reduction_kg?: number | null
          forecast_cost_savings_annual?: number | null
          forecast_energy_savings_percent?: number | null
          government_incentives?: number | null
          green_certification_readiness?: string | null
          heat_pump_installed?: boolean | null
          heating_system?: string | null
          id?: string
          improvement_priorities?: Json | null
          insulation_quality?: string | null
          insulation_upgrade?: boolean | null
          is_shared?: boolean | null
          operational_carbon_kg?: number | null
          payback_period_years?: number | null
          property_id?: string | null
          roi_20_year?: number | null
          share_expires_at?: string | null
          share_token?: string | null
          shared_at?: string | null
          smart_controls?: boolean | null
          solar_panel_kw?: number | null
          sustainability_score?: number | null
          total_upgrade_cost?: number | null
          updated_at?: string
          user_id: string
          workspace_id?: string | null
          year_built?: number | null
        }
        Update: {
          ai_recommendations?: string | null
          ai_summary?: string | null
          annual_savings?: number | null
          annual_sunshine_hours?: number | null
          battery_storage_kwh?: number | null
          building_type?: string
          climate_zone?: string | null
          cooling_system?: string | null
          created_at?: string
          current_annual_carbon_kg?: number | null
          current_annual_cost?: number | null
          current_annual_energy_kwh?: number | null
          embodied_carbon_kg?: number | null
          floor_area_sqft?: number
          forecast_annual_carbon_kg?: number | null
          forecast_annual_cost?: number | null
          forecast_annual_energy_kwh?: number | null
          forecast_carbon_reduction_kg?: number | null
          forecast_cost_savings_annual?: number | null
          forecast_energy_savings_percent?: number | null
          government_incentives?: number | null
          green_certification_readiness?: string | null
          heat_pump_installed?: boolean | null
          heating_system?: string | null
          id?: string
          improvement_priorities?: Json | null
          insulation_quality?: string | null
          insulation_upgrade?: boolean | null
          is_shared?: boolean | null
          operational_carbon_kg?: number | null
          payback_period_years?: number | null
          property_id?: string | null
          roi_20_year?: number | null
          share_expires_at?: string | null
          share_token?: string | null
          shared_at?: string | null
          smart_controls?: boolean | null
          solar_panel_kw?: number | null
          sustainability_score?: number | null
          total_upgrade_cost?: number | null
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "energy_analyses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "energy_analyses_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      energy_readings: {
        Row: {
          battery_charge_percent: number | null
          carbon_intensity_g_per_kwh: number | null
          cost_per_kwh: number | null
          created_at: string
          device_id: string
          energy_consumed_kwh: number | null
          energy_produced_kwh: number | null
          grid_export_kwh: number | null
          grid_import_kwh: number | null
          id: string
          reading_timestamp: string
        }
        Insert: {
          battery_charge_percent?: number | null
          carbon_intensity_g_per_kwh?: number | null
          cost_per_kwh?: number | null
          created_at?: string
          device_id: string
          energy_consumed_kwh?: number | null
          energy_produced_kwh?: number | null
          grid_export_kwh?: number | null
          grid_import_kwh?: number | null
          id?: string
          reading_timestamp?: string
        }
        Update: {
          battery_charge_percent?: number | null
          carbon_intensity_g_per_kwh?: number | null
          cost_per_kwh?: number | null
          created_at?: string
          device_id?: string
          energy_consumed_kwh?: number | null
          energy_produced_kwh?: number | null
          grid_export_kwh?: number | null
          grid_import_kwh?: number | null
          id?: string
          reading_timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "energy_readings_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "smart_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_models: {
        Row: {
          analysis_id: string
          cash_flow_projections: Json | null
          contract_scenarios: Json | null
          created_at: string
          government_incentives: Json | null
          guarantee_type: string | null
          id: string
          model_name: string
          payback_analysis: Json | null
          risk_assessment: Json | null
          simulation_results: Json | null
          updated_at: string
          user_id: string
          utility_partner: string | null
          workspace_id: string | null
        }
        Insert: {
          analysis_id: string
          cash_flow_projections?: Json | null
          contract_scenarios?: Json | null
          created_at?: string
          government_incentives?: Json | null
          guarantee_type?: string | null
          id?: string
          model_name: string
          payback_analysis?: Json | null
          risk_assessment?: Json | null
          simulation_results?: Json | null
          updated_at?: string
          user_id: string
          utility_partner?: string | null
          workspace_id?: string | null
        }
        Update: {
          analysis_id?: string
          cash_flow_projections?: Json | null
          contract_scenarios?: Json | null
          created_at?: string
          government_incentives?: Json | null
          guarantee_type?: string | null
          id?: string
          model_name?: string
          payback_analysis?: Json | null
          risk_assessment?: Json | null
          simulation_results?: Json | null
          updated_at?: string
          user_id?: string
          utility_partner?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_models_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "energy_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_models_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_analyses: {
        Row: {
          ai_recommendations: string | null
          ai_summary: string | null
          annual_operating_expenses: number
          annual_property_appreciation: number
          annual_rental_income: number
          cap_rate: number | null
          cash_on_cash_return: number | null
          created_at: string
          down_payment_percent: number
          holding_period_years: number
          id: string
          irr: number | null
          is_shared: boolean | null
          loan_interest_rate: number
          loan_term_years: number
          market_conditions: Json | null
          npv: number | null
          payback_period_years: number | null
          property_id: string | null
          purchase_price: number
          risk_score: number | null
          scenarios: Json | null
          share_expires_at: string | null
          share_token: string | null
          shared_at: string | null
          updated_at: string
          user_id: string
          vacancy_rate: number
          workspace_id: string | null
        }
        Insert: {
          ai_recommendations?: string | null
          ai_summary?: string | null
          annual_operating_expenses: number
          annual_property_appreciation?: number
          annual_rental_income: number
          cap_rate?: number | null
          cash_on_cash_return?: number | null
          created_at?: string
          down_payment_percent: number
          holding_period_years?: number
          id?: string
          irr?: number | null
          is_shared?: boolean | null
          loan_interest_rate: number
          loan_term_years: number
          market_conditions?: Json | null
          npv?: number | null
          payback_period_years?: number | null
          property_id?: string | null
          purchase_price: number
          risk_score?: number | null
          scenarios?: Json | null
          share_expires_at?: string | null
          share_token?: string | null
          shared_at?: string | null
          updated_at?: string
          user_id: string
          vacancy_rate?: number
          workspace_id?: string | null
        }
        Update: {
          ai_recommendations?: string | null
          ai_summary?: string | null
          annual_operating_expenses?: number
          annual_property_appreciation?: number
          annual_rental_income?: number
          cap_rate?: number | null
          cash_on_cash_return?: number | null
          created_at?: string
          down_payment_percent?: number
          holding_period_years?: number
          id?: string
          irr?: number | null
          is_shared?: boolean | null
          loan_interest_rate?: number
          loan_term_years?: number
          market_conditions?: Json | null
          npv?: number | null
          payback_period_years?: number | null
          property_id?: string | null
          purchase_price?: number
          risk_score?: number | null
          scenarios?: Json | null
          share_expires_at?: string | null
          share_token?: string | null
          shared_at?: string | null
          updated_at?: string
          user_id?: string
          vacancy_rate?: number
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investment_analyses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_analyses_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      partnerships: {
        Row: {
          api_integration_details: Json | null
          contract_terms: Json | null
          created_at: string
          data_sharing_enabled: boolean | null
          end_date: string | null
          id: string
          partner_name: string
          partner_type: string
          partnership_status: string | null
          start_date: string | null
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          api_integration_details?: Json | null
          contract_terms?: Json | null
          created_at?: string
          data_sharing_enabled?: boolean | null
          end_date?: string | null
          id?: string
          partner_name: string
          partner_type: string
          partnership_status?: string | null
          start_date?: string | null
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          api_integration_details?: Json | null
          contract_terms?: Json | null
          created_at?: string
          data_sharing_enabled?: boolean | null
          end_date?: string | null
          id?: string
          partner_name?: string
          partner_type?: string
          partnership_status?: string | null
          start_date?: string | null
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partnerships_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          city: string
          country: string | null
          created_at: string
          id: string
          postal_code: string | null
          property_type: string
          size_sqft: number | null
          state: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          city: string
          country?: string | null
          created_at?: string
          id?: string
          postal_code?: string | null
          property_type: string
          size_sqft?: number | null
          state?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          city?: string
          country?: string | null
          created_at?: string
          id?: string
          postal_code?: string | null
          property_type?: string
          size_sqft?: number | null
          state?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      smart_devices: {
        Row: {
          api_credentials: Json | null
          api_endpoint: string | null
          created_at: string
          device_name: string
          device_type: string
          id: string
          last_sync: string | null
          manufacturer: string | null
          model: string | null
          property_id: string | null
          real_time_data: Json | null
          sync_status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          api_credentials?: Json | null
          api_endpoint?: string | null
          created_at?: string
          device_name: string
          device_type: string
          id?: string
          last_sync?: string | null
          manufacturer?: string | null
          model?: string | null
          property_id?: string | null
          real_time_data?: Json | null
          sync_status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          api_credentials?: Json | null
          api_endpoint?: string | null
          created_at?: string
          device_name?: string
          device_type?: string
          id?: string
          last_sync?: string | null
          manufacturer?: string | null
          model?: string | null
          property_id?: string | null
          real_time_data?: Json | null
          sync_status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smart_devices_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sustainability_certifications: {
        Row: {
          analysis_id: string
          assessment_data: Json | null
          awarded_date: string | null
          certification_type: string
          created_at: string
          current_score: number | null
          expiry_date: string | null
          id: string
          improvement_recommendations: Json | null
          status: string | null
          target_score: number | null
          updated_at: string
        }
        Insert: {
          analysis_id: string
          assessment_data?: Json | null
          awarded_date?: string | null
          certification_type: string
          created_at?: string
          current_score?: number | null
          expiry_date?: string | null
          id?: string
          improvement_recommendations?: Json | null
          status?: string | null
          target_score?: number | null
          updated_at?: string
        }
        Update: {
          analysis_id?: string
          assessment_data?: Json | null
          awarded_date?: string | null
          certification_type?: string
          created_at?: string
          current_score?: number | null
          expiry_date?: string | null
          id?: string
          improvement_recommendations?: Json | null
          status?: string | null
          target_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sustainability_certifications_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "energy_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          action_url: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          read_at: string | null
          severity: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          read_at?: string | null
          severity?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          read_at?: string | null
          severity?: string | null
          title?: string
          user_id?: string
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
      workspace_members: {
        Row: {
          accepted_at: string | null
          id: string
          invited_at: string
          role: Database["public"]["Enums"]["workspace_role"]
          user_id: string
          workspace_id: string
        }
        Insert: {
          accepted_at?: string | null
          id?: string
          invited_at?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          user_id: string
          workspace_id: string
        }
        Update: {
          accepted_at?: string | null
          id?: string
          invited_at?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_share_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_active_subscription: {
        Args: { _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_workspace_access: {
        Args: {
          _required_role?: Database["public"]["Enums"]["workspace_role"]
          _user_id: string
          _workspace_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      subscription_status:
        | "active"
        | "canceled"
        | "past_due"
        | "trialing"
        | "incomplete"
      workspace_role: "admin" | "editor" | "viewer"
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
      app_role: ["admin", "user"],
      subscription_status: [
        "active",
        "canceled",
        "past_due",
        "trialing",
        "incomplete",
      ],
      workspace_role: ["admin", "editor", "viewer"],
    },
  },
} as const
