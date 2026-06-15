CREATE TABLE IF NOT EXISTS platform_commission_rule_versions (
  id TEXT PRIMARY KEY,
  ruleName TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  commissionPercent REAL NOT NULL,
  ivaAppliesToCommission INTEGER NOT NULL DEFAULT 1,
  commissionBaseMode TEXT NOT NULL DEFAULT 'specialist_gross_document' CHECK (commissionBaseMode IN ('specialist_gross_document', 'specialist_net', 'customer_net_before_commission', 'manual')),
  minimumCommissionCLP INTEGER NOT NULL DEFAULT 0,
  maximumCommissionCLP INTEGER,
  appliesTo TEXT NOT NULL DEFAULT 'specialist_document_amount',
  active INTEGER NOT NULL DEFAULT 1,
  accountantReviewed INTEGER NOT NULL DEFAULT 0,
  metadataJson TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_platform_commission_rule_versions_name ON platform_commission_rule_versions (ruleName);
CREATE INDEX IF NOT EXISTS idx_platform_commission_rule_versions_active ON platform_commission_rule_versions (active, commissionBaseMode);

INSERT OR IGNORE INTO platform_commission_rule_versions (
  id,
  ruleName,
  label,
  description,
  commissionPercent,
  ivaAppliesToCommission,
  commissionBaseMode,
  minimumCommissionCLP,
  maximumCommissionCLP,
  appliesTo,
  active,
  accountantReviewed,
  metadataJson,
  createdAt,
  updatedAt
) VALUES (
  'platform_commission_standard_9_5_plus_iva',
  'standard_9_5_plus_iva',
  'Comision OficiosPro',
  'Financia tecnologia, operacion, soporte, CRM, pago protegido y gestion de plataforma.',
  0.095,
  1,
  'specialist_gross_document',
  0,
  NULL,
  'specialist_document_amount',
  1,
  0,
  '{"validation":"pending_accountant_sii","copy":"9,5% + IVA"}',
  datetime('now'),
  datetime('now')
);

INSERT OR IGNORE INTO platform_commission_rules (
  id,
  name,
  segment,
  platformFeePercent,
  paymentFeePercent,
  riskBufferPercent,
  fixedServiceFeeCLP,
  minimumMarginCLP,
  creditValueCLP,
  creditRoundingStep,
  active,
  accountantReviewed,
  createdAt,
  updatedAt
) VALUES (
  'platform_rule_standard_9_5_plus_iva',
  'standard_9_5_plus_iva',
  'default',
  0.095,
  0,
  0,
  0,
  0,
  1000,
  1,
  1,
  0,
  datetime('now'),
  datetime('now')
);

CREATE TABLE IF NOT EXISTS payout_commission_breakdowns (
  id TEXT PRIMARY KEY,
  payoutCalculationId TEXT,
  specialistId TEXT,
  serviceRequestId TEXT,
  ruleVersionId TEXT,
  platformCommissionBaseCLP INTEGER NOT NULL DEFAULT 0,
  platformCommissionRate REAL NOT NULL DEFAULT 0.095,
  platformCommissionNetCLP INTEGER NOT NULL DEFAULT 0,
  platformCommissionIvaCLP INTEGER NOT NULL DEFAULT 0,
  platformCommissionGrossCLP INTEGER NOT NULL DEFAULT 0,
  commissionBaseMode TEXT NOT NULL DEFAULT 'specialist_gross_document',
  customerGrossPriceCLP INTEGER NOT NULL DEFAULT 0,
  totalCreditsEstimate INTEGER NOT NULL DEFAULT 0,
  warningsJson TEXT,
  createdAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payout_commission_breakdowns_calc ON payout_commission_breakdowns (payoutCalculationId);
CREATE INDEX IF NOT EXISTS idx_payout_commission_breakdowns_specialist ON payout_commission_breakdowns (specialistId, createdAt);
CREATE INDEX IF NOT EXISTS idx_payout_commission_breakdowns_request ON payout_commission_breakdowns (serviceRequestId);
