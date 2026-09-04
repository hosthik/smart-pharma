/*
  Warnings:

  - A unique constraint covering the columns `[tinNumber]` on the table `Pharmacy` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Pharmacy" ADD COLUMN     "businessLicense" TEXT,
ADD COLUMN     "businessRegistration" TEXT,
ADD COLUMN     "ownerIdDocument" TEXT,
ADD COLUMN     "ownerIdNumber" TEXT,
ADD COLUMN     "pharmacyLicense" TEXT,
ADD COLUMN     "pharmacyPhoto" TEXT,
ADD COLUMN     "tinNumber" TEXT,
ADD COLUMN     "verificationReason" TEXT,
ADD COLUMN     "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "verifiedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Pharmacy_tinNumber_key" ON "Pharmacy"("tinNumber");
