# IELTS Idiom Speaking Coach

A friendly local-first web app for IELTS Speaking learners who want to learn idioms, recite them, and use them naturally in practice answers.

The public demo works without any API key. It uses a curated idiom deck, so learners can start practicing immediately.

[Open the live demo](https://mikexx20.github.io/idiom-leaner/)

## What You Can Do

- Practice IELTS-style prompts by topic.
- Generate extra topic idioms locally with DeepSeek.
- Choose 1-3 idioms and get feedback on whether your typed answer uses them naturally.
- Recite idioms with daily review and topic practice modes.
- Track new, weak, due, and confident idioms.
- Review saved practice history in your browser.

## Practice Flow

1. Pick an IELTS prompt.
2. Use the topic idioms, or click Generate to add more expressions.
3. Tick the idioms you want to practice.
4. Type or record your answer.
5. Use feedback and reciting mode to improve.

## Public Demo vs Local AI

The public GitHub Pages version is safe and key-free. It includes the idiom bank, practice flow, reciting mode, and history.

Local AI features are available when you run the app on your own machine:

- DeepSeek can generate idioms.
- DeepSeek can review typed answers.
- Audio recording works locally, but automatic audio feedback needs a transcription provider.

## Run Locally

```bash
npm install
cp .env.example .env
npm run dev
```

Then open:

- Web app: `http://127.0.0.1:5173`
- API server: `http://127.0.0.1:8787`

## Local DeepSeek Setup

To use idiom generation and typed-answer feedback, edit your private `.env` file:

```bash
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_FEEDBACK_FEATURES=false
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

Keep `.env` private. It is ignored by git.

## Optional OpenAI Audio Feedback

Audio feedback needs transcription. If you later add an OpenAI key, you can enable the original recording-feedback path:

```bash
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_FEEDBACK_FEATURES=true
LLM_PROVIDER=openai
OPENAI_API_KEY=your_api_key_here
OPENAI_FEEDBACK_MODEL=gpt-5.4-mini
OPENAI_TRANSCRIPTION_MODEL=gpt-4o-transcribe
```

## Local Data

This app stores idioms, practice sessions, feedback, and recordings in browser IndexedDB.

No account is required. Your local practice data stays in your browser unless you clear site data.

## Scripts

```bash
npm run dev        # start the web app and local API
npm run test       # run tests
npm run typecheck  # run TypeScript checks
npm run build      # build the app
npm run check      # typecheck, test, and build
```

## Project Status

This is an active learning project. The goal is to make IELTS idiom practice feel practical, clear, and calm: not just memorizing phrases, but learning when an idiom sounds natural.
