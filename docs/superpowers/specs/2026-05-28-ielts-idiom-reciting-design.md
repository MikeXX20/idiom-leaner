# IELTS Idiom Reciting Mode Design

Date: 2026-05-28

## Goal

Turn the existing IELTS Idiom Coach into a stronger memorization and reciting tool by adding a focused study mode and a larger built-in idiom library.

The app should help learners remember idioms, understand when they are safe for IELTS Speaking, and practice producing their own natural example sentences. The goal is not to become a dictionary. The goal is repeated, active recall.

## Target User

- IELTS Speaking learners around Band 6.5-7.5.
- Users who want a structured idiom deck they can recite every day.
- Users who need topic-based vocabulary for IELTS answers.
- Users who need warnings against forced, outdated, overly casual, or risky idiom use.

## Product Shape

Add a new top-level `Recite` page. The main navigation becomes:

1. Practice
2. Recite
3. Idiom Bank
4. History

`Practice` remains the place for recording full IELTS Speaking answers and requesting AI feedback. `Idiom Bank` remains the place for browsing and adding idioms. `Recite` becomes the main study room for memorizing and actively using idioms.

The reciting flow is:

1. Choose `Daily Review` or `Topic Practice`.
2. See the front of a study card with topic, difficulty, safety tags, meaning, and a hint.
3. Reveal the idiom.
4. Write an original IELTS-style example sentence.
5. Compare against the model example and usage warning.
6. Self-mark the card as `Again`, `Hard`, or `Good`.
7. Move to the next card.

Voice reciting can be introduced later. The first version focuses on typed examples because it is faster, reliable, and easier to save as review evidence.

## Built-In Idiom Library

Expand the starter idiom set from 3 entries to about 80 built-in idioms.

The library is organized into IELTS topic packs:

- Work and Careers
- Education
- Technology
- Health
- Environment
- Travel
- Relationships
- Society

Each idiom should include:

- `phrase`
- `meaning`
- `topics`
- `formality`
- `riskLevel`
- `difficulty`
- `ieltsSafety`
- `example`
- `usageWarning`
- `source`
- `confidence`
- timestamps

`difficulty` can be `easy`, `medium`, or `advanced`.

`ieltsSafety` can be:

- `safe`: broadly useful and natural in IELTS answers.
- `careful`: useful, but only in the right context.
- `risky`: included for awareness, but the app should warn learners before practicing it.

The idioms should lean toward natural expressions that can fit IELTS topics. The library should avoid slangy idioms that sound memorized or theatrical in a speaking test.

## Learning Logic

Keep the review algorithm simple and transparent.

Each idiom gets review progress:

- `confidence`: `new`, `practicing`, or `confident`
- `lastReviewedAt`
- `reviewCount`
- `mistakeCount`
- `nextReviewAt`

The user controls progress by self-marking:

- `Again`: increases `mistakeCount`, sets `confidence` to `practicing`, and keeps the card due soon.
- `Hard`: keeps or sets `confidence` to `practicing` and schedules the card for a near future review.
- `Good`: increases `reviewCount`, schedules the card later, and can move the idiom toward `confident`.

Daily Review shows about 10 cards, ordered by:

1. due cards,
2. cards with more mistakes,
3. cards still marked `new`,
4. topic variety.

Topic Practice ignores due dates and lets learners drill one selected topic directly.

## Recite Page Interface

The `Recite` page has three compact areas.

### Mode Bar

The user chooses between:

- `Daily Review`
- `Topic Practice`

When `Topic Practice` is selected, show a topic dropdown.

### Recite Card

The front side shows:

- topic
- difficulty tag
- IELTS safety tag
- meaning
- usage hint

The back side shows:

- idiom phrase
- model IELTS-style example sentence
- usage warning

### Use It

After revealing the idiom, the user writes an original sentence in a textarea labeled for IELTS-style sentence practice.

The self-mark controls appear after the card is revealed:

- Again
- Hard
- Good

After marking, the app updates local review progress and advances to the next card. When the queue is empty, show a review complete state.

## Data Model Changes

The existing `Idiom` model should gain optional fields for study metadata without breaking existing saved idioms:

- `difficulty`
- `ieltsSafety`
- `lastReviewedAt`
- `reviewCount`
- `mistakeCount`
- `nextReviewAt`

Existing idioms without these fields should default to:

- `difficulty`: `medium`
- `ieltsSafety`: `careful`
- `reviewCount`: `0`
- `mistakeCount`: `0`
- `confidence`: existing value or `new`

This keeps old local IndexedDB data usable after the feature lands.

## Architecture

Add focused modules rather than expanding existing pages too much:

- `src/domain/idiomDeck.ts`: the expanded built-in idiom library.
- `src/domain/reviewScheduler.ts`: review queue and mark-result logic.
- `src/features/recite/RecitePage.tsx`: the study interface.
- `src/features/recite/RecitePage.test.tsx`: UI behavior tests.

Storage remains IndexedDB through the existing repository layer.

The seed logic should support adding new built-in starter idioms without duplicating user-created idioms. If an idiom already exists by stable starter ID, do not overwrite user progress.

## Error Handling

The app should handle:

- local idiom load failure,
- no cards available for the selected topic,
- no due cards in Daily Review,
- local save failure after marking a card,
- existing idioms missing newer optional fields.

Errors should appear as small status messages inside the Recite page. A save failure should not advance the card as if progress was saved.

## Testing

Tests should cover:

- the built-in idiom library has roughly 80 entries with required fields,
- every built-in idiom has at least one IELTS topic,
- risky idioms include explicit usage warnings,
- the scheduler prioritizes due and weak cards,
- self-marking updates review progress correctly,
- Recite page reveals cards, accepts a typed example, marks progress, and advances,
- navigation includes the new Recite page.

Browser verification should confirm that the new page is reachable from the running app and that a learner can complete at least one reciting card.

## Out Of Scope For This Upgrade

- Voice reciting capture inside cards.
- AI grading of typed examples.
- Streaks, leaderboards, or large analytics dashboards.
- Cloud sync.
- User accounts.
- Exporting study history.
