-- CreateTable
CREATE TABLE "Flow" (
    "id" TEXT NOT NULL,
    "node" JSONB NOT NULL,
    "edge" JSONB NOT NULL,

    CONSTRAINT "Flow_pkey" PRIMARY KEY ("id")
);
