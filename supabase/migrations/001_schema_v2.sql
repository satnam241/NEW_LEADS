-- ============================================================
-- LeadFlow CRM v2 — Full Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────
-- DROP OLD TABLE IF UPGRADING FROM V1
-- ─────────────────────────────────────────
DROP TABLE IF EXISTS leads CASCADE;

-- ─────────────────────────────────────────
-- LEADS TABLE
-- ─────────────────────────────────────────
CREATE TABLE leads (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  source        TEXT NOT NULL DEFAULT 'Meta Ads'
                  CHECK (source IN ('Meta Ads','Manual','Imported')),
  status        TEXT NOT NULL DEFAULT 'New'
                  CHECK (status IN ('New','Contacted','Interested','Closed','Lost')),
  note          TEXT DEFAULT '',
  assigned_to   TEXT DEFAULT '',
  -- Follow-up fields
  followup_date DATE,
  followup_note TEXT DEFAULT '',
  followup_done BOOLEAN DEFAULT FALSE,
  -- Contact info
  whatsapp      TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- FOLLOW-UP HISTORY (every follow-up logged)
-- ─────────────────────────────────────────
CREATE TABLE followups (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id     UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  note        TEXT DEFAULT '',
  done        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- AUTO UPDATE updated_at
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────
CREATE INDEX idx_leads_status      ON leads(status);
CREATE INDEX idx_leads_source      ON leads(source);
CREATE INDEX idx_leads_created_at  ON leads(created_at DESC);
CREATE INDEX idx_leads_followup    ON leads(followup_date);
CREATE INDEX idx_followups_lead_id ON followups(lead_id);
CREATE INDEX idx_followups_date    ON followups(date);

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────
ALTER TABLE leads     ENABLE ROW LEVEL SECURITY;
ALTER TABLE followups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on leads"     ON leads     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on followups" ON followups FOR ALL USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────
-- SEED DATA
-- ─────────────────────────────────────────
INSERT INTO leads (name, email, phone, whatsapp, source, status, note, followup_date, followup_note) VALUES
('Aarav Sharma',    'aarav@gmail.com',    '+91 98765 43210', '+91 98765 43210', 'Meta Ads', 'Interested', 'Wants premium plan', CURRENT_DATE + 1,  'Call to confirm demo'),
('Priya Patel',     'priya@company.in',   '+91 87654 32109', '+91 87654 32109', 'Meta Ads', 'Contacted',  'Sent brochure',      CURRENT_DATE,      'Follow up on brochure'),
('Rohan Mehta',     'rohan@outlook.com',  '+91 76543 21098', '+91 76543 21098', 'Manual',   'New',        '',                   NULL,              ''),
('Ananya Singh',    'ananya@yahoo.com',   '+91 65432 10987', '+91 65432 10987', 'Meta Ads', 'Closed',     'Signed up Pro',      NULL,              ''),
('Vikram Nair',     'vikram@gmail.com',   '+91 54321 09876', '+91 54321 09876', 'Imported', 'Interested', 'High intent',        CURRENT_DATE - 1, 'MISSED - reschedule'),
('Deepa Iyer',      'deepa@company.in',   '+91 43210 98765', '+91 43210 98765', 'Meta Ads', 'Contacted',  'Intro call done',    CURRENT_DATE + 3,  'Send pricing'),
('Arjun Gupta',     'arjun@hotmail.com',  '+91 32109 87654', '+91 32109 87654', 'Manual',   'Lost',       'No budget',          NULL,              ''),
('Sneha Joshi',     'sneha@gmail.com',    '+91 21098 76543', '+91 21098 76543', 'Meta Ads', 'Interested', 'Wants team plan',    CURRENT_DATE + 2,  'Share team pricing'),
('Kabir Khan',      'kabir@outlook.com',  '+91 10987 65432', '+91 10987 65432', 'Meta Ads', 'New',        '',                   NULL,              ''),
('Neha Agarwal',    'neha@gmail.com',     '+91 98760 12345', '+91 98760 12345', 'Imported', 'Closed',     'Annual plan',        NULL,              '');
