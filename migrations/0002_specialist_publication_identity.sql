ALTER TABLE specialist_applications ADD COLUMN slug TEXT;
ALTER TABLE specialist_applications ADD COLUMN publicationStatus TEXT DEFAULT 'pending_review';
ALTER TABLE specialist_applications ADD COLUMN identityVerificationJson TEXT;
ALTER TABLE specialist_applications ADD COLUMN approvedAt TEXT;
ALTER TABLE specialist_applications ADD COLUMN publishedAt TEXT;
ALTER TABLE specialist_applications ADD COLUMN unpublishedAt TEXT;
ALTER TABLE specialist_applications ADD COLUMN suspendedAt TEXT;
ALTER TABLE specialist_applications ADD COLUMN deletedAt TEXT;

CREATE INDEX IF NOT EXISTS idx_specialist_applications_slug ON specialist_applications (slug);
CREATE INDEX IF NOT EXISTS idx_specialist_applications_publicationStatus ON specialist_applications (publicationStatus);
