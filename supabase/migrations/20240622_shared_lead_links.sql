-- Shared lead links table for buyer access
CREATE TABLE IF NOT EXISTS shared_lead_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  lead_ids UUID[] NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shared_lead_links_token ON shared_lead_links(token);
CREATE INDEX IF NOT EXISTS idx_shared_lead_links_expires ON shared_lead_links(expires_at);

-- Enable RLS
ALTER TABLE shared_lead_links ENABLE ROW LEVEL SECURITY;

-- Service role can manage
CREATE POLICY "Service role can manage shared_lead_links" ON shared_lead_links
  FOR ALL
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE shared_lead_links IS 'Temporary share links for lead buyers to access leads without login';
