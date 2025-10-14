-- Create investment analyses table
CREATE TABLE public.investment_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  
  -- Input parameters
  purchase_price DECIMAL(15,2) NOT NULL,
  down_payment_percent DECIMAL(5,2) NOT NULL,
  loan_interest_rate DECIMAL(5,2) NOT NULL,
  loan_term_years INTEGER NOT NULL,
  annual_rental_income DECIMAL(15,2) NOT NULL,
  vacancy_rate DECIMAL(5,2) NOT NULL DEFAULT 5.0,
  annual_operating_expenses DECIMAL(15,2) NOT NULL,
  annual_property_appreciation DECIMAL(5,2) NOT NULL DEFAULT 3.0,
  holding_period_years INTEGER NOT NULL DEFAULT 5,
  
  -- Calculated ROI metrics
  irr DECIMAL(10,4),
  npv DECIMAL(15,2),
  cap_rate DECIMAL(10,4),
  cash_on_cash_return DECIMAL(10,4),
  payback_period_years DECIMAL(10,2),
  
  -- AI insights
  risk_score INTEGER CHECK (risk_score >= 1 AND risk_score <= 100),
  ai_summary TEXT,
  ai_recommendations TEXT,
  market_conditions JSONB,
  
  -- Scenario analysis
  scenarios JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.investment_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own analyses"
ON public.investment_analyses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses"
ON public.investment_analyses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses"
ON public.investment_analyses FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses"
ON public.investment_analyses FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_investment_analyses_updated_at
BEFORE UPDATE ON public.investment_analyses
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();