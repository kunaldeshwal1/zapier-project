import express from "express";
import { prismaClient } from "db";

const app = express();
app.use(express.json());
app.get("/", (req, res) => {
  res.json({
    message: "hello",
  });
});

app.post("/hooks/catch/:userId/:zapId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const zapId = req.params.zapId;
    const body = req.body;

    const githubEvent = req.headers["x-github-event"];
    const signature = req.headers["x-hub-signature-256"];

    // Check if it's a push event
    if (githubEvent === "push") {
      const payload = req.body;

      // Extract commit information
      const commits = payload.commits;
      const repository = payload.repository;
      const pusher = payload.pusher;

      console.log(`Push event received for ${repository.name}`);
      console.log(`Pushed by: ${pusher.name}`);
      console.log(`Number of commits: ${commits.length}`);
    }
    // store in db a new trigger
    await prismaClient.$transaction(async (tx) => {
      const action = await tx.action.findFirst({
        where: {
          zapId: zapId,
        },
      });

      // Then use its metadata in the ZapRun creation:
      const run = await tx.zapRun.create({
        data: {
          zapId: zapId,
          metadata: action?.metadata || {},
          message: body.message || "No message provided",
        },
      });

      await tx.zapRunOutbox.create({
        data: {
          zapRunId: run.id,
        },
      });
    });
    res.json({
      message: "Webhook received",
    });
  } catch (e) {
    console.log(e);
  }
});

app.listen(3002, () => console.log("Hooks running"));
