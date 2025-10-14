-- Add sharing functionality to investment_analyses
ALTER TABLE investment_analyses 
ADD COLUMN share_token TEXT UNIQUE,
ADD COLUMN is_shared BOOLEAN DEFAULT false,
ADD COLUMN shared_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN share_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster share token lookups
CREATE INDEX idx_investment_analyses_share_token ON investment_analyses(share_token) 
WHERE share_token IS NOT NULL;

-- Function to generate secure share tokens
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  token TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate random token
    token := encode(gen_random_bytes(32), 'base64');
    token := replace(token, '/', '_');
    token := replace(token, '+', '-');
    token := replace(token, '=', '');
    
    -- Check if token already exists
    SELECT EXISTS(SELECT 1 FROM investment_analyses WHERE share_token = token) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN token;
END;
$$;

-- Add RLS policy for public access to shared analyses
CREATE POLICY "Public can view shared analyses"
ON investment_analyses
FOR SELECT
USING (
  is_shared = true 
  AND (share_expires_at IS NULL OR share_expires_at > now())
);