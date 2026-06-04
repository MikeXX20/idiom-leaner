import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApiRouter } from "./routes";

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use(
    "/api",
    createApiRouter({
      generateIdioms: async () => ({
        idioms: [
          {
            phrase: "on the same wavelength",
            meaning: "thinking similarly",
            topics: ["Work and Careers"],
            formality: "neutral",
            riskLevel: "low",
            example: "The team stayed on the same wavelength.",
            usageWarning: "Use for people or teams."
          }
        ]
      }),
      reviewRecording: async () => ({
        feedback: {
          naturalUsage: ["The idiom sounded natural."],
          forcedUsage: [],
          betterAlternatives: [],
          improvedSampleSentence: "Our team stayed on the same wavelength during the project.",
          nextStep: "Keep using one idiom per answer.",
          transcript: "Our team stayed on the same wavelength."
        }
      }),
      reviewText: async () => ({
        feedback: {
          naturalUsage: ["The typed answer used the idiom naturally."],
          forcedUsage: [],
          betterAlternatives: [],
          improvedSampleSentence: "Our team stayed on the same wavelength during the project.",
          nextStep: "Add one concrete detail after the idiom.",
          transcript: "Our team stayed on the same wavelength."
        }
      })
    })
  );
  return app;
}

describe("api routes", () => {
  it("generates idioms", async () => {
    const response = await request(createTestApp())
      .post("/api/idioms/generate")
      .send({ topic: "Work and Careers", ieltsPart: "Part 3" })
      .expect(200);

    expect(response.body.idioms[0].phrase).toBe("on the same wavelength");
  });

  it("rejects feedback requests without audio", async () => {
    const response = await request(createTestApp())
      .post("/api/feedback")
      .field("topic", "Work and Careers")
      .expect(400);

    expect(response.body.error).toBe("Recording file is required.");
  });

  it("returns feedback for uploaded audio", async () => {
    const response = await request(createTestApp())
      .post("/api/feedback")
      .field("ieltsPart", "Part 2")
      .field("topic", "Work and Careers")
      .field("prompt", "Describe a project.")
      .field("selectedIdioms", JSON.stringify(["on the same wavelength"]))
      .attach("recording", Buffer.from("audio"), {
        filename: "answer.webm",
        contentType: "audio/webm"
      })
      .expect(200);

    expect(response.body.feedback.naturalUsage).toEqual(["The idiom sounded natural."]);
  });

  it("rejects text feedback requests without an answer", async () => {
    const response = await request(createTestApp())
      .post("/api/feedback/text")
      .send({ topic: "Work and Careers", ieltsPart: "Part 2" })
      .expect(400);

    expect(response.body.error).toBe("Answer text is required.");
  });

  it("returns feedback for a typed answer", async () => {
    const response = await request(createTestApp())
      .post("/api/feedback/text")
      .send({
        answerText: "Our team stayed on the same wavelength.",
        ieltsPart: "Part 2",
        topic: "Work and Careers",
        prompt: "Describe a project.",
        selectedIdioms: ["on the same wavelength"]
      })
      .expect(200);

    expect(response.body.feedback.nextStep).toBe("Add one concrete detail after the idiom.");
  });
});
