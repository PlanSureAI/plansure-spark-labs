-- Create function to log compliance tracking changes
CREATE OR REPLACE FUNCTION public.log_compliance_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  diff JSONB := '{}';
  audit_entry JSONB;
  changed BOOLEAN := false;
BEGIN
  -- Compare specific fields that matter for compliance audit
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    diff := diff || jsonb_build_object('status', jsonb_build_object('old', OLD.status, 'new', NEW.status));
    changed := true;
  END IF;
  
  IF OLD.last_audit_date IS DISTINCT FROM NEW.last_audit_date THEN
    diff := diff || jsonb_build_object('last_audit_date', jsonb_build_object('old', OLD.last_audit_date, 'new', NEW.last_audit_date));
    changed := true;
  END IF;
  
  IF OLD.next_deadline IS DISTINCT FROM NEW.next_deadline THEN
    diff := diff || jsonb_build_object('next_deadline', jsonb_build_object('old', OLD.next_deadline, 'new', NEW.next_deadline));
    changed := true;
  END IF;
  
  IF OLD.notes IS DISTINCT FROM NEW.notes THEN
    diff := diff || jsonb_build_object('notes', jsonb_build_object('old', OLD.notes, 'new', NEW.notes));
    changed := true;
  END IF;
  
  IF OLD.document_urls IS DISTINCT FROM NEW.document_urls THEN
    diff := diff || jsonb_build_object('document_urls', jsonb_build_object('old', OLD.document_urls, 'new', NEW.document_urls));
    changed := true;
  END IF;

  -- Only log if there was an actual change
  IF changed THEN
    audit_entry := jsonb_build_object(
      'changed_at', current_timestamp,
      'changed_by', auth.uid(),
      'changes', diff
    );
    
    -- Append to change history array
    NEW.change_history := COALESCE(NEW.change_history, '[]'::jsonb) || audit_entry;
    
    -- Update last_updated_by
    NEW.last_updated_by := auth.uid();
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on compliance_tracking table
DROP TRIGGER IF EXISTS compliance_tracking_audit ON public.compliance_tracking;
CREATE TRIGGER compliance_tracking_audit
  BEFORE UPDATE ON public.compliance_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.log_compliance_changes();

-- Add comment for documentation
COMMENT ON FUNCTION public.log_compliance_changes() IS 'Automatically logs all changes to compliance_tracking records with user ID and timestamp for audit compliance';