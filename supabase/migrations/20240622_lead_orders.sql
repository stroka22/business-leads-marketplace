-- Lead orders table for marketplace purchases
CREATE TABLE IF NOT EXISTS lead_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  lead_ids UUID[] NOT NULL,
  subtotal_cents INTEGER NOT NULL,
  discount_rate DECIMAL(3,2) DEFAULT 0,
  total_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, refunded, cancelled
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_orders_buyer ON lead_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_lead_orders_status ON lead_orders(status);
CREATE INDEX IF NOT EXISTS idx_lead_orders_created ON lead_orders(created_at DESC);

-- Purchased leads tracking
CREATE TABLE IF NOT EXISTS purchased_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES lead_orders(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES financing_leads(id) ON DELETE SET NULL,
  price_cents INTEGER NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- optional exclusivity expiration
  UNIQUE(buyer_id, lead_id)
);

CREATE INDEX IF NOT EXISTS idx_purchased_leads_buyer ON purchased_leads(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchased_leads_lead ON purchased_leads(lead_id);

-- Enable RLS
ALTER TABLE lead_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchased_leads ENABLE ROW LEVEL SECURITY;

-- Buyers can see their own orders
CREATE POLICY "Buyers can view own orders" ON lead_orders
  FOR SELECT USING (buyer_id IN (
    SELECT id FROM profiles WHERE auth_user_id = auth.uid()
  ));

-- Buyers can see their own purchased leads  
CREATE POLICY "Buyers can view own purchased leads" ON purchased_leads
  FOR SELECT USING (buyer_id IN (
    SELECT id FROM profiles WHERE auth_user_id = auth.uid()
  ));

-- Service role can manage all
CREATE POLICY "Service role manages lead_orders" ON lead_orders
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role manages purchased_leads" ON purchased_leads
  FOR ALL USING (true) WITH CHECK (true);

COMMENT ON TABLE lead_orders IS 'Orders for lead purchases from marketplace';
COMMENT ON TABLE purchased_leads IS 'Individual lead purchase records with buyer access';
