-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('Present', 'Absent', 'Half_Day', 'Late', 'Leave');

-- CreateTable
CREATE TABLE "Attendance" (
    "attendance_id" BIGSERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "attendance_date" DATE NOT NULL,
    "mark_in" TIME,
    "mark_out" TIME,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'Absent',
    "approval_status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("attendance_id")
);

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
