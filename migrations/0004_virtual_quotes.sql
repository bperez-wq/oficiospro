CREATE TABLE IF NOT EXISTS virtual_quote_requests (
  id TEXT PRIMARY KEY,
  customerId TEXT,
  customerName TEXT,
  customerEmail TEXT,
  customerPhone TEXT,
  specialistId TEXT,
  specialistName TEXT,
  serviceId TEXT,
  cartItemId TEXT,
  categoryId TEXT,
  specialty TEXT,
  serviceName TEXT,
  problemTitle TEXT,
  description TEXT,
  locationDetail TEXT,
  commune TEXT,
  region TEXT,
  urgency TEXT,
  status TEXT NOT NULL DEFAULT 'pendiente_revision',
  attachmentCount INTEGER DEFAULT 0,
  videoReference TEXT,
  additionalComments TEXT,
  payloadJson TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_virtual_quote_requests_status ON virtual_quote_requests (status);
CREATE INDEX IF NOT EXISTS idx_virtual_quote_requests_specialist ON virtual_quote_requests (specialistId);
CREATE INDEX IF NOT EXISTS idx_virtual_quote_requests_commune ON virtual_quote_requests (commune);
CREATE INDEX IF NOT EXISTS idx_virtual_quote_requests_createdAt ON virtual_quote_requests (createdAt);

CREATE TABLE IF NOT EXISTS virtual_quote_attachments (
  id TEXT PRIMARY KEY,
  quoteRequestId TEXT NOT NULL,
  fileType TEXT,
  fileName TEXT,
  storageKey TEXT,
  publicUrl TEXT,
  signedUrlExpiresAt TEXT,
  status TEXT NOT NULL DEFAULT 'pending_secure_storage',
  createdAt TEXT NOT NULL,
  FOREIGN KEY (quoteRequestId) REFERENCES virtual_quote_requests(id)
);

CREATE INDEX IF NOT EXISTS idx_virtual_quote_attachments_quote ON virtual_quote_attachments (quoteRequestId);

CREATE TABLE IF NOT EXISTS virtual_quote_messages (
  id TEXT PRIMARY KEY,
  quoteRequestId TEXT NOT NULL,
  senderRole TEXT NOT NULL,
  senderId TEXT,
  message TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (quoteRequestId) REFERENCES virtual_quote_requests(id)
);

CREATE INDEX IF NOT EXISTS idx_virtual_quote_messages_quote ON virtual_quote_messages (quoteRequestId, createdAt);

CREATE TABLE IF NOT EXISTS virtual_quote_offers (
  id TEXT PRIMARY KEY,
  quoteRequestId TEXT NOT NULL,
  specialistId TEXT,
  pricingMode TEXT NOT NULL,
  creditPrice INTEGER DEFAULT 0,
  minCredits INTEGER DEFAULT 0,
  maxCredits INTEGER DEFAULT 0,
  estimatedDuration TEXT,
  materialsIncluded TEXT,
  materialsExcluded TEXT,
  conditions TEXT,
  requiresVisit INTEGER DEFAULT 0,
  comment TEXT,
  status TEXT NOT NULL DEFAULT 'cotizacion_enviada',
  expiresAt TEXT,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (quoteRequestId) REFERENCES virtual_quote_requests(id)
);

CREATE INDEX IF NOT EXISTS idx_virtual_quote_offers_quote ON virtual_quote_offers (quoteRequestId);
CREATE INDEX IF NOT EXISTS idx_virtual_quote_offers_status ON virtual_quote_offers (status);

ALTER TABLE service_requests ADD COLUMN quoteRequestId TEXT;
CREATE INDEX IF NOT EXISTS idx_service_requests_quoteRequestId ON service_requests (quoteRequestId);
