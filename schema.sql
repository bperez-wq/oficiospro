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

CREATE TABLE IF NOT EXISTS specialist_applications (
  id TEXT PRIMARY KEY,
  firstName TEXT,
  lastName TEXT,
  rut TEXT,
  email TEXT,
  whatsapp TEXT,
  region TEXT,
  comuna TEXT,
  address TEXT,
  serviceTypes TEXT,
  specialties TEXT,
  servicesOffered TEXT,
  priceMode TEXT,
  credits INTEGER,
  providerChargeCLP INTEGER,
  coverageRadiusKm INTEGER,
  referencesJson TEXT,
  portfolioJson TEXT,
  certificationsJson TEXT,
  payloadJson TEXT,
  source TEXT,
  leadSubmissionId TEXT,
  status TEXT DEFAULT 'pending',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS customer_leads (
  id TEXT PRIMARY KEY,
  firstName TEXT,
  lastName TEXT,
  rut TEXT,
  email TEXT,
  whatsapp TEXT,
  region TEXT,
  comuna TEXT,
  address TEXT,
  requestedService TEXT,
  comments TEXT,
  source TEXT,
  payloadJson TEXT,
  leadSubmissionId TEXT,
  status TEXT DEFAULT 'pending',
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS company_leads (
  id TEXT PRIMARY KEY,
  companyName TEXT,
  companyRut TEXT,
  contactFirstName TEXT,
  contactLastName TEXT,
  email TEXT,
  whatsapp TEXT,
  region TEXT,
  comuna TEXT,
  branches INTEGER,
  requestedServices TEXT,
  comments TEXT,
  payloadJson TEXT,
  leadSubmissionId TEXT,
  status TEXT DEFAULT 'pending',
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS service_requests (
  id TEXT PRIMARY KEY,
  customerName TEXT,
  customerEmail TEXT,
  customerWhatsapp TEXT,
  customerRut TEXT,
  comuna TEXT,
  specialistId TEXT,
  serviceId TEXT,
  serviceDescription TEXT,
  urgency TEXT,
  creditsEstimated INTEGER,
  comments TEXT,
  payloadJson TEXT,
  leadSubmissionId TEXT,
  status TEXT DEFAULT 'pending',
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS conversion_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  source TEXT,
  page TEXT,
  payloadJson TEXT,
  createdAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_specialist_applications_status ON specialist_applications (status);
CREATE INDEX IF NOT EXISTS idx_specialist_applications_createdAt ON specialist_applications (createdAt);
CREATE INDEX IF NOT EXISTS idx_specialist_applications_comuna ON specialist_applications (comuna);
CREATE INDEX IF NOT EXISTS idx_customer_leads_status ON customer_leads (status);
CREATE INDEX IF NOT EXISTS idx_customer_leads_createdAt ON customer_leads (createdAt);
CREATE INDEX IF NOT EXISTS idx_company_leads_status ON company_leads (status);
CREATE INDEX IF NOT EXISTS idx_company_leads_createdAt ON company_leads (createdAt);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests (status);
CREATE INDEX IF NOT EXISTS idx_service_requests_createdAt ON service_requests (createdAt);
CREATE INDEX IF NOT EXISTS idx_conversion_events_type ON conversion_events (type);
CREATE INDEX IF NOT EXISTS idx_conversion_events_createdAt ON conversion_events (createdAt);
