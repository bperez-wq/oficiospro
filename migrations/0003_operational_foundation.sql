CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('customer', 'specialist', 'company', 'admin')),
  email TEXT,
  phone TEXT,
  rut TEXT,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  authProvider TEXT,
  authSubject TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users (role, status);
CREATE INDEX IF NOT EXISTS idx_users_auth_subject ON users (authProvider, authSubject);

CREATE TABLE IF NOT EXISTS specialist_profiles (
  id TEXT PRIMARY KEY,
  userId TEXT,
  slug TEXT NOT NULL,
  displayName TEXT NOT NULL,
  legalName TEXT,
  rut TEXT,
  primaryTrade TEXT,
  bio TEXT,
  profileImage TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'published', 'suspended', 'rejected')),
  verificationStatus TEXT NOT NULL DEFAULT 'pending',
  taxProfileStatus TEXT NOT NULL DEFAULT 'pending',
  baseRegion TEXT,
  baseCommune TEXT,
  coverageRadiusKm INTEGER DEFAULT 0,
  sourceApplicationId TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_specialist_profiles_slug ON specialist_profiles (slug);
CREATE INDEX IF NOT EXISTS idx_specialist_profiles_status ON specialist_profiles (status);
CREATE INDEX IF NOT EXISTS idx_specialist_profiles_commune ON specialist_profiles (baseCommune);
CREATE INDEX IF NOT EXISTS idx_specialist_profiles_region ON specialist_profiles (baseRegion);

CREATE TABLE IF NOT EXISTS specialist_services (
  id TEXT PRIMARY KEY,
  specialistId TEXT NOT NULL,
  categoryId TEXT,
  specialty TEXT,
  serviceName TEXT NOT NULL,
  description TEXT,
  pricingMode TEXT,
  creditPrice INTEGER DEFAULT 0,
  minCredits INTEGER DEFAULT 0,
  maxCredits INTEGER DEFAULT 0,
  hourlyCredits INTEGER DEFAULT 0,
  visitCredits INTEGER DEFAULT 0,
  emergencyCredits INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  reviewStatus TEXT NOT NULL DEFAULT 'pending_review',
  createdAt TEXT NOT NULL,
  updatedAt TEXT,
  FOREIGN KEY (specialistId) REFERENCES specialist_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_specialist_services_specialist ON specialist_services (specialistId);
CREATE INDEX IF NOT EXISTS idx_specialist_services_category ON specialist_services (categoryId);
CREATE INDEX IF NOT EXISTS idx_specialist_services_specialty ON specialist_services (specialty);
CREATE INDEX IF NOT EXISTS idx_specialist_services_active ON specialist_services (active, reviewStatus);

CREATE TABLE IF NOT EXISTS credit_wallets (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  availableCredits INTEGER NOT NULL DEFAULT 0,
  reservedCredits INTEGER NOT NULL DEFAULT 0,
  expiringCredits INTEGER NOT NULL DEFAULT 0,
  lifetimePurchased INTEGER NOT NULL DEFAULT 0,
  lifetimeUsed INTEGER NOT NULL DEFAULT 0,
  updatedAt TEXT NOT NULL,
  UNIQUE (userId),
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS credit_ledger_entries (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  userRole TEXT,
  type TEXT NOT NULL,
  amountCredits INTEGER NOT NULL,
  balanceAfter INTEGER NOT NULL DEFAULT 0,
  relatedPaymentId TEXT,
  relatedServiceRequestId TEXT,
  description TEXT,
  idempotencyKey TEXT,
  createdAt TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_ledger_idempotency ON credit_ledger_entries (idempotencyKey);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_user ON credit_ledger_entries (userId, createdAt);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_payment ON credit_ledger_entries (relatedPaymentId);

CREATE TABLE IF NOT EXISTS payment_intents (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  externalPaymentId TEXT,
  userId TEXT,
  userRole TEXT,
  amountCLP INTEGER NOT NULL DEFAULT 0,
  credits INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'CLP',
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  idempotencyKey TEXT,
  metadataJson TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_intents_idempotency ON payment_intents (idempotencyKey);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents (status);
CREATE INDEX IF NOT EXISTS idx_payment_intents_provider_external ON payment_intents (provider, externalPaymentId);

CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  providerEventId TEXT NOT NULL,
  topic TEXT,
  dataId TEXT,
  verified INTEGER DEFAULT 0,
  duplicate INTEGER DEFAULT 0,
  processed INTEGER DEFAULT 0,
  payloadJson TEXT,
  receivedAt TEXT NOT NULL,
  processedAt TEXT,
  UNIQUE (provider, providerEventId)
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_received ON webhook_events (receivedAt);
CREATE INDEX IF NOT EXISTS idx_webhook_events_data ON webhook_events (provider, dataId);

CREATE TABLE IF NOT EXISTS specialist_payouts (
  id TEXT PRIMARY KEY,
  specialistId TEXT NOT NULL,
  serviceRequestId TEXT,
  paymentIntentId TEXT,
  customerCredits INTEGER NOT NULL DEFAULT 0,
  customerChargeCLP INTEGER NOT NULL DEFAULT 0,
  specialistPayoutCLP INTEGER NOT NULL DEFAULT 0,
  platformMarginCLP INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  taxDocumentId TEXT,
  createdAt TEXT NOT NULL,
  approvedAt TEXT,
  paidAt TEXT
);

CREATE INDEX IF NOT EXISTS idx_specialist_payouts_status ON specialist_payouts (status);
CREATE INDEX IF NOT EXISTS idx_specialist_payouts_specialist ON specialist_payouts (specialistId);

CREATE TABLE IF NOT EXISTS tax_documents (
  id TEXT PRIMARY KEY,
  issuerType TEXT NOT NULL,
  issuerId TEXT,
  recipientType TEXT NOT NULL,
  recipientId TEXT,
  documentType TEXT NOT NULL,
  documentNumber TEXT,
  amountCLP INTEGER NOT NULL DEFAULT 0,
  taxAmountCLP INTEGER DEFAULT 0,
  relatedPaymentId TEXT,
  relatedPayoutId TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  metadataJson TEXT,
  issuedAt TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tax_documents_status ON tax_documents (status);
CREATE INDEX IF NOT EXISTS idx_tax_documents_payment ON tax_documents (relatedPaymentId);

CREATE TABLE IF NOT EXISTS company_accounts (
  id TEXT PRIMARY KEY,
  userId TEXT,
  companyName TEXT NOT NULL,
  rut TEXT,
  contactName TEXT,
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  billingEmail TEXT,
  billingAddress TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_company_accounts_status ON company_accounts (status);
CREATE INDEX IF NOT EXISTS idx_company_accounts_rut ON company_accounts (rut);

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id TEXT PRIMARY KEY,
  adminId TEXT,
  action TEXT NOT NULL,
  entityType TEXT NOT NULL,
  entityId TEXT,
  beforeJson TEXT,
  afterJson TEXT,
  ip TEXT,
  userAgent TEXT,
  createdAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_entity ON admin_audit_log (entityType, entityId);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON admin_audit_log (createdAt);

CREATE TABLE IF NOT EXISTS email_delivery_log (
  id TEXT PRIMARY KEY,
  template TEXT NOT NULL,
  recipient TEXT,
  relatedEntityType TEXT,
  relatedEntityId TEXT,
  provider TEXT NOT NULL DEFAULT 'resend',
  status TEXT NOT NULL,
  error TEXT,
  createdAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_email_delivery_entity ON email_delivery_log (relatedEntityType, relatedEntityId);
CREATE INDEX IF NOT EXISTS idx_email_delivery_status ON email_delivery_log (status);

CREATE TABLE IF NOT EXISTS rate_limit_events (
  id TEXT PRIMARY KEY,
  scope TEXT NOT NULL,
  keyHash TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  limited INTEGER NOT NULL DEFAULT 0,
  windowResetAt TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_scope ON rate_limit_events (scope, createdAt);

CREATE TABLE IF NOT EXISTS operational_notes (
  id TEXT PRIMARY KEY,
  entityType TEXT NOT NULL,
  entityId TEXT NOT NULL,
  authorId TEXT,
  note TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_operational_notes_entity ON operational_notes (entityType, entityId, createdAt);
