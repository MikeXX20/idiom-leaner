import { useState } from "react";
import { HistoryPage } from "./features/history/HistoryPage";
import { IdiomBankPage } from "./features/idiom-bank/IdiomBankPage";
import { PracticePage } from "./features/practice/PracticePage";
import { RecitePage } from "./features/recite/RecitePage";

type View = "practice" | "recite" | "idioms" | "history";

export default function App() {
  const [view, setView] = useState<View>("practice");

  return (
    <main className="app-shell">
      <nav className="top-nav" aria-label="Main navigation">
        <strong>IELTS Idiom Coach</strong>
        <div>
          <button aria-current={view === "practice"} onClick={() => setView("practice")}>
            Practice
          </button>
          <button aria-current={view === "recite"} onClick={() => setView("recite")}>
            Recite
          </button>
          <button aria-current={view === "idioms"} onClick={() => setView("idioms")}>
            Idiom Bank
          </button>
          <button aria-current={view === "history"} onClick={() => setView("history")}>
            History
          </button>
        </div>
      </nav>
      {view === "practice" && <PracticePage />}
      {view === "recite" && <RecitePage />}
      {view === "idioms" && <IdiomBankPage />}
      {view === "history" && <HistoryPage />}
    </main>
  );
}
