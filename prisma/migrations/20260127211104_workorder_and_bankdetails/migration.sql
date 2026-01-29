-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('FullValue', 'UBR', 'P2');

-- CreateTable
CREATE TABLE "WorkDetails" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "caustomerName" TEXT NOT NULL,
    "PhoneNumber" INTEGER NOT NULL,
    "Address" TEXT,
    "BuildingId" TEXT NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL,
    "PaymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "ServiceType" "ServiceType" NOT NULL DEFAULT 'FullValue',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankDetails" (
    "id" SERIAL NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "ifscCode" TEXT NOT NULL,
    "accountHolder" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "BankDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BankDetails_accountNumber_key" ON "BankDetails"("accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "BankDetails_userId_key" ON "BankDetails"("userId");

-- AddForeignKey
ALTER TABLE "WorkDetails" ADD CONSTRAINT "WorkDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankDetails" ADD CONSTRAINT "BankDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
