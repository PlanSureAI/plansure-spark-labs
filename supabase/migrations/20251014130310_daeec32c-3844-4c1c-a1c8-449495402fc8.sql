-- Sustainability Certifications and Scoring
CREATE TABLE public.sustainability_certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID NOT NULL REFERENCES energy_analyses(id) ON DELETE CASCADE,
  certification_type VARCHAR NOT NULL, -- BREEAM, PassivHaus, Zero Carbon, LEED, etc.
  current_score INTEGER,
  target_score INTEGER,
  status VARCHAR DEFAULT 'in_progress', -- in_progress, achieved, expired
  awarded_date DATE,
  expiry_date DATE,
  assessment_data JSONB, -- detailed scoring breakdown
  improvement_recommendations JSONB, -- actionable steps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Smart Home Device Integrations
CREATE TABLE public.smart_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  device_type VARCHAR NOT NULL, -- smart_meter, battery, heat_pump, solar_inverter, etc.
  device_name VARCHAR NOT NULL,
  manufacturer VARCHAR,
  model VARCHAR,
  api_endpoint TEXT,
  api_credentials JSONB, -- encrypted credentials
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_status VARCHAR DEFAULT 'active', -- active, error, inactive
  real_time_data JSONB, -- latest readings
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Energy Data Streams from Smart Devices
CREATE TABLE public.energy_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL REFERENCES smart_devices(id) ON DELETE CASCADE,
  reading_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  energy_produced_kwh NUMERIC,
  energy_consumed_kwh NUMERIC,
  battery_charge_percent NUMERIC,
  grid_import_kwh NUMERIC,
  grid_export_kwh NUMERIC,
  carbon_intensity_g_per_kwh NUMERIC,
  cost_per_kwh NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Financial Models for Zero Bills Guarantees
CREATE TABLE public.financial_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID NOT NULL REFERENCES energy_analyses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  workspace_id UUID REFERENCES workspaces(id),
  model_name VARCHAR NOT NULL,
  guarantee_type VARCHAR, -- zero_bills, net_zero, carbon_negative
  contract_scenarios JSONB, -- utility contracts, feed-in tariffs
  government_incentives JSONB, -- grants, tax credits
  cash_flow_projections JSONB, -- monthly/yearly projections
  payback_analysis JSONB,
  risk_assessment JSONB, -- market risks, technology risks
  utility_partner VARCHAR, -- Octopus Energy, etc.
  simulation_results JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Activity Logs and Audit Trails
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workspace_id UUID REFERENCES workspaces(id),
  entity_type VARCHAR NOT NULL, -- energy_analysis, financial_model, certification, etc.
  entity_id UUID NOT NULL,
  action VARCHAR NOT NULL, -- view, edit, create, delete, share, export
  action_details JSONB, -- what changed, annotations added, etc.
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- User Notifications and Alerts
CREATE TABLE public.user_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_type VARCHAR NOT NULL, -- maintenance_due, warranty_expiry, anomaly_detected, milestone_achieved
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR DEFAULT 'info', -- info, warning, critical
  entity_type VARCHAR, -- device, property, analysis
  entity_id UUID,
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Partnership and Pilot Programs
CREATE TABLE public.partnerships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  partner_type VARCHAR NOT NULL, -- utility, government, certification_body, research
  partner_name VARCHAR NOT NULL,
  partnership_status VARCHAR DEFAULT 'pending', -- pending, active, completed, terminated
  data_sharing_enabled BOOLEAN DEFAULT FALSE,
  api_integration_details JSONB,
  contract_terms JSONB,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.sustainability_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sustainability_certifications
CREATE POLICY "Users can view certifications for their analyses"
  ON public.sustainability_certifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM energy_analyses
      WHERE energy_analyses.id = sustainability_certifications.analysis_id
      AND (energy_analyses.user_id = auth.uid() 
           OR (energy_analyses.workspace_id IS NOT NULL 
               AND has_workspace_access(energy_analyses.workspace_id, auth.uid())))
    )
  );

CREATE POLICY "Users can insert certifications for their analyses"
  ON public.sustainability_certifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM energy_analyses
      WHERE energy_analyses.id = sustainability_certifications.analysis_id
      AND (energy_analyses.user_id = auth.uid() 
           OR (energy_analyses.workspace_id IS NOT NULL 
               AND has_workspace_access(energy_analyses.workspace_id, auth.uid(), 'editor'::workspace_role)))
    )
  );

CREATE POLICY "Users can update certifications for their analyses"
  ON public.sustainability_certifications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM energy_analyses
      WHERE energy_analyses.id = sustainability_certifications.analysis_id
      AND (energy_analyses.user_id = auth.uid() 
           OR (energy_analyses.workspace_id IS NOT NULL 
               AND has_workspace_access(energy_analyses.workspace_id, auth.uid(), 'editor'::workspace_role)))
    )
  );

-- RLS Policies for smart_devices
CREATE POLICY "Users can view own devices"
  ON public.smart_devices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own devices"
  ON public.smart_devices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own devices"
  ON public.smart_devices FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own devices"
  ON public.smart_devices FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for energy_readings
CREATE POLICY "Users can view readings for their devices"
  ON public.energy_readings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM smart_devices
      WHERE smart_devices.id = energy_readings.device_id
      AND smart_devices.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert readings"
  ON public.energy_readings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM smart_devices
      WHERE smart_devices.id = energy_readings.device_id
      AND smart_devices.user_id = auth.uid()
    )
  );

-- RLS Policies for financial_models
CREATE POLICY "Users can view own or workspace financial models"
  ON public.financial_models FOR SELECT
  USING (
    auth.uid() = user_id 
    OR (workspace_id IS NOT NULL AND has_workspace_access(workspace_id, auth.uid()))
  );

CREATE POLICY "Users can insert own or workspace financial models"
  ON public.financial_models FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND (workspace_id IS NULL OR has_workspace_access(workspace_id, auth.uid(), 'editor'::workspace_role))
  );

CREATE POLICY "Users can update own or workspace financial models"
  ON public.financial_models FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR (workspace_id IS NOT NULL AND has_workspace_access(workspace_id, auth.uid(), 'editor'::workspace_role))
  );

-- RLS Policies for activity_logs
CREATE POLICY "Users can view own activity logs"
  ON public.activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_notifications
CREATE POLICY "Users can view own notifications"
  ON public.user_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.user_notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.user_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for partnerships
CREATE POLICY "Workspace members can view partnerships"
  ON public.partnerships FOR SELECT
  USING (workspace_id IS NOT NULL AND has_workspace_access(workspace_id, auth.uid()));

CREATE POLICY "Workspace admins can manage partnerships"
  ON public.partnerships FOR ALL
  USING (workspace_id IS NOT NULL AND has_workspace_access(workspace_id, auth.uid(), 'admin'::workspace_role));

-- Indexes for performance
CREATE INDEX idx_certifications_analysis ON sustainability_certifications(analysis_id);
CREATE INDEX idx_smart_devices_property ON smart_devices(property_id);
CREATE INDEX idx_smart_devices_user ON smart_devices(user_id);
CREATE INDEX idx_energy_readings_device ON energy_readings(device_id);
CREATE INDEX idx_energy_readings_timestamp ON energy_readings(reading_timestamp);
CREATE INDEX idx_financial_models_analysis ON financial_models(analysis_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_notifications_user ON user_notifications(user_id, is_read);

-- Triggers for updated_at
CREATE TRIGGER update_certifications_updated_at
  BEFORE UPDATE ON public.sustainability_certifications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_smart_devices_updated_at
  BEFORE UPDATE ON public.smart_devices
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_financial_models_updated_at
  BEFORE UPDATE ON public.financial_models
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_partnerships_updated_at
  BEFORE UPDATE ON public.partnerships
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.energy_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.smart_devices;