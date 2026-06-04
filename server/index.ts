import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { mkdirSync } from "node:fs";
import { createApiRouter } from "./routes";
import { openAiService } from "./openaiService";

dotenv.config();
mkdirSync("tmp/uploads", { recursive: true });

const app = express();
const port = Number(process.env.API_PORT ?? 8787);

app.use(cors({ origin: "http://127.0.0.1:5173" }));
app.use(express.json());
app.use("/api", createApiRouter(openAiService));

app.listen(port, "127.0.0.1", () => {
  console.log(`IELTS idioms API listening on http://127.0.0.1:${port}`);
});
