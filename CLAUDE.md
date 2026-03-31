# CLAUDE.md

## Project Overview

Pureshot is an HTML5 Canvas bullet-hell arcade game (飞机大战 / "Plane Battle"). It is a vanilla JavaScript project with no build tools, no dependencies, and no frameworks. The game runs directly in the browser and is deployed to GitHub Pages.

## Repository Structure

```
Pureshot/
├── index.html          # HTML entry point (480x640 canvas, basic CSS)
├── game.js             # Entire game engine (~1200 lines)
├── LICENSE             # MIT
├── README.md
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Pages deployment on push to main
```

## Tech Stack

- **Language:** Vanilla JavaScript (ES6+), HTML5, CSS
- **Rendering:** HTML5 Canvas 2D API (immediate-mode)
- **Audio:** Web Audio API (dynamic sound synthesis, no audio files)
- **Build system:** None — static files served directly
- **Dependencies:** None
- **Deployment:** GitHub Pages via `peaceiris/actions-gh-pages@v4`

## Architecture (game.js)

The game uses a procedural architecture with global state and a `requestAnimationFrame` loop calling `update()` then `draw()` each frame.

### Key Sections (by line region)

| Section | Description |
|---|---|
| Audio System (~7-157) | Web Audio API sound synthesis (shoot, hit, explode, etc.) with iOS Safari unlock |
| Game State (~159-183) | FSM states: MENU, PLAYING, PAUSED, GAME_OVER, STAGE_CLEAR, WIN |
| Stage Config | `getStageConfig()` — 5 stages with escalating difficulty and boss encounters |
| Drawing Functions (~240-480) | Procedural rendering: player, enemies, bullets, HUD, menus |
| Game Logic (~484-810) | Spawning, enemy AI, boss phases, collision, power-ups, bombs |
| Main Update (~810+) | Entity lifecycle: spawn → update → draw → filter (removal) |
| Rendering (~1087+) | Composites all draw calls, applies screen shake/flash effects |
| Input Handling (~1135-1214) | Keyboard (arrows/WASD, space, P, Enter) + mobile touch |
| Game Loop (~1217-1223) | `requestAnimationFrame` driving update/draw at 60fps |

### Game Entities (global arrays)

- `bullets[]` — player projectiles
- `enemies[]` — enemy aircraft with type/HP/behavior
- `particles[]` — explosion/visual effects
- `powerUps[]` — dropped items (power, bomb, life)

### Difficulty Modes

- `easy` and `normal` — selected from the menu, affects enemy spawning and bullet patterns

## Development Workflow

### Running Locally

Open `index.html` in any modern browser. No server required (though a local HTTP server avoids potential CORS issues):

```bash
# Python
python3 -m http.server 8000

# Node.js (npx)
npx serve .
```

### Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which deploys to GitHub Pages via the `gh-pages` branch.

### Testing

No automated tests exist. Test manually by playing the game in a browser. Key areas to verify after changes:

- Menu navigation and difficulty selection
- Player movement (keyboard + touch)
- Enemy spawning and AI patterns across all 5 stages
- Boss encounters and phase transitions
- Power-up drops and collection
- Bomb mechanic (space key / touch button)
- Audio playback (especially on iOS Safari)
- Responsive canvas scaling on mobile

## Code Conventions

- **Language:** Code comments and UI text are in Chinese (简体中文)
- **Commit messages:** Written in Chinese, prefixed with conventional types (`feat:`, `fix:`, `ci:`)
- **No linting or formatting tools** are configured
- **Procedural style:** No classes, no modules — all logic in a single `game.js` file
- **Naming:** camelCase for variables/functions, UPPER_CASE for state constants
- **Entity pattern:** Objects in arrays with position/velocity/type properties, filtered out when inactive

## Important Notes

- The entire game is in a single file (`game.js`) — changes should preserve this structure unless explicitly restructuring
- Audio uses synthesized sounds via Web Audio API oscillators — there are no audio asset files
- All rendering is procedural (shapes drawn via Canvas API) — there are no image/sprite assets
- Mobile support is critical: touch controls, responsive scaling, and iOS audio unlock are all important
- The game has 5 stages with boss fights; stage configuration is defined in `getStageConfig()`
