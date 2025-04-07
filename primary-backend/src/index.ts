import express from "express";
import { userRouter } from "./routes/user";
import { zapRouter } from "./routes/zap";
import cors from "cors";
import { actionRouter } from "./routes/action";
import { triggerRouter } from "./routes/trigger";
import { flowRouter } from "./routes/flow";
const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/v1/user", userRouter);
app.use("/api/v1/zap", zapRouter);
app.use("/api/v1/trigger",triggerRouter);
app.use("/api/v1/action",actionRouter);
app.use("/api/v1/flow",flowRouter)

app.listen(3000, () => console.log("Running"));
