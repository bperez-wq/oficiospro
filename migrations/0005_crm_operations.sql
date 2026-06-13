CREATE TABLE IF NOT EXISTS crm_contacts (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  rut TEXT,
  contactType TEXT NOT NULL DEFAULT 'customer' CHECK (contactType IN ('customer', 'specialist', 'company_contact', 'admin_created')),
  source TEXT,
  commune TEXT,
  region TEXT,
  addressSummary TEXT,
  tags TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_crm_contacts_type_status ON crm_contacts (contactType, status);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON crm_contacts (email);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_phone ON crm_contacts (phone);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_commune ON crm_contacts (commune);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_created ON crm_contacts (createdAt);

CREATE TABLE IF NOT EXISTS crm_companies (
  id TEXT PRIMARY KEY,
  companyName TEXT NOT NULL,
  rut TEXT,
  industry TEXT,
  contactName TEXT,
  email TEXT,
  phone TEXT,
  commune TEXT,
  region TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  source TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_crm_companies_status ON crm_companies (status);
CREATE INDEX IF NOT EXISTS idx_crm_companies_rut ON crm_companies (rut);
CREATE INDEX IF NOT EXISTS idx_crm_companies_commune ON crm_companies (commune);

CREATE TABLE IF NOT EXISTS crm_opportunities (
  id TEXT PRIMARY KEY,
  contactId TEXT,
  companyId TEXT,
  specialistId TEXT,
  serviceRequestId TEXT,
  virtualQuoteId TEXT,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('customer_request', 'company_request', 'club_hogar', 'specialist_onboarding', 'payment_issue', 'quote_followup')),
  pipeline TEXT NOT NULL,
  stage TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'media',
  estimatedCredits INTEGER DEFAULT 0,
  estimatedAmountCLP INTEGER DEFAULT 0,
  assignedTo TEXT,
  nextActionAt TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  sourceEntityType TEXT,
  sourceEntityId TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (contactId) REFERENCES crm_contacts(id),
  FOREIGN KEY (companyId) REFERENCES crm_companies(id)
);

CREATE INDEX IF NOT EXISTS idx_crm_opportunities_pipeline_stage ON crm_opportunities (pipeline, stage);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_status ON crm_opportunities (status);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_type ON crm_opportunities (type);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_assigned ON crm_opportunities (assignedTo);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_next_action ON crm_opportunities (nextActionAt);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_source ON crm_opportunities (sourceEntityType, sourceEntityId);

CREATE TABLE IF NOT EXISTS crm_tasks (
  id TEXT PRIMARY KEY,
  opportunityId TEXT,
  contactId TEXT,
  specialistId TEXT,
  title TEXT NOT NULL,
  description TEXT,
  taskType TEXT NOT NULL DEFAULT 'followup' CHECK (taskType IN ('call', 'whatsapp', 'email', 'review', 'approve', 'collect_docs', 'followup', 'payment_check', 'quote_review')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'media',
  assignedTo TEXT,
  dueAt TEXT,
  completedAt TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (opportunityId) REFERENCES crm_opportunities(id),
  FOREIGN KEY (contactId) REFERENCES crm_contacts(id)
);

CREATE INDEX IF NOT EXISTS idx_crm_tasks_status_due ON crm_tasks (status, dueAt);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_opportunity ON crm_tasks (opportunityId);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_assigned ON crm_tasks (assignedTo);

CREATE TABLE IF NOT EXISTS crm_notes (
  id TEXT PRIMARY KEY,
  entityType TEXT NOT NULL,
  entityId TEXT NOT NULL,
  author TEXT,
  body TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'internal' CHECK (visibility IN ('internal')),
  createdAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_crm_notes_entity ON crm_notes (entityType, entityId, createdAt);

CREATE TABLE IF NOT EXISTS crm_activity_log (
  id TEXT PRIMARY KEY,
  entityType TEXT NOT NULL,
  entityId TEXT NOT NULL,
  action TEXT NOT NULL,
  actor TEXT,
  metadataJson TEXT,
  createdAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_crm_activity_entity ON crm_activity_log (entityType, entityId, createdAt);
CREATE INDEX IF NOT EXISTS idx_crm_activity_action ON crm_activity_log (action, createdAt);

CREATE TABLE IF NOT EXISTS crm_status_history (
  id TEXT PRIMARY KEY,
  entityType TEXT NOT NULL,
  entityId TEXT NOT NULL,
  fromStatus TEXT,
  toStatus TEXT,
  reason TEXT,
  actor TEXT,
  createdAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_crm_status_history_entity ON crm_status_history (entityType, entityId, createdAt);

CREATE TABLE IF NOT EXISTS crm_tags (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  color TEXT,
  createdAt TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_tags_label ON crm_tags (label);

CREATE TABLE IF NOT EXISTS crm_entity_tags (
  id TEXT PRIMARY KEY,
  entityType TEXT NOT NULL,
  entityId TEXT NOT NULL,
  tagId TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (tagId) REFERENCES crm_tags(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_entity_tags_unique ON crm_entity_tags (entityType, entityId, tagId);

CREATE TABLE IF NOT EXISTS crm_saved_views (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  entityType TEXT NOT NULL,
  filtersJson TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

INSERT OR IGNORE INTO crm_saved_views (id, name, entityType, filtersJson, createdAt, updatedAt) VALUES
  ('crm_view_new_leads', 'Leads nuevos', 'opportunity', '{"pipeline":"clientes","stage":"nuevo","status":"open"}', datetime('now'), datetime('now')),
  ('crm_view_pending_specialists', 'Especialistas pendientes', 'opportunity', '{"pipeline":"especialistas","status":"open"}', datetime('now'), datetime('now')),
  ('crm_view_pending_virtual_quotes', 'Cotizaciones pendientes', 'opportunity', '{"pipeline":"cotizaciones_virtuales","status":"open"}', datetime('now'), datetime('now')),
  ('crm_view_payment_issues', 'Pagos con problema', 'opportunity', '{"pipeline":"pagos_creditos","status":"open"}', datetime('now'), datetime('now')),
  ('crm_view_interested_companies', 'Empresas interesadas', 'opportunity', '{"pipeline":"empresas","status":"open"}', datetime('now'), datetime('now')),
  ('crm_view_overdue_tasks', 'Tareas vencidas', 'task', '{"status":"pending","due":"overdue"}', datetime('now'), datetime('now'));
