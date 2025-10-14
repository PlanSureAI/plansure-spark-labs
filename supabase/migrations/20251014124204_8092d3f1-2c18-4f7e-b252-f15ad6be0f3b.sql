-- Create energy analyses table for zero carbon forecasting
CREATE TABLE public.energy_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  
  -- Building characteristics
  building_type VARCHAR NOT NULL,
  floor_area_sqft INTEGER NOT NULL,
  year_built INTEGER,
  insulation_quality VARCHAR,
  heating_system VARCHAR,
  cooling_system VARCHAR,
  
  -- Location data
  climate_zone VARCHAR,
  annual_sunshine_hours INTEGER,
  
  -- Current energy metrics
  current_annual_energy_kwh NUMERIC,
  current_annual_cost NUMERIC,
  current_annual_carbon_kg NUMERIC,
  
  -- Proposed upgrades
  solar_panel_kw NUMERIC DEFAULT 0,
  heat_pump_installed BOOLEAN DEFAULT false,
  insulation_upgrade BOOLEAN DEFAULT false,
  smart_controls BOOLEAN DEFAULT false,
  battery_storage_kwh NUMERIC DEFAULT 0,
  
  -- AI-generated forecasts
  forecast_annual_energy_kwh NUMERIC,
  forecast_annual_cost NUMERIC,
  forecast_annual_carbon_kg NUMERIC,
  forecast_energy_savings_percent NUMERIC,
  forecast_cost_savings_annual NUMERIC,
  forecast_carbon_reduction_kg NUMERIC,
  
  -- Financial projections
  total_upgrade_cost NUMERIC,
  annual_savings NUMERIC,
  payback_period_years NUMERIC,
  roi_20_year NUMERIC,
  government_incentives NUMERIC,
  
  -- Sustainability scoring
  sustainability_score INTEGER, -- 0-100
  green_certification_readiness VARCHAR,
  embodied_carbon_kg NUMERIC,
  operational_carbon_kg NUMERIC,
  
  -- AI insights
  ai_recommendations TEXT,
  ai_summary TEXT,
  improvement_priorities JSONB,
  
  -- Sharing
  is_shared BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE,
  shared_at TIMESTAMPTZ,
  share_expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.energy_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own or workspace energy analyses"
  ON public.energy_analyses FOR SELECT
  USING (
    auth.uid() = user_id 
    OR (workspace_id IS NOT NULL AND has_workspace_access(workspace_id, auth.uid()))
  );

CREATE POLICY "Public can view shared energy analyses"
  ON public.energy_analyses FOR SELECT
  USING (
    is_shared = true 
    AND (share_expires_at IS NULL OR share_expires_at > now())
  );

CREATE POLICY "Users can insert own or workspace energy analyses"
  ON public.energy_analyses FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND (workspace_id IS NULL OR has_workspace_access(workspace_id, auth.uid(), 'editor'))
  );

CREATE POLICY "Users can update own or workspace energy analyses"
  ON public.energy_analyses FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR (workspace_id IS NOT NULL AND has_workspace_access(workspace_id, auth.uid(), 'editor'))
  );

CREATE POLICY "Users can delete own or workspace admin can delete"
  ON public.energy_analyses FOR DELETE
  USING (
    auth.uid() = user_id 
    OR (workspace_id IS NOT NULL AND has_workspace_access(workspace_id, auth.uid(), 'admin'))
  );

-- Indexes
CREATE INDEX idx_energy_analyses_user_id ON public.energy_analyses(user_id);
CREATE INDEX idx_energy_analyses_workspace_id ON public.energy_analyses(workspace_id);
CREATE INDEX idx_energy_analyses_property_id ON public.energy_analyses(property_id);
CREATE INDEX idx_energy_analyses_share_token ON public.energy_analyses(share_token) WHERE share_token IS NOT NULL;

-- Updated at trigger
CREATE TRIGGER update_energy_analyses_updated_at
  BEFORE UPDATE ON public.energy_analyses
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();