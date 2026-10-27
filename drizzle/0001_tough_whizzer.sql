ALTER TABLE "workspace" ALTER COLUMN "id" SET DATA TYPE text;
UPDATE "workspace" SET "id" = 'password:jacob' WHERE "id" = '1';