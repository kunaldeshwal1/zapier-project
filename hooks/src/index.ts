import express from "express";
import { prismaClient } from "db";
interface Commit {
  message: string;
}
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
    let message = "No message provided";

    if (body.head_commit && body.head_commit.message) {
      message = body.head_commit.message;
    } else if (body.commits && body.commits.length > 0) {
      const commitMessages = body.commits.map(
        (commit: Commit) => commit.message
      );
      message = commitMessages.join(" | ");
    } else if (body.message) {
      message = body.message;
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
          message: message,
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
      commitMessage: message,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

app.listen(3002, () => console.log("Hooks running"));
//
