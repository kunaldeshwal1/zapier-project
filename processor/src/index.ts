import { prismaClient } from "db";
import { Kafka } from "kafkajs";
const TOPIC_NAME = "test-topic";
const kafka = new Kafka({
  clientId: "outbox-processor",
  brokers: ["localhost:9092"],
});

const run = async () => {
  const producer = kafka.producer();
  await producer.connect();

  while (1) {
    // Count records first to avoid unnecessary processing
    const count = await prismaClient.zapRunOutbox.count();

    if (count === 0) {
      console.log("No pending messages in outbox. Waiting...");
      await new Promise((x) => setTimeout(x, 5000)); // Wait longer when empty
      continue;
    }

    const pendingRows = await prismaClient.zapRunOutbox.findMany({
      where: {},
      take: 10,
    });

    if (pendingRows.length === 0) {
      console.log("No pending messages found. Waiting...");
      await new Promise((x) => setTimeout(x, 3000));
      continue;
    }

    console.log(`Found ${pendingRows.length} messages to process`);
    const messages = pendingRows.map((r) => {
      const value = JSON.stringify({ zapRunId: r.zapRunId, stage: 0 });
      console.log("Sending message:", value);
      return { value };
    });

    await producer.send({
      topic: TOPIC_NAME,
      messages,
    });

    await prismaClient.zapRunOutbox.deleteMany({
      where: {
        id: { in: pendingRows.map((r) => r.id) },
      },
    });
    console.log("deleted resource");

    await new Promise((x) => setTimeout(x, 3000));
  }
};

// Add graceful shutdown handling
process.on("SIGTERM", async () => {
  console.log("Received SIGTERM. Cleaning up...");
  await prismaClient.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("Received SIGINT. Cleaning up...");
  await prismaClient.$disconnect();
  process.exit(0);
});

run().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
