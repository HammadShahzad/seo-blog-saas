-- Add Brand Intelligence fields to Website table
ALTER TABLE "Website" ADD COLUMN IF NOT EXISTS "uniqueValueProp" TEXT;
ALTER TABLE "Website" ADD COLUMN IF NOT EXISTS "competitors" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Website" ADD COLUMN IF NOT EXISTS "keyProducts" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Website" ADD COLUMN IF NOT EXISTS "targetLocation" TEXT;
