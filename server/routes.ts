import { mkdirSync } from "node:fs";
import { Router } from "express";
import multer from "multer";
import type { IeltsPart } from "../src/domain/types";
import type { AiService } from "./types";

mkdirSync("tmp/uploads", { recursive: true });

const upload = multer({ dest: "tmp/uploads" });

export function createApiRouter(aiService: AiService) {
  const router = Router();

  router.post("/idioms/generate", async (req, res) => {
    try {
      const { topic, ieltsPart } = req.body as { topic?: string; ieltsPart?: string };

      if (!topic || !ieltsPart) {
        res.status(400).json({ error: "Topic and IELTS part are required." });
        return;
      }

      const result = await aiService.generateIdioms({
        topic,
        ieltsPart: ieltsPart as IeltsPart
      });
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Idiom generation failed." });
    }
  });

  router.post("/feedback", upload.single("recording"), async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "Recording file is required." });
        return;
      }

      const selectedIdioms = JSON.parse(String(req.body.selectedIdioms ?? "[]")) as string[];
      const result = await aiService.reviewRecording({
        filePath: req.file.path,
        mimeType: req.file.mimetype,
        ieltsPart: req.body.ieltsPart,
        topic: req.body.topic,
        prompt: req.body.prompt,
        selectedIdioms
      });

      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Feedback failed." });
    }
  });

  router.post("/feedback/text", async (req, res) => {
    try {
      const {
        answerText,
        ieltsPart,
        topic,
        prompt,
        selectedIdioms = []
      } = req.body as {
        answerText?: string;
        ieltsPart?: IeltsPart;
        topic?: string;
        prompt?: string;
        selectedIdioms?: string[];
      };

      if (!answerText?.trim()) {
        res.status(400).json({ error: "Answer text is required." });
        return;
      }

      const result = await aiService.reviewText({
        answerText: answerText.trim(),
        ieltsPart: ieltsPart as IeltsPart,
        topic: topic ?? "",
        prompt: prompt ?? "",
        selectedIdioms
      });

      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Feedback failed." });
    }
  });

  return router;
}
