# fam-feud

A Family Feud–style game host for parties and events. Import questions from Excel or JSON, run the game from an admin panel on your laptop, and display the board on a big screen — both views stay in sync in the same browser via `localStorage`.

## Features

- **Excel import & export** — Download a template, fill it in Excel or Google Sheets, and upload; export your question set back to Excel or JSON
- **Question builder** — Create rounds in the browser without a spreadsheet
- **Custom team names** — Rename teams on the questions page or in Settings
- **Two-team gameplay** — Track scores, strikes, active team, and steal rounds
- **Dual-screen setup** — `/admin` for the host, `/game-view` for the audience display
- **Live sync** — Game state updates instantly across tabs on the same machine
- **Round review** — Browse past rounds while the game is in progress
- **Sound effects** — Correct and wrong answer feedback (test in Settings)

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
npm run build      # production build
npm run start      # serve production build
npm run lint       # run ESLint
npm test           # run unit tests
npm run test:watch # run tests in watch mode
```

## How to play

1. **Start** — Open the home page and click **Start Game** (or press `Enter`).
2. **Load questions** — On the admin page, download the Excel template or import an `.xlsx` / `.json` file. You can also build questions in the browser.
3. **Review** — Preview your rounds on the questions page, set team names, then start the game.
4. **Host** — Use `/admin` to reveal answers, mark wrong guesses, switch teams, and advance rounds. Open **Settings** to test sounds or change team names.
5. **Display** — Open `/game-view` on a second monitor or projector. It mirrors the board in real time.

## Question formats

### Excel (recommended)

Download the template from the admin page. The **Questions** sheet uses four columns:

| Round | Question | Answer | Points |
|------:|----------|--------|-------:|
| 1 | Name something you bring to the beach | Sunscreen | 35 |
| 1 | | Towel | 28 |
| 2 | Name a popular pizza topping | Pepperoni | 40 |

- Each row is one answer; rows with the same **Round** number belong to the same question.
- Type the question on the first row of each round (you can leave **Question** blank on follow-up rows).
- **Points** are survey points — higher means a more popular answer.

### JSON (advanced)

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
| `/admin`      | Host controls & question import  |
| `/game-view`  | Audience / big-screen display    |
| `/questions`  | Review rounds & set team names before starting |

## Deploy

This app is a static Next.js site and deploys cleanly to [Vercel](https://vercel.com/) (or any host that supports Next.js).

### Vercel (recommended)

1. Push the repo to GitHub.
2. Import the project in Vercel and select the repository.
3. Use the default settings — **Framework Preset: Next.js**, build command `npm run build`.
4. Deploy. Vercel will run CI on each push if GitHub Actions is configured.

### Manual production build

```bash
npm ci
npm run build
npm run start
```

The app listens on port 3000 by default.

### Notes

- Game state is stored in the browser (`localStorage`) — no database or env vars required.
- Admin and game-view must be opened on the **same origin** (same URL) for live sync to work.
- Security headers are configured in `next.config.ts`.

## Project structure

```
src/
├── app/                  # Next.js routes
├── components/
│   └── admin/            # Admin panel UI (import, game controls)
├── hooks/                # Shared React hooks
└── lib/                  # Game engine, validation, Excel/JSON I/O
```
