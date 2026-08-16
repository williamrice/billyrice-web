-- CreateEnum
CREATE TYPE "MermaidDiagramVisibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "MermaidDiagramTheme" AS ENUM ('DEFAULT', 'BASE', 'DARK', 'FOREST', 'NEUTRAL');

-- CreateTable
CREATE TABLE "MermaidDiagram" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "theme" "MermaidDiagramTheme" NOT NULL DEFAULT 'DEFAULT',
    "visibility" "MermaidDiagramVisibility" NOT NULL DEFAULT 'PRIVATE',
    "currentRevision" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MermaidDiagram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MermaidDiagramRevision" (
    "id" TEXT NOT NULL,
    "diagramId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "theme" "MermaidDiagramTheme" NOT NULL,
    "visibility" "MermaidDiagramVisibility" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MermaidDiagramRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MermaidDiagramSlugRedirect" (
    "slug" TEXT NOT NULL,
    "diagramId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MermaidDiagramSlugRedirect_pkey" PRIMARY KEY ("slug")
);

-- CreateIndex
CREATE UNIQUE INDEX "MermaidDiagram_slug_key" ON "MermaidDiagram"("slug");
CREATE INDEX "MermaidDiagram_ownerId_updatedAt_idx" ON "MermaidDiagram"("ownerId", "updatedAt" DESC);
CREATE INDEX "MermaidDiagram_visibility_updatedAt_idx" ON "MermaidDiagram"("visibility", "updatedAt" DESC);
CREATE UNIQUE INDEX "MermaidDiagramRevision_diagramId_version_key" ON "MermaidDiagramRevision"("diagramId", "version");
CREATE INDEX "MermaidDiagramRevision_diagramId_createdAt_idx" ON "MermaidDiagramRevision"("diagramId", "createdAt" DESC);
CREATE INDEX "MermaidDiagramSlugRedirect_diagramId_idx" ON "MermaidDiagramSlugRedirect"("diagramId");

-- AddForeignKey
ALTER TABLE "MermaidDiagram" ADD CONSTRAINT "MermaidDiagram_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MermaidDiagramRevision" ADD CONSTRAINT "MermaidDiagramRevision_diagramId_fkey" FOREIGN KEY ("diagramId") REFERENCES "MermaidDiagram"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MermaidDiagramSlugRedirect" ADD CONSTRAINT "MermaidDiagramSlugRedirect_diagramId_fkey" FOREIGN KEY ("diagramId") REFERENCES "MermaidDiagram"("id") ON DELETE CASCADE ON UPDATE CASCADE;
