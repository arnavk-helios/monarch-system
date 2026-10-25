-- CreateTable
CREATE TABLE "Cheer" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "userAchievementId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cheer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Cheer_userAchievementId_idx" ON "Cheer"("userAchievementId");

-- CreateIndex
CREATE UNIQUE INDEX "Cheer_fromUserId_userAchievementId_key" ON "Cheer"("fromUserId", "userAchievementId");

-- AddForeignKey
ALTER TABLE "Cheer" ADD CONSTRAINT "Cheer_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cheer" ADD CONSTRAINT "Cheer_userAchievementId_fkey" FOREIGN KEY ("userAchievementId") REFERENCES "UserAchievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
