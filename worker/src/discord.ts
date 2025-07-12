import axios from "axios";
import express from "express";

const app = express();
app.use(express.json());
const DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1392918280586661939/xV8UVmrVrSLuFs86xd8TvoKcV2GlnPVpQe2gAfaMnyRvbNOlQztLoqc9F1QCcxr8DuTN";

export async function sendDiscordMessage(webhookUrl: string, message: string) {
  await axios.post(webhookUrl, {
    content: message,
  });
}