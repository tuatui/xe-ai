-- CreateIndex
CREATE INDEX "Topic_authorId_updateTime_idx" ON "Topic"("authorId", "updateTime" DESC);
