import { useEffect, useMemo, useState } from "react";
import { generateIdioms, requestFeedback, type GeneratedIdiomPayload } from "../../api/aiClient";
import { starterPrompts } from "../../domain/starterContent";
import type { Idiom, SpeakingPrompt } from "../../domain/types";
import { listIdioms, saveIdiom, saveSession } from "../../storage/repositories";
import { useRecorder } from "./useRecorder";

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function now() {
  return new Date().toISOString();
}

function generatedToIdiom(payload: GeneratedIdiomPayload, topic: string): Idiom {
  const timestamp = now();
  return {
    id: createId("idiom"),
    phrase: payload.phrase,
    meaning: payload.meaning,
    topics: payload.topics.length ? payload.topics : [topic],
    formality: payload.formality,
    riskLevel: payload.riskLevel,
    example: payload.example,
    usageWarning: payload.usageWarning,
    source: "ai",
    confidence: "new",
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

function areAiFeaturesEnabled() {
  return import.meta.env.VITE_ENABLE_AI_FEATURES === "true";
}

export function PracticePage() {
  const [idioms, setIdioms] = useState<Idiom[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState(starterPrompts[0].id);
  const [selectedIdiomIds, setSelectedIdiomIds] = useState<string[]>([]);
  const [feedbackText, setFeedbackText] = useState("");
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const recorder = useRecorder();
  const aiFeaturesEnabled = areAiFeaturesEnabled();

  const prompt = useMemo<SpeakingPrompt>(
    () => starterPrompts.find((item) => item.id === selectedPromptId) ?? starterPrompts[0],
    [selectedPromptId]
  );

  useEffect(() => {
    listIdioms()
      .then(setIdioms)
      .catch(() => setMessage("Could not load idioms."));
  }, []);

  const topicIdioms = idioms.filter((idiom) => idiom.topics.includes(prompt.topic));
  const selectedIdioms = idioms.filter((idiom) => selectedIdiomIds.includes(idiom.id));

  function toggleIdiom(id: string) {
    setSelectedIdiomIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  async function handleGenerateIdioms() {
    setIsGenerating(true);
    setMessage("");
    try {
      const generated = await generateIdioms({
        topic: prompt.topic,
        ieltsPart: prompt.ieltsPart
      });
      const newIdioms = generated.map((item) => generatedToIdiom(item, prompt.topic));
      await Promise.all(newIdioms.map(saveIdiom));
      setIdioms(await listIdioms());
      setMessage(`Saved ${newIdioms.length} generated idioms.`);
    } catch {
      setMessage(
        "AI generation needs the API. The public demo already includes curated idioms for this topic."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleFeedback() {
    if (!recorder.recording) {
      setMessage("Record an answer before requesting feedback.");
      return;
    }

    setIsFeedbackLoading(true);
    setFeedbackText("");
    setMessage("");

    const sessionBase = {
      id: createId("session"),
      ieltsPart: prompt.ieltsPart,
      topic: prompt.topic,
      prompt: prompt.prompt,
      selectedIdiomIds,
      recordingBlob: recorder.recording.blob,
      recordingDuration: recorder.recording.duration,
      createdAt: now(),
      updatedAt: now()
    };

    try {
      const feedback = await requestFeedback({
        recordingBlob: recorder.recording.blob,
        ieltsPart: prompt.ieltsPart,
        topic: prompt.topic,
        prompt: prompt.prompt,
        selectedIdioms: selectedIdioms.map((idiom) => idiom.phrase)
      });
      await saveSession({
        ...sessionBase,
        feedbackStatus: "complete",
        feedback
      });
      setFeedbackText(feedback.nextStep);
      setMessage("Session saved with feedback.");
    } catch {
      await saveSession({
        ...sessionBase,
        feedbackStatus: "failed"
      });
      setMessage("Feedback failed. The recording was saved and can be reviewed later.");
    } finally {
      setIsFeedbackLoading(false);
    }
  }

  return (
    <section className="page-grid">
      <div className="practice-panel">
        <p className="eyebrow">Guided practice</p>
        <h1>Record an answer with 2-3 natural idioms.</h1>
        <label className="field">
          Prompt
          <select
            value={selectedPromptId}
            onChange={(event) => {
              setSelectedPromptId(event.target.value);
              setSelectedIdiomIds([]);
              setFeedbackText("");
            }}
          >
            {starterPrompts.map((item) => (
              <option key={item.id} value={item.id}>
                {item.topic} - {item.ieltsPart}
              </option>
            ))}
          </select>
        </label>
        <article className="prompt-card">
          <strong>{prompt.topic}</strong>
          <p>{prompt.prompt}</p>
        </article>
        <div className="button-row">
          {recorder.status !== "recording" ? (
            <button className="primary-button" onClick={recorder.start}>
              Start recording
            </button>
          ) : (
            <button className="danger-button" onClick={recorder.stop}>
              Stop recording
            </button>
          )}
          {aiFeaturesEnabled && (
            <button
              className="secondary-button"
              disabled={isFeedbackLoading}
              onClick={handleFeedback}
            >
              {isFeedbackLoading ? "Reviewing..." : "Get feedback"}
            </button>
          )}
        </div>
        {!aiFeaturesEnabled && (
          <p className="status">
            Public version uses the curated idiom deck. AI generation and feedback need a
            private API key.
          </p>
        )}
        {recorder.error && <p className="status error">{recorder.error}</p>}
        {recorder.recording && (
          <audio aria-label="Recorded answer playback" controls src={recorder.recording.url} />
        )}
        {message && <p className="status">{message}</p>}
        {feedbackText && <p className="feedback-box">{feedbackText}</p>}
      </div>

      <aside className="idiom-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Prep</p>
            <h2>Topic idioms</h2>
          </div>
          {aiFeaturesEnabled && (
            <button
              className="secondary-button"
              disabled={isGenerating}
              onClick={handleGenerateIdioms}
            >
              {isGenerating ? "Generating..." : "Generate"}
            </button>
          )}
        </div>
        <div className="idiom-list">
          {topicIdioms.map((idiom) => (
            <label key={idiom.id} className="idiom-choice">
              <input
                type="checkbox"
                checked={selectedIdiomIds.includes(idiom.id)}
                onChange={() => toggleIdiom(idiom.id)}
              />
              <span>
                <strong>{idiom.phrase}</strong>
                <small>{idiom.meaning}</small>
              </span>
            </label>
          ))}
        </div>
      </aside>
    </section>
  );
}
