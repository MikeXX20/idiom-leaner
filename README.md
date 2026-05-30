# IELTS Idiom Speaking Coach

Local-first web app for IELTS Speaking learners who want to recite idioms, practice topic vocabulary, and record answers. The public version works without an OpenAI API key by using the curated idiom deck.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

The web app runs at `http://127.0.0.1:5173`.
The API runs at `http://127.0.0.1:8787`.

## Environment

The idiom bank and reciting flow do not need an API key.

For local DeepSeek idiom generation and typed-answer feedback, keep audio feedback disabled
and add a fresh key to your private `.env`:

```bash
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_FEEDBACK_FEATURES=false
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

Recording feedback needs an audio transcription provider. If you have an OpenAI key later, you can enable the original audio feedback flow:

```bash
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_FEEDBACK_FEATURES=true
LLM_PROVIDER=openai
OPENAI_API_KEY=your_api_key_here
OPENAI_FEEDBACK_MODEL=gpt-5.4-mini
OPENAI_TRANSCRIPTION_MODEL=gpt-4o-transcribe
```

## Local data

Idioms, practice sessions, feedback, and recordings are stored in browser IndexedDB.
No account is required.
