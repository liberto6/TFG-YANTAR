-- AlterTable: añade columna slug nullable, rellena con un valor por defecto, y luego la marca NOT NULL.
ALTER TABLE "branches" ADD COLUMN "slug" TEXT;

-- Backfill: para sedes existentes, derivar un slug a partir del id corto.
-- En BDs ya existentes esto deja un slug aceptable; el admin podrá editarlo.
UPDATE "branches" SET "slug" = LOWER(REGEXP_REPLACE(SUBSTRING(id, 1, 8), '[^a-z0-9]', '', 'g')) WHERE "slug" IS NULL;

ALTER TABLE "branches" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex: slug único por empresa.
CREATE UNIQUE INDEX "branches_company_id_slug_key" ON "branches"("company_id", "slug");
