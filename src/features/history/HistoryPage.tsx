import { useEffect, useState } from "react";
import type { PracticeSession } from "../../domain/types";
import { listSessions } from "../../storage/repositories";

export function HistoryPage() {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    listSessions()
      .then(setSessions)
      .catch(() => setMessage("Could not load practice history."));
  }, []);

  return (
    <section className="content-section">
      <p className="eyebrow">Review</p>
      <h1>Practice History</h1>
      {message && <p className="status error">{message}</p>}
      {sessions.length === 0 && <p>No practice sessions yet. Record an answer to start your log.</p>}
      <div className="idiom-list">
        {sessions.map((session) => (
          <article key={session.id} className="prompt-card">
            <strong>{session.topic}</strong>
            <p>{session.prompt}</p>
            <small>
              {session.ieltsPart} - {session.recordingDuration}s - {session.feedbackStatus}
            </small>
            {session.feedback?.nextStep && <p>{session.feedback.nextStep}</p>}
            <audio
              aria-label={`Playback for ${session.topic}`}
              controls
              src={URL.createObjectURL(session.recordingBlob)}
            />
          </article>
        ))}
      </div>
    </section>
  );
}
