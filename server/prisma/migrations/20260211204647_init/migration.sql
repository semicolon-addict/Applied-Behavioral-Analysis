-- CreateTable
CREATE TABLE "QuestionnaireTemplate" (
    "id" TEXT NOT NULL,
    "assessmentType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionnaireTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "templateId" TEXT NOT NULL,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "responseType" TEXT NOT NULL DEFAULT 'dropdown',
    "options" TEXT[],
    "sortOrder" INTEGER NOT NULL,
    "domainId" TEXT NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionnaireSession" (
    "id" TEXT NOT NULL,
    "assessmentType" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "respondentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in-progress',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionnaireSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Response" (
    "id" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Response_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuestionnaireTemplate_assessmentType_key" ON "QuestionnaireTemplate"("assessmentType");

-- CreateIndex
CREATE INDEX "Domain_templateId_idx" ON "Domain"("templateId");

-- CreateIndex
CREATE INDEX "Question_domainId_idx" ON "Question"("domainId");

-- CreateIndex
CREATE INDEX "QuestionnaireSession_childId_idx" ON "QuestionnaireSession"("childId");

-- CreateIndex
CREATE INDEX "QuestionnaireSession_assessmentType_idx" ON "QuestionnaireSession"("assessmentType");

-- CreateIndex
CREATE INDEX "Response_sessionId_idx" ON "Response"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Response_sessionId_questionId_key" ON "Response"("sessionId", "questionId");

-- AddForeignKey
ALTER TABLE "Domain" ADD CONSTRAINT "Domain_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "QuestionnaireTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "QuestionnaireSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
