-- Backup leads table for failed captures from GetMyBizLoan.com
CREATE TABLE IF NOT EXISTS backup_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_data JSONB NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced_to_bizops BOOLEAN DEFAULT FALSE,
  synced_at TIMESTAMPTZ,
  notes TEXT
);

-- Index for finding unsynced leads
CREATE INDEX IF NOT EXISTS idx_backup_leads_unsynced ON backup_leads(synced_to_bizops) WHERE synced_to_bizops = FALSE;

-- Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_backup_leads_created_at ON backup_leads(created_at DESC);

-- Enable RLS
ALTER TABLE backup_leads ENABLE ROW LEVEL SECURITY;

-- Policy for service role access
CREATE POLICY "Service role can manage backup_leads" ON backup_leads
  FOR ALL
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE backup_leads IS 'Backup storage for leads that failed to sync to BizOps. Used by GetMyBizLoan.com lead capture.';
