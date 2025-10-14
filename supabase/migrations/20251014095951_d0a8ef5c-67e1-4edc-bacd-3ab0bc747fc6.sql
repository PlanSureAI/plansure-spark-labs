-- Create storage bucket for compliance documents
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'compliance-documents',
  'compliance-documents',
  false,
  20971520, -- 20MB limit
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Storage policies for compliance documents
create policy "Users can view own compliance documents"
on storage.objects for select
using (
  bucket_id = 'compliance-documents' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can upload own compliance documents"
on storage.objects for insert
with check (
  bucket_id = 'compliance-documents' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update own compliance documents"
on storage.objects for update
using (
  bucket_id = 'compliance-documents' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete own compliance documents"
on storage.objects for delete
using (
  bucket_id = 'compliance-documents' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Add document_url column to compliance_tracking for storing uploaded document references
alter table public.compliance_tracking 
add column document_urls text[];

-- Add audit trail columns
alter table public.compliance_tracking
add column last_updated_by uuid references auth.users(id),
add column change_history jsonb default '[]'::jsonb;