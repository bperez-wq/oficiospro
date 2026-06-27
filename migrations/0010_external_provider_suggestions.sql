-- External provider discovery: captured suggestions / invites.
--
-- Stores ONLY operational metadata about external providers surfaced via the
-- discovery flow (Google Places / OSM / manual). It NEVER stores restricted
-- Places content (reviews, photos, phones, addresses). The ranking and live
-- preview are not persisted here; this table is the CRM-facing capture log.
--
-- PREPARED, NOT APPLIED. Apply with:
--   wrangler d1 migrations apply oficiospro-leads --remote
-- (run manually after review; do NOT auto-apply on deploy).

-- `source` is free text: 'osm' (default, OpenStreetMap open data),
-- 'community' / 'user_recommendation' (user recommended someone they trust),
-- or 'google_places' (optional, disabled by default).
-- Recommendation columns hold data a user VOLUNTEERS about a tradesperson they
-- vouch for; this is a normal referral lead (unlike map-discovery results, where
-- no personal content is stored).
CREATE TABLE IF NOT EXISTS external_provider_suggestions (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'osm',
  externalPlaceId TEXT,
  trade TEXT,
  commune TEXT,
  region TEXT,
  searchQuery TEXT,
  suggestedByUserId TEXT,
  recommendedName TEXT,
  recommendedContact TEXT,
  recommenderContact TEXT,
  reason TEXT,
  opportunityId TEXT,
  invitations INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'suggested'
    CHECK (status IN ('suggested', 'invited', 'contacted', 'claimed', 'rejected', 'archived')),
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- Dedupe map-discovery results by place id (invites increment `invitations`).
-- Plain unique index: SQLite treats NULLs as distinct, so user recommendations
-- without a place id are never collapsed, and ON CONFLICT(source, externalPlaceId)
-- upserts work for the map-discovery rows.
CREATE UNIQUE INDEX IF NOT EXISTS idx_external_provider_suggestions_place
  ON external_provider_suggestions (source, externalPlaceId);

CREATE INDEX IF NOT EXISTS idx_external_provider_suggestions_status
  ON external_provider_suggestions (status);
CREATE INDEX IF NOT EXISTS idx_external_provider_suggestions_trade_commune
  ON external_provider_suggestions (trade, commune);
CREATE INDEX IF NOT EXISTS idx_external_provider_suggestions_created
  ON external_provider_suggestions (createdAt);

-- CRM saved view for the external-offer pipeline (reuses crm_opportunities;
-- pipeline is free-text, so no CHECK change is required).
INSERT OR IGNORE INTO crm_saved_views (id, name, entityType, filtersJson, createdAt, updatedAt) VALUES
  ('crm_view_external_offers', 'Oferta externa (sugeridos)', 'opportunity', '{"pipeline":"oferta_externa","status":"open"}', datetime('now'), datetime('now'));
