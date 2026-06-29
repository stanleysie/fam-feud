# fam-feud

A Family Feud–style game host for parties and events. Import questions from Excel or JSON, run the game from an admin panel on your laptop, and display the board on a big screen — both views stay in sync in the same browser via `localStorage`.

## Features

- **Excel import & export** — Download a template, fill it in Excel or Google Sheets, and upload; export your question set back to Excel or JSON
- **JSON file import** — Upload a `.json` question file (same format as export)
- **Try sample questions** — One-click demo with 3 ready-made rounds on the setup page
- **Question builder** — Create rounds in the browser without a spreadsheet
- **Guided setup** — Method picker (Excel, JSON, or build in-browser) with step-by-step instructions
- **Custom team names** — Rename teams on the review page or in Settings
- **Two-team gameplay** — Track scores, strikes, active team, and steal rounds
- **Dual-screen setup** — `/admin` for the host, `/game-view` for the audience display
- **Live sync** — Game state updates instantly across tabs on the same machine
- **Round review** — Browse past rounds while the game is in progress
- **Dramatic game ending** — Final round score on the display, then reveal overall winner when the host is ready
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

## Testing

Unit tests use [Vitest](https://vitest.dev/) (`npm test`). Coverage focuses on pure logic in `src/lib/` and `src/hooks/` — game engine, import/validation, admin routing, game-view banners, and storage (happy-dom stubs for `localStorage`).

## How to play

1. **Get started** — Open the home page and click **Get Started** (or press `Enter`).
2. **Add questions** — On the setup page (`/admin`), choose how to load questions:
   - **Try sample questions** — One-click demo with 3 example rounds (great for a first run).
   - **Excel or Google Sheets** — Download the template, fill it in, and upload the `.xlsx` file.
   - **JSON file** — Upload a `.json` file in the documented format (you can export this from the review page).
   - **Build here** — Create questions and answers directly in the browser.
3. **Review** — Preview your rounds on the questions page, set team names, open **Game View** on your display, then click **Start Game**. Use **Change questions** to go back to setup and replace your question set.
4. **Host** — Use `/admin` to reveal answers, mark wrong guesses, switch teams, and advance rounds. Open **Settings** to test sounds or change team names.
5. **Display** — Open `/game-view` on a second monitor or projector. It mirrors the board in real time.
6. **Finish** — After the last round, the display shows the final round result in a bottom banner (same style as other rounds). Click **Reveal Final Scores** on the admin panel when you are ready to show the overall winner.

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

### JSON file

Upload a `.json` file from the **JSON file** tab on the setup page. The structure matches what **Export JSON** produces on the review page:

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

| Route         | Purpose                                          |
| ------------- | ------------------------------------------------ |
| `/`           | Landing page                                     |
| `/admin`      | Host setup (import) or live game controls        |
| `/game-view`  | Audience / big-screen display                    |
| `/questions`  | Review rounds & set team names before starting   |

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
├── app/                        # Next.js routes
├── components/
│   └── admin/                  # Setup UI (import picker, sample banner, game controls)
├── hooks/                      # Shared React hooks (import, game state sync)
└── lib/                        # Game engine, validation, Excel/JSON I/O
```
