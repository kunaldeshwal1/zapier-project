import axios from "axios";
import express from "express";

const app = express();
app.use(express.json());
const DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1392918280586661939/xV8UVmrVrSLuFs86xd8TvoKcV2GlnPVpQe2gAfaMnyRvbNOlQztLoqc9F1QCcxr8DuTN";

app.post("/github-to-discord", async (req, res) => {
  try {
    const payload = req.body;
    const repo = payload.repository?.name;
    const pusher = payload.pusher?.name;
    const commit = payload.head_commit;

    const message = commit
      ? `🟢 **New commit** in \`${repo}\`: \n\n**${commit.message}**\nby ${pusher}\n<${commit.url}>`
      : `New push to ${repo} by ${pusher}.`;

    await axios.post(DISCORD_WEBHOOK_URL, {
      content: message,
    });

    res.status(200).send("OK");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed");
  }
});

app.listen(3000, () => console.log("Listening on port 3000"));
