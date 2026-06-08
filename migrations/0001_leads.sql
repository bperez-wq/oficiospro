CREATE TABLE IF NOT EXISTS lead_submissions (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  lead_type TEXT NOT NULL,
  status TEXT DEFAULT 'nuevo',
  priority TEXT DEFAULT 'normal',
  full_name TEXT,
  email TEXT,
  phone TEXT,
  company_name TEXT,
  applicant_type TEXT,
  service TEXT,
  trade TEXT,
  problem_description TEXT,
  urgency TEXT,
  region_code TEXT,
  region_name TEXT,
  commune_code TEXT,
  commune_name TEXT,
  specialist_id TEXT,
  specialist_name TEXT,
  requested_date TEXT,
  requested_time TEXT,
  credits_estimate INTEGER,
  source_page TEXT,
  source_component TEXT,
  source_button TEXT,
  utm_source TEXT,
  utm_campaign TEXT,
  utm_medium TEXT,
  referral_code TEXT,
  consent_contact INTEGER DEFAULT 0,
  consent_terms INTEGER DEFAULT 0,
  payload_json TEXT,
  user_agent TEXT,
  email_sent INTEGER DEFAULT 0,
  email_error TEXT
);

CREATE INDEX IF NOT EXISTS idx_lead_submissions_created_at ON lead_submissions (created_at);
CREATE INDEX IF NOT EXISTS idx_lead_submissions_lead_type ON lead_submissions (lead_type);
CREATE INDEX IF NOT EXISTS idx_lead_submissions_status ON lead_submissions (status);
CREATE INDEX IF NOT EXISTS idx_lead_submissions_commune_code ON lead_submissions (commune_code);
CREATE INDEX IF NOT EXISTS idx_lead_submissions_region_code ON lead_submissions (region_code);
CREATE INDEX IF NOT EXISTS idx_lead_submissions_phone ON lead_submissions (phone);
CREATE INDEX IF NOT EXISTS idx_lead_submissions_email ON lead_submissions (email);
