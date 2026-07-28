-- Career positions are ordered chronologically. A null end date represents a
-- current role and sorts ahead of completed roles.
DROP INDEX "CareerPosition_profileId_sortOrder_idx";

ALTER TABLE "CareerPosition" DROP COLUMN "sortOrder";

CREATE INDEX "CareerPosition_profileId_endDate_startDate_idx"
ON "CareerPosition"("profileId", "endDate", "startDate");

UPDATE "ProfessionalProfile"
SET "headline" = 'Software engineer, architect, and technical leader'
WHERE "headline" = 'Software engineer, applied AI implementer, and technical leader';
