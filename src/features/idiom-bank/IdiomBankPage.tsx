import { type FormEvent, useEffect, useState } from "react";
import type { Idiom } from "../../domain/types";
import { listIdioms, saveIdiom } from "../../storage/repositories";

function now() {
  return new Date().toISOString();
}

export function IdiomBankPage() {
  const [idioms, setIdioms] = useState<Idiom[]>([]);
  const [phrase, setPhrase] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [message, setMessage] = useState("");

  async function refresh() {
    setIdioms(await listIdioms());
  }

  useEffect(() => {
    refresh().catch(() => setMessage("Could not load idioms."));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const timestamp = now();
    await saveIdiom({
      id: `idiom-${crypto.randomUUID()}`,
      phrase,
      meaning,
      topics: ["Work and Careers"],
      formality: "neutral",
      riskLevel: "medium",
      example,
      usageWarning: "Use it only when it directly fits the answer.",
      source: "user",
      confidence: "new",
      createdAt: timestamp,
      updatedAt: timestamp
    });
    setPhrase("");
    setMeaning("");
    setExample("");
    setMessage("Idiom saved.");
    await refresh();
  }

  return (
    <section className="content-section">
      <p className="eyebrow">My vocabulary</p>
      <h1>Idiom Bank</h1>
      <form className="idiom-form" onSubmit={handleSubmit}>
        <label className="field">
          Phrase
          <input value={phrase} onChange={(event) => setPhrase(event.target.value)} required />
        </label>
        <label className="field">
          Meaning
          <input value={meaning} onChange={(event) => setMeaning(event.target.value)} required />
        </label>
        <label className="field">
          Example
          <textarea value={example} onChange={(event) => setExample(event.target.value)} required />
        </label>
        <button className="primary-button" type="submit">
          Save idiom
        </button>
      </form>
      {message && <p className="status">{message}</p>}
      <div className="idiom-list">
        {idioms.map((idiom) => (
          <article key={idiom.id} className="idiom-choice">
            <span>
              <strong>{idiom.phrase}</strong>
              <small>{idiom.meaning}</small>
              <small>{idiom.usageWarning}</small>
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
