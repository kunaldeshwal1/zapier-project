
require("dotenv").config(); 
import { Kafka } from "kafkajs";
import { prismaClient } from "db";
import { JsonObject } from "@prisma/client/runtime/library";
import { sendEmail } from "./email";

const TOPIC_NAME = "test-topic";
const kafka = new Kafka({
  clientId: "outbox-processor",
  brokers: ["localhost:9092"],
});

async function processMessage(message: any, producer: any) {
  if (!message.value?.toString()) {
    return;
  }

  const parsedValue = JSON.parse(message.value?.toString());
  const zapRunId = parsedValue.zapRunId;
  const stage = parsedValue.stage;
  
  const zapRunDetails = await prismaClient.zapRun.findFirst({
    where: {
      id: zapRunId,
    },
    include: {
      zap: {
        include: {
          actions: {
            include: {
              type: true,
            },
          },
        },
      },
    },
  });
  if (!zapRunDetails) {
    console.log(`No zap run found for id: ${zapRunId}`);
    return;
  }

  const currentAction = zapRunDetails?.zap.actions.find(
    (x) => x.sortingOrder === stage
  );

  if (!currentAction) {
    console.log("No more actions to process");
    return;
  }

  // Process current action
  const zapRunMetadata = zapRunDetails?.metadata;
  
  if (currentAction.type.id === "email") {
    const metadata = zapRunMetadata as JsonObject;
    const to = metadata?.email as string || '';
    const body = metadata?.body as string;
    console.log(`email is sent to ${to}, body ${body}`)
    await sendEmail(to, body);
  }

  if (currentAction.type.id === "send-sol") {
    const metadata = zapRunMetadata as JsonObject;
    const commentObj = metadata?.comment as JsonObject;
    const amount = commentObj?.amount as string || '';
    const address = commentObj?.address as string || '';
    console.log(`Sending SOL: ${amount} to ${address}`);
  }

  // Check if there are more actions to process
  const lastStage = (zapRunDetails?.zap.actions?.length || 1) - 1;
  if (lastStage !== stage) {
    await producer.send({
      topic: TOPIC_NAME,
      messages: [
        {
          value: JSON.stringify({
            stage: stage + 1,
            zapRunId,
          }),
        },
      ],
    });
  }
}

const run = async () => {
  const consumer = kafka.consumer({ groupId: "zap-events-1" });
  const producer = kafka.producer();
  
  try {
    await consumer.connect();
    await producer.connect();
    console.log('Consumer and producer connected');

    await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true });

    await consumer.run({
      autoCommit: false,
      eachMessage: async ({ topic, partition, message }) => {
        console.log(`Processing message from offset: ${message.offset}`);
        
        await processMessage(message, producer);

        await consumer.commitOffsets([
          {
            topic,
            partition,
            offset: (parseInt(message.offset) + 1).toString(),
          },
        ]);
        
        console.log(`Completed processing message from offset: ${message.offset}`);
      },
    });
  } catch (error) {
    console.error('Error in worker:', error);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Cleaning up...');
  await prismaClient.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT. Cleaning up...');
  await prismaClient.$disconnect();
  process.exit(0);
});

run().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
