# ActFlow

ActFlow turns a vague intention ("I want to learn guitar", "start a side business") into a concrete plan, then keeps you moving one small step at a time. It assesses how ready you are, breaks the goal into steps, helps you get past blockers, and rewards progress with XP, streaks, and a shared leaderboard.

AI features run on a **local [Ollama](https://ollama.com) model**, so nothing leaves your machine. If Ollama is offline, built-in fallbacks keep the app usable.

## Features

- **Intentions** – write a goal in plain language and get a titled, step-by-step plan.
- **Readiness assessment** – list your skills and levels; get a verdict (`go` / `prepare` / `reconsider`), a 0–100 score, strengths, gaps, and more realistic alternatives.
- **Four modes** – each intention runs as `focus`, `coordinate`, `navigate`, or `decide`.
- **Rich steps** – every step can have a duration, an owner, a blocking dependency, micro-actions, details, verification checklist, and resources (locations, learning material, videos, links).
- **Next action** – a ranked "what should I do now?" view with a focus timer and verify checklist.
- **Proof of completion** – attach a compressed photo to finished steps.
- **Decisions** – track what you're unsure about, define criteria, and record go / pass.
- **Friction handling** – pick what's blocking you and get a targeted way around it.
- **Comments and reminders** – notes per intention and a reminders API.
- **Leaderboard** – XP, steps, finished intentions, and streaks, shared by everyone using the running server.
- **Flow diagram** – visualise how steps depend on each other.

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router) and React 19
- TypeScript 5
- Tailwind CSS 4
- [lucide-react](https://lucide.dev) icons
- Ollama for local LLM inference (default model `gemma4:e4b`)

## Getting started

### Prerequisites

- Node.js 20+
- (Optional) [Ollama](https://ollama.com) for AI-generated plans and assessments

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root route redirects to `/dashboard`.

### Enable AI (optional)

```bash
ollama pull gemma4:e4b
ollama serve
```

The app checks Ollama's status and shows it in the navigation. Without it, plans and assessments use the deterministic fallbacks in `lib/ai/fallback.ts`.

### Environment variables

| Variable       | Default                  | Description                  |
| -------------- | ------------------------ | ---------------------------- |
| `OLLAMA_HOST`  | `http://localhost:11434` | URL of the Ollama server     |
| `OLLAMA_MODEL` | `gemma4:e4b`             | Model used for AI requests   |

Set them in `.env.local`.

## Scripts

| Command         | Description                |
| --------------- | -------------------------- |
| `npm run dev`   | Start the dev server       |
| `npm run build` | Create a production build  |
| `npm start`     | Run the production build   |
| `npm run lint`  | Lint with ESLint           |

## Project structure

```
app/
  dashboard/        Overview of your intentions
  create/           Create a new intention
  intention/[id]/   Plan, steps, assessment, decisions, comments
  action/[id]/      Focused execution of the next step
  rank/             Ranked next actions
  leaderboard/      Global leaderboard
  login/            Sign-in
  api/
    ai/             analyze, assess, plan, status endpoints
    reminders/      Reminders endpoint
    leaderboard/    Leaderboard read/write
components/         UI, action, intention, friction, navigation components
hooks/              useAuth, useIntentions
lib/
  ai/               Ollama client, planning, assessment, fallbacks
  actions/          Next-action selection and ranking
  friction/         Blocker catalog
  leaderboard/      Server store and client sync
  utils/            Helpers (cn, image, links, time)
schemas/            Validation schemas
types/              Shared TypeScript types
```

## Data and storage

- **Leaderboard** is stored in `data/leaderboard.json` on the server and is shared by everyone using that instance. Scores are self-reported with no server-side verification, so treat it as friendly competition.
- **Intentions** are managed through the `useIntentions` hook.

## Notes for contributors

This project uses a version of Next.js with breaking changes from older releases. Before changing framework-level code, read the relevant guide in `node_modules/next/dist/docs/` (see [AGENTS.md](AGENTS.md)).
