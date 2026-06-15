CREATE TABLE IF NOT EXISTS specialist_tax_profiles (
  id TEXT PRIMARY KEY,
  specialistId TEXT NOT NULL,
  userId TEXT,
  legalName TEXT,
  rut TEXT,
  taxType TEXT NOT NULL DEFAULT 'unknown' CHECK (taxType IN ('factura_afecta', 'boleta_honorarios', 'factura_exenta', 'unknown')),
  siiActivity TEXT,
  ivaStatus TEXT NOT NULL DEFAULT 'por_definir' CHECK (ivaStatus IN ('afecto', 'exento', 'no_aplica', 'por_definir')),
  canIssueFeeReceipt INTEGER NOT NULL DEFAULT 0,
  canIssueInvoice INTEGER NOT NULL DEFAULT 0,
  accountantReviewed INTEGER NOT NULL DEFAULT 0,
  siiValidated INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'collecting_data' CHECK (status IN ('not_started', 'collecting_data', 'pending_secure_storage', 'pending_accountant_review', 'pending_sii_validation', 'verified', 'blocked')),
  metadataJson TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_specialist_tax_profiles_specialist ON specialist_tax_profiles (specialistId);
CREATE INDEX IF NOT EXISTS idx_specialist_tax_profiles_status ON specialist_tax_profiles (status);
CREATE INDEX IF NOT EXISTS idx_specialist_tax_profiles_tax_type ON specialist_tax_profiles (taxType);

CREATE TABLE IF NOT EXISTS specialist_document_capabilities (
  id TEXT PRIMARY KEY,
  specialistId TEXT NOT NULL,
  documentType TEXT NOT NULL CHECK (documentType IN ('factura_afecta', 'boleta_honorarios', 'factura_exenta')),
  declaredCanIssue INTEGER NOT NULL DEFAULT 0,
  verifiedCanIssue INTEGER NOT NULL DEFAULT 0,
  validationSource TEXT,
  validatedAt TEXT,
  notes TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_specialist_document_capabilities_unique ON specialist_document_capabilities (specialistId, documentType);
CREATE INDEX IF NOT EXISTS idx_specialist_document_capabilities_verified ON specialist_document_capabilities (verifiedCanIssue, documentType);

CREATE TABLE IF NOT EXISTS specialist_payout_preferences (
  id TEXT PRIMARY KEY,
  specialistId TEXT NOT NULL,
  bankName TEXT,
  accountType TEXT,
  accountNumberLast4 TEXT,
  holderName TEXT,
  holderRut TEXT,
  privateStorageStatus TEXT NOT NULL DEFAULT 'pending_secure_storage' CHECK (privateStorageStatus IN ('pending_secure_storage', 'stored_private', 'not_submitted')),
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'verified', 'rejected')),
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_specialist_payout_preferences_specialist ON specialist_payout_preferences (specialistId);
CREATE INDEX IF NOT EXISTS idx_specialist_payout_preferences_status ON specialist_payout_preferences (status);

CREATE TABLE IF NOT EXISTS platform_commission_rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  segment TEXT NOT NULL DEFAULT 'default',
  platformFeePercent REAL NOT NULL,
  paymentFeePercent REAL NOT NULL,
  riskBufferPercent REAL NOT NULL,
  fixedServiceFeeCLP INTEGER NOT NULL DEFAULT 0,
  minimumMarginCLP INTEGER NOT NULL DEFAULT 0,
  creditValueCLP INTEGER NOT NULL DEFAULT 1000,
  creditRoundingStep INTEGER NOT NULL DEFAULT 1,
  active INTEGER NOT NULL DEFAULT 1,
  accountantReviewed INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_platform_commission_rules_segment_active ON platform_commission_rules (segment, active);

CREATE TABLE IF NOT EXISTS payout_calculations (
  id TEXT PRIMARY KEY,
  specialistId TEXT,
  serviceRequestId TEXT,
  ruleId TEXT,
  taxConfigId TEXT NOT NULL,
  taxType TEXT NOT NULL,
  specialistTargetAmountCLP INTEGER NOT NULL DEFAULT 0,
  specialistDocumentGrossCLP INTEGER NOT NULL DEFAULT 0,
  specialistDocumentNetCLP INTEGER NOT NULL DEFAULT 0,
  ivaAmountCLP INTEGER NOT NULL DEFAULT 0,
  withholdingAmountCLP INTEGER NOT NULL DEFAULT 0,
  specialistLiquidPayoutCLP INTEGER NOT NULL DEFAULT 0,
  platformCommissionCLP INTEGER NOT NULL DEFAULT 0,
  customerChargeCLP INTEGER NOT NULL DEFAULT 0,
  customerCredits INTEGER NOT NULL DEFAULT 0,
  marginCLP INTEGER NOT NULL DEFAULT 0,
  payoutAllowed INTEGER NOT NULL DEFAULT 0,
  blockReasonsJson TEXT,
  warningsJson TEXT,
  createdAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payout_calculations_specialist ON payout_calculations (specialistId, createdAt);
CREATE INDEX IF NOT EXISTS idx_payout_calculations_request ON payout_calculations (serviceRequestId);
CREATE INDEX IF NOT EXISTS idx_payout_calculations_allowed ON payout_calculations (payoutAllowed, createdAt);

CREATE TABLE IF NOT EXISTS tax_document_requests (
  id TEXT PRIMARY KEY,
  specialistId TEXT NOT NULL,
  payoutCalculationId TEXT,
  payoutId TEXT,
  documentType TEXT NOT NULL,
  receiverLegalName TEXT NOT NULL DEFAULT 'OP SpA',
  receiverRut TEXT,
  amountCLP INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'pending_secure_storage', 'received', 'validated', 'rejected', 'cancelled')),
  secureStorageStatus TEXT NOT NULL DEFAULT 'pending_secure_storage' CHECK (secureStorageStatus IN ('pending_secure_storage', 'stored_private', 'not_submitted')),
  externalProvider TEXT,
  externalDocumentId TEXT,
  metadataJson TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tax_document_requests_specialist ON tax_document_requests (specialistId, status);
CREATE INDEX IF NOT EXISTS idx_tax_document_requests_payout ON tax_document_requests (payoutId);
CREATE INDEX IF NOT EXISTS idx_tax_document_requests_status ON tax_document_requests (status, createdAt);

CREATE TABLE IF NOT EXISTS tax_guidance_steps (
  id TEXT PRIMARY KEY,
  specialistId TEXT NOT NULL,
  stepKey TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped', 'blocked')),
  completedAt TEXT,
  metadataJson TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tax_guidance_steps_unique ON tax_guidance_steps (specialistId, stepKey);
CREATE INDEX IF NOT EXISTS idx_tax_guidance_steps_status ON tax_guidance_steps (status, createdAt);

CREATE TABLE IF NOT EXISTS specialist_formalization_tasks (
  id TEXT PRIMARY KEY,
  specialistId TEXT NOT NULL,
  taskType TEXT NOT NULL CHECK (taskType IN ('collect_tax_profile', 'validate_sii', 'validate_bank_account', 'collect_document', 'accountant_review', 'manual_review')),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('alta', 'media', 'baja')),
  assignedTo TEXT,
  dueAt TEXT,
  completedAt TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_specialist_formalization_tasks_status ON specialist_formalization_tasks (status, dueAt);
CREATE INDEX IF NOT EXISTS idx_specialist_formalization_tasks_specialist ON specialist_formalization_tasks (specialistId, status);

CREATE TABLE IF NOT EXISTS payout_blocks (
  id TEXT PRIMARY KEY,
  specialistId TEXT NOT NULL,
  payoutId TEXT,
  payoutCalculationId TEXT,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'waived')),
  resolvedBy TEXT,
  resolvedAt TEXT,
  createdAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payout_blocks_specialist_status ON payout_blocks (specialistId, status);
CREATE INDEX IF NOT EXISTS idx_payout_blocks_payout ON payout_blocks (payoutId);
