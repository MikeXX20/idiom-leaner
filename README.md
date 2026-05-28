# IELTS Idiom Speaking Coach

Local-first web app for IELTS Speaking learners who want to recite idioms, practice topic vocabulary, record answers, and review idiom feedback.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

The web app runs at `http://127.0.0.1:5173`.
The API runs at `http://127.0.0.1:8787`.

## Environment

Create `.env` with:

```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_FEEDBACK_MODEL=gpt-5.4-mini
OPENAI_TRANSCRIPTION_MODEL=gpt-4o-transcribe
```

## Local data

Idioms, practice sessions, feedback, and recordings are stored in browser IndexedDB.
No account is required.
