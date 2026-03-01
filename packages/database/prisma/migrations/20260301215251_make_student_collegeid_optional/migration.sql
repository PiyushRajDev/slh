-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_collegeId_fkey";

-- DropIndex
DROP INDEX "Student_collegeId_rollNumber_key";

-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "collegeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE SET NULL ON UPDATE CASCADE;
