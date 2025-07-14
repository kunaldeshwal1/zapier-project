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

    // Extract commit message from GitHub push webhook
    let message = "No message provided";

    // Check if this is a GitHub push event
    if (body.head_commit && body.head_commit.message) {
      message = body.head_commit.message;
    }
    // If there are multiple commits, you might want to get all of them
    else if (body.commits && body.commits.length > 0) {
      // Get all commit messages
      const commitMessages = body.commits.map((commit: any) => commit.message);
      message = commitMessages.join(" | "); // Join multiple commits with separator

      // Or just get the first commit
      // message = body.commits[0].message;
    }
    // Fallback for other webhook types that might have message at root
    else if (body.message) {
      message = body.message;
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
          message: message, // Now using the extracted commit message
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
      commitMessage: message, // Optionally return it in response for debugging
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

app.listen(3002, () => console.log("Hooks running"));
