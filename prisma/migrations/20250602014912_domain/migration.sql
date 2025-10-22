-- CreateTable
CREATE TABLE "DomainSelector" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "titleSelector" TEXT,
    "descriptionSelector" TEXT,
    "ingredientsSelector" TEXT,
    "instructionsSelector" TEXT,
    "prepTimeSelector" TEXT,
    "cookTimeSelector" TEXT,
    "servingsSelector" TEXT,
    "imageSelector" TEXT,
    "cuisineSelector" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DomainSelector_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DomainSelector_domain_key" ON "DomainSelector"("domain");
