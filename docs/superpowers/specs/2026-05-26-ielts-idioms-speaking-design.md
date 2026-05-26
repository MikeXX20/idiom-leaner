# IELTS Speaking Idioms Practice App Design

Date: 2026-05-26

## Goal

Build a local-first web app that helps Band 6.5-7.5 IELTS Speaking learners practice using idioms naturally in spoken answers.

The app should feel like a speaking practice gym, not an idiom dictionary. Idioms are useful only when learners can choose a small number, use them in an IELTS-style answer, and reflect on whether they sounded natural.

## Target User

- IELTS Speaking learners around Band 6.5-7.5.
- Users who already know basic vocabulary but want more natural topic-based expression.
- Users who need guardrails against memorized, forced, outdated, or overly casual idioms.

## Product Shape

Use the Guided Practice First approach.

The main flow is:

1. Pick an IELTS Speaking topic and part, especially Part 2 or Part 3.
2. See a prompt plus a small set of suggested idioms.
3. Add personal idioms or ask AI to generate more topic-specific idioms.
4. Choose 2-3 idioms to try in the answer.
5. Record a spoken answer in the browser.
6. Get AI feedback focused on idiom naturalness, vocabulary range, overuse, and safer alternatives.
7. Save the session locally with recording, selected idioms, feedback, topic, and date.

## Main Screens

### Practice

The home screen for active speaking work.

Users choose an IELTS part, topic, and prompt. The screen shows a compact prep area with suggested idioms, saved idioms, and a recording control. The selected idioms are attached to the practice session before recording starts.

### Feedback

The post-recording state inside a practice session.

Users can replay the recording and review AI feedback. Feedback is split into predictable sections:

- Idioms used naturally.
- Idioms that sounded forced.
- Better alternatives.
- One improved sample sentence.
- A short next-step recommendation.

### Idiom Bank

Users can add idioms manually, save AI-generated idioms, tag idioms by IELTS topic, and mark confidence level. The bank supports practice by making saved idioms available in the Practice screen.

### History

A local practice log containing past recordings, prompts, idioms attempted, feedback summaries, and dates. Sessions can be reopened for playback and review.

## Architecture

The MVP is a single-page web app with local-first persistence.

The browser handles:

- Topic and prompt selection.
- Idiom bank management.
- Microphone recording.
- Audio playback.
- Local practice history.
- Displaying AI-generated idioms and feedback.

Data is stored locally in IndexedDB because recordings are binary blobs and may be too large for localStorage.

No login is required in v1. Data objects should still use stable IDs and clear boundaries so future account sync can be added without rewriting the app.

## AI Usage

AI is used only when the user requests it:

1. Generate idiom suggestions for a selected IELTS topic.
2. Give feedback after a recorded spoken answer.

Feedback requests send the recording plus session context:

- IELTS part.
- Topic.
- Prompt.
- Selected idioms.
- User notes if available.

AI responses should use structured JSON so the UI can render stable feedback sections and handle partial failures.

The feedback must not claim to provide an official IELTS score. It may use band-style language to explain lexical resource quality, such as whether phrasing sounds closer to Band 7 usage.

## Content Rules

The app should discourage idiom stuffing. Learners should be guided toward natural, topic-appropriate language rather than maximizing the number of idioms in an answer.

Generated idiom entries should include:

- Idiom or expression.
- Plain meaning.
- IELTS topic tags.
- Formality level.
- Risk level.
- Natural IELTS-style example.
- Warning when an idiom is too casual, outdated, too specific, or hard to use safely.

The MVP should include a small built-in starter set of IELTS prompts and example idioms so the app works before users create or generate content.

## Data Model

Use stable IDs for all persistent records.

### Idiom

- `id`
- `phrase`
- `meaning`
- `topics`
- `formality`
- `riskLevel`
- `example`
- `usageWarning`
- `source`: `starter`, `user`, or `ai`
- `confidence`
- `createdAt`
- `updatedAt`

### Practice Session

- `id`
- `ieltsPart`
- `topic`
- `prompt`
- `selectedIdiomIds`
- `recordingBlob`
- `recordingDuration`
- `feedbackStatus`: `none`, `pending`, `complete`, or `failed`
- `feedback`
- `createdAt`
- `updatedAt`

### Feedback

- `naturalUsage`
- `forcedUsage`
- `betterAlternatives`
- `improvedSampleSentence`
- `nextStep`
- `rawModelResponse`

## Error Handling

The app should handle common failures clearly:

- Microphone permission denied.
- Browser does not support required recording APIs.
- Recording is interrupted.
- Recording playback fails.
- Local save fails.
- AI idiom generation fails.
- AI feedback fails or returns malformed data.

A failed feedback request must not delete the recording. The session should remain saved with `feedbackStatus: failed` and offer retry.

## Testing

Testing should focus on risky user flows:

- Recording lifecycle: start, stop, playback, save.
- Local persistence: idioms and sessions survive page refresh.
- AI response parsing: malformed or incomplete JSON does not break the UI.
- Idiom selection: selected idioms attach to the correct session.
- Empty states: no idioms, no history, no microphone access.

The MVP should also be verified in a real browser because microphone APIs and audio playback depend on browser behavior.

## Out Of Scope For MVP

- User accounts.
- Cloud sync.
- Official IELTS scoring.
- Teacher dashboards.
- Payment or subscription features.
- Multi-device history.
- Full curriculum planning.

## Open Design Decisions For Implementation

- Exact frontend framework.
- Exact AI provider integration.
- Whether audio feedback should use direct audio input or a transcription-first pipeline.
- Size and topics for the starter prompt and idiom set.
