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

    let message = "No message provided";

    // Extract message based on event type
    if (githubEvent === "push") {
      const commits = body.commits || [];

      if (commits.length > 0) {
        // Get the latest commit message
        message = commits[commits.length - 1].message;

        // OR get all commit messages
        // message = commits.map(c => c.message).join(', ');

        // OR get first commit message
        // message = commits[0].message;
      }

      console.log(`Extracted message: ${message}`);
    }

    await prismaClient.$transaction(async (tx) => {
      const action = await tx.action.findFirst({
        where: {
          zapId: zapId,
        },
      });

      const run = await tx.zapRun.create({
        data: {
          zapId: zapId,
          metadata: action?.metadata || {},
          message: message, // This will now have the commit message
        },
      });

      await tx.zapRunOutbox.create({
        data: {
          zapRunId: run.id,
        },
      });
    });

    res.status(200).json({
      message: "Webhook received",
    });
  } catch (e) {
    console.error("Error processing webhook:", e);
    res.status(500).json({
      message: "Error processing webhook",
    });
  }
});

app.listen(3002, () => console.log("Hooks running"));
