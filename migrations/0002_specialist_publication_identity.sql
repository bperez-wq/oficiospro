-- Las columnas de publicacion/identidad de specialist_applications
-- (slug, publicationStatus, identityVerificationJson, approvedAt, publishedAt,
-- unpublishedAt, suspendedAt, deletedAt) forman parte del CREATE TABLE en
-- 0001_leads.sql. Esta migracion solo conserva los indices (idempotentes); los
-- ALTER TABLE ADD COLUMN se eliminaron porque duplicaban columnas existentes y
-- rompian la aplicacion desde cero (duplicate column name: slug).
CREATE INDEX IF NOT EXISTS idx_specialist_applications_slug ON specialist_applications (slug);
CREATE INDEX IF NOT EXISTS idx_specialist_applications_publicationStatus ON specialist_applications (publicationStatus);
