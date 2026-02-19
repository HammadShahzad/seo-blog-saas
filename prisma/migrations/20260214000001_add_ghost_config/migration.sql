-- Add Ghost CMS config field
ALTER TABLE "Website" ADD COLUMN IF NOT EXISTS "ghostConfig" TEXT;

-- Add LinkedIn token field (if not exists)
ALTER TABLE "Website" ADD COLUMN IF NOT EXISTS "linkedinAccessToken" TEXT;
