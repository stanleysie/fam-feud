# fam-feud

A Family Feud–style game host for parties and events. Import or build your own survey questions, run the game from an admin panel on your laptop, and display the board on a big screen — both views stay in sync in the same browser via `localStorage`.

## Features

- **Question import** — Load rounds from a JSON file or paste JSON directly; includes a built-in question builder
- **Two-team gameplay** — Track scores, strikes, active team, and steal rounds
- **Dual-screen setup** — `/admin` for the host, `/game-view` for the audience display
- **Live sync** — Game state updates instantly across tabs on the same machine
- **Round review** — Browse past rounds while the game is in progress
- **Sound effects** — Correct and wrong answer feedback for the host

## Tech stack

- [Next.js](https://nextjs.org/) 16 · [React](https://react.dev/) 19 · TypeScript
- [Tailwind CSS](https://tailwindcss.com/) 4 · [shadcn/ui](https://ui.shadcn.com/)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Other scripts:

```bash
npm run build   # production build
npm run start   # serve production build
npm run lint    # run ESLint
```

## How to play

1. **Start** — Open the home page and click **Start Game** (or press `Enter`).
2. **Load questions** — On the admin page, import a JSON file or build questions with the question builder.
3. **Review** — Preview your rounds on the questions page, then start the game.
4. **Host** — Use `/admin` to reveal answers, mark wrong guesses, switch teams, and advance rounds.
5. **Display** — Open `/game-view` on a second monitor or projector. It mirrors the board in real time.

## Question format

Import a JSON file with this structure:

```json
{
  "rounds": [
    {
      "question": "Name something you bring to the beach",
      "answers": [
        { "text": "Sunscreen", "points": 35 },
        { "text": "Towel", "points": 28 },
        { "text": "Umbrella", "points": 20 }
      ]
    }
  ]
}
```

Each round needs a `question` string and at least one answer with `text` and `points` (number). Answers are typically ordered from highest to lowest points.

## Routes

| Route         | Purpose                          |
| ------------- | -------------------------------- |
| `/`           | Landing page                     |
| `/admin`      | Host controls                    |
| `/game-view`  | Audience / big-screen display    |
| `/questions`  | Review rounds before starting    |
