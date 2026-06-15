-- Tax document authorization and anti-factoring controls.
-- Safe for D1: creates new tables/indexes only.

CREATE TABLE IF NOT EXISTS authorized_document_requests (
  id TEXT PRIMARY KEY,
  authorization_code TEXT NOT NULL UNIQUE,
  specialist_id TEXT NOT NULL,
  service_request_id TEXT,
  payout_id TEXT,
  issuer_rut TEXT NOT NULL,
  issuer_legal_name TEXT,
  receiver_rut TEXT NOT NULL,
  document_type TEXT NOT NULL,
  amount_clp INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'authorized',
  reason TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT,
  invalidated_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS received_tax_documents (
  id TEXT PRIMARY KEY,
  authorization_code TEXT,
  authorized_document_request_id TEXT,
  specialist_id TEXT,
  service_request_id TEXT,
  payout_id TEXT,
  issuer_rut TEXT NOT NULL,
  issuer_legal_name TEXT,
  receiver_rut TEXT NOT NULL,
  document_type TEXT NOT NULL,
  folio TEXT NOT NULL,
  amount_clp INTEGER NOT NULL DEFAULT 0,
  issued_at TEXT,
  received_at TEXT NOT NULL DEFAULT (datetime('now')),
  source TEXT,
  is_test INTEGER NOT NULL DEFAULT 0,
  test_run_id TEXT,
  sii_status TEXT NOT NULL DEFAULT 'pending_manual_check',
  assignment_status TEXT NOT NULL DEFAULT 'unknown',
  assignment_provider_reference TEXT,
  review_status TEXT NOT NULL DEFAULT 'received',
  payout_blocked INTEGER NOT NULL DEFAULT 1,
  claim_reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (authorized_document_request_id) REFERENCES authorized_document_requests(id)
);

CREATE TABLE IF NOT EXISTS factoring_risk_alerts (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  authorized_document_request_id TEXT,
  severity TEXT NOT NULL,
  reason TEXT NOT NULL,
  detail TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  block_payout INTEGER NOT NULL DEFAULT 1,
  crm_task_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  reviewed_at TEXT,
  resolved_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (document_id) REFERENCES received_tax_documents(id),
  FOREIGN KEY (authorized_document_request_id) REFERENCES authorized_document_requests(id)
);

CREATE TABLE IF NOT EXISTS supplier_document_policies (
  id TEXT PRIMARY KEY,
  specialist_id TEXT,
  documents_require_authorization INTEGER NOT NULL DEFAULT 1,
  assignment_requires_written_approval INTEGER NOT NULL DEFAULT 1,
  allow_factoring INTEGER NOT NULL DEFAULT 0,
  accepted_receiver_rut TEXT NOT NULL,
  amount_tolerance_clp INTEGER NOT NULL DEFAULT 1000,
  allowed_document_types_json TEXT NOT NULL DEFAULT '["boleta_honorarios","factura_afecta","factura_exenta"]',
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_by TEXT NOT NULL DEFAULT 'system',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_authorized_docs_specialist
  ON authorized_document_requests (specialist_id, status);

CREATE INDEX IF NOT EXISTS idx_authorized_docs_service
  ON authorized_document_requests (service_request_id, payout_id);

CREATE INDEX IF NOT EXISTS idx_received_docs_auth_code
  ON received_tax_documents (authorization_code);

CREATE INDEX IF NOT EXISTS idx_received_docs_unique_lookup
  ON received_tax_documents (issuer_rut, document_type, folio);

CREATE INDEX IF NOT EXISTS idx_received_docs_specialist
  ON received_tax_documents (specialist_id, review_status);

CREATE INDEX IF NOT EXISTS idx_factoring_alerts_status
  ON factoring_risk_alerts (status, severity);

CREATE INDEX IF NOT EXISTS idx_supplier_doc_policies_specialist
  ON supplier_document_policies (specialist_id, status);
