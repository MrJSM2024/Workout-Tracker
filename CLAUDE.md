# Chess App — Project Memory

## What This Is
A chess Progressive Web App (PWA) built with React + Vite. The user plays against the
Stockfish chess engine. Hosted free on GitHub Pages. Installable to Android home screen.

## Owner
GitHub: mrjsm2024
Repo: workout-tracker (URL kept as-is; can be renamed in GitHub Settings → General)
Live URL: https://mrjsm2024.github.io/workout-tracker/

## Tech Stack
| Layer | Tool |
|-------|------|
| Framework | React 18 + Vite 5 |
| Chess logic | chess.js v1 |
| Chess board UI | react-chessboard v4 |
| Chess engine | Stockfish 16 (WebAssembly, single-threaded) |
| Sounds | Web Audio API (no external files needed) |
| Hosting | GitHub Pages via GitHub Actions |
| Styling | CSS Modules |

## How the Engine Works
- `scripts/copy-stockfish.js` copies the Stockfish WASM files from `node_modules/stockfish/src/`
  into `public/` as `stockfish-engine.js` and `stockfish-engine.wasm` during `npm install`
- The app loads `stockfish-engine.js` as a Web Worker at runtime
- Communication uses the UCI protocol (text messages)
- NNUE evaluation is disabled (`setoption name Use NNUE value false`) to avoid loading
  the large neural network file

## How Deployment Works
1. Code is pushed to the `claude/coding-guide-beginners-p5oQx` branch (or `main`)
2. GitHub Actions (`.github/workflows/deploy.yml`) automatically:
   - Runs `npm ci` (installs deps + copies Stockfish files via postinstall)
   - Runs `npm run build` (Vite builds into `dist/`)
   - Deploys `dist/` to GitHub Pages
3. The live URL updates within ~1 minute

## One-Time Setup the User Must Do
Go to: GitHub repo → Settings → Pages → Source → select **"GitHub Actions"**
(Only needs to be done once. After that, every push auto-deploys.)

## File Structure
```
├── .github/workflows/deploy.yml   # Auto-deploy to GitHub Pages
├── public/
│   ├── manifest.json              # PWA manifest (makes app installable)
│   ├── chess-icon.svg             # App icon
│   ├── stockfish-engine.js        # Copied by postinstall (gitignored)
│   └── stockfish-engine.wasm      # Copied by postinstall (gitignored)
├── scripts/
│   └── copy-stockfish.js          # Copies Stockfish files from node_modules
├── src/
│   ├── components/
│   │   ├── ChessGame.jsx          # Main board + game logic
│   │   ├── GameSetup.jsx          # Difficulty + color picker screen
│   │   └── GameStatus.jsx         # Turn indicator bar
│   ├── hooks/
│   │   └── useStockfish.js        # Stockfish worker management (UCI protocol)
│   ├── utils/
│   │   └── sounds.js              # Web Audio API sound effects
│   ├── App.jsx                    # Root: toggles between Setup and Game screens
│   └── main.jsx                   # React entry point
├── index.html
├── vite.config.js                 # base: '/workout-tracker/'
└── package.json
```

## Current Features (v1)
- Classic wood board (brown #b58863 / cream #f0d9b5)
- Play vs Stockfish at Easy / Medium / Hard
- Choose to play as White or Black
- Drag-and-drop + tap-to-move (mobile friendly)
- Legal move hints (dots on valid squares)
- Last move highlight (yellow)
- Move, capture, check, and game-end sounds
- Check/checkmate/draw detection
- Game over overlay with result
- New Game button

## Roadmap (future sessions)
- [ ] Move history / notation panel
- [ ] Undo last move button
- [ ] Flip board button
- [ ] Game clock / timer
- [ ] Pawn promotion dialog (currently auto-promotes to queen)
- [ ] Highlight king in check (red square)
- [ ] Save game history (needs Supabase database)
- [ ] Play vs a friend on the same device
- [ ] Better PWA with offline support (vite-plugin-pwa)

## Key Decisions Made
- **No backend**: Stockfish runs entirely in the browser (WebAssembly). No server costs.
- **GitHub Pages**: Free hosting, zero configuration after initial setup.
- **CSS Modules**: Scoped styles, no class name conflicts, no extra libraries.
- **Web Audio API for sounds**: No external audio files needed.
- **Auto-queen promotion**: Simplifies v1. A proper dialog can be added later.
- **NNUE disabled**: Avoids downloading the large neural network file (~80MB).
  Stockfish is still very strong without it (more than enough for casual play).

## Notes for Future Sessions
- If renaming the repo, update `vite.config.js` base and `public/manifest.json` start_url/scope
- The `public/stockfish-engine.js` and `.wasm` files are generated — do NOT edit them manually
- chess.js v1 uses `game.move()` which throws on illegal moves (wrap in try/catch)
- react-chessboard `onPieceDrop` must return `true` (valid) or `false` (invalid)
