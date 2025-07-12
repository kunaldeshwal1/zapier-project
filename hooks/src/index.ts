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
    // store in db a new trigger
    await prismaClient.$transaction(async (tx) => {
      const action = await tx.action.findFirst({
        where: {
          zapId: zapId
        }
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
