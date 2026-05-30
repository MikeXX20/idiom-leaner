import { useEffect, useMemo, useState } from "react";
import {
  buildReviewQueue,
  buildStudyStats,
  markIdiomReviewed,
  type ReviewMode,
  type ReviewResult
} from "../../domain/reviewScheduler";
import type { Idiom } from "../../domain/types";
import { listIdioms, saveIdiom } from "../../storage/repositories";

const topics = [
  "Work and Careers",
  "Education",
  "Technology",
  "Health",
  "Environment",
  "Travel",
  "Relationships",
  "Society"
];

export function RecitePage() {
  const [idioms, setIdioms] = useState<Idiom[]>([]);
  const [mode, setMode] = useState<ReviewMode>("daily");
  const [topic, setTopic] = useState(topics[0]);
  const [cardIndex, setCardIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [sentence, setSentence] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    listIdioms()
      .then(setIdioms)
      .catch(() => setMessage("Could not load reciting cards."));
  }, []);

  const queue = useMemo(
    () =>
      buildReviewQueue(idioms, {
        mode,
        topic,
        limit: 10
      }),
    [idioms, mode, topic]
  );
  const stats = useMemo(() => buildStudyStats(idioms), [idioms]);

  const current = queue[cardIndex];

  function resetCardState() {
    setIsRevealed(false);
    setSentence("");
  }

  function changeMode(nextMode: ReviewMode) {
    setMode(nextMode);
    setCardIndex(0);
    resetCardState();
  }

  async function handleMark(result: ReviewResult) {
    if (!current) {
      return;
    }

    setMessage("");
    try {
      const reviewed = markIdiomReviewed(current, result);
      await saveIdiom(reviewed);
      setIdioms((items) => items.map((item) => (item.id === reviewed.id ? reviewed : item)));
      setCardIndex((index) => Math.min(index + 1, Math.max(queue.length - 1, 0)));
      resetCardState();
    } catch {
      setMessage("Could not save review progress.");
    }
  }

  return (
    <section className="content-section recite-section">
      <p className="eyebrow">Active recall</p>
      <h1>Recite idioms</h1>

      <div className="study-stats" aria-label="Study snapshot">
        <article>
          <strong>{stats.due}</strong>
          <span>Due now</span>
        </article>
        <article>
          <strong>{stats.new}</strong>
          <span>New</span>
        </article>
        <article>
          <strong>{stats.weak}</strong>
          <span>Weak</span>
        </article>
        <article>
          <strong>{stats.confident}</strong>
          <span>Confident</span>
        </article>
      </div>

      <div className="segmented-control" role="group" aria-label="Recite mode">
        <button aria-current={mode === "daily"} onClick={() => changeMode("daily")}>
          Daily Review
        </button>
        <button aria-current={mode === "topic"} onClick={() => changeMode("topic")}>
          Topic Practice
        </button>
      </div>
      <p className="mode-help">
        Daily Review uses cards due today. Topic Practice ignores the schedule and drills one
        theme.
      </p>

      {mode === "topic" && (
        <label className="field">
          Topic
          <select
            value={topic}
            onChange={(event) => {
              setTopic(event.target.value);
              setCardIndex(0);
              resetCardState();
            }}
          >
            {topics.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      )}

      {!current && (
        <div className="empty-state">
          <strong>No due cards right now.</strong>
          <p>Switch to Topic Practice to drill a specific IELTS theme whenever you want.</p>
        </div>
      )}

      {current && (
        <article className="recite-card">
          <div className="tag-row">
            <span>{current.topics[0]}</span>
            <span>{current.difficulty}</span>
            <span>{current.ieltsSafety}</span>
          </div>
          <h2>{isRevealed ? current.phrase : "What idiom fits this meaning?"}</h2>
          <p>{current.meaning}</p>

          {!isRevealed ? (
            <button className="primary-button" onClick={() => setIsRevealed(true)}>
              Reveal idiom
            </button>
          ) : (
            <div className="recite-answer">
              <p className="feedback-box">{current.example}</p>
              <p className="status">{current.usageWarning}</p>
              <label className="field">
                Write your own IELTS-style sentence
                <textarea value={sentence} onChange={(event) => setSentence(event.target.value)} />
              </label>
              <div className="button-row">
                <button className="secondary-button" onClick={() => handleMark("Again")}>
                  Again
                </button>
                <button className="secondary-button" onClick={() => handleMark("Hard")}>
                  Hard
                </button>
                <button className="primary-button" onClick={() => handleMark("Good")}>
                  Good
                </button>
              </div>
              <p className="review-help">
                Again: I forgot it, review soon. Hard: I remembered it slowly, keep it weak.
                Good: I remembered it naturally, mark it confident.
              </p>
            </div>
          )}
        </article>
      )}

      {message && <p className="status error">{message}</p>}
    </section>
  );
}
