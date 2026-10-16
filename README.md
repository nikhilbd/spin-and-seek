# Spin & Seek: The Cluttered Curiosity Parlor

An interactive letter-wheel hidden-object word discovery web game set in an antique Victorian curiosity study.

---

## Overview

**Spin & Seek** combines the tactile suspense of a spinning carnival wheel with the visual discovery of a classic hidden-object game (such as *I SPY* or *Mystery Case Files*).

### Gameplay Mechanics

1. **Spin the First Letter**: The player spins the high-DPI canvas wheel to select the starting letter of a hidden curiosity.
2. **Spin the Ending Letter**: The wheel dynamically populates with valid ending letters that exist in the room for that starting letter, ensuring every round is 100% solvable.
3. **Spot the Curiosity**: The player searches a crowded, photorealistic Victorian parlor to find and click an object whose name matches the first and last letters and the target letter count.
4. **Progressive Hints**: If stuck, the player can click the Hint button to reveal internal letters one by one, culminating in a radar spotlight over the target object.

---

## Key Features

- **Photorealistic Visual Atmosphere**: High-resolution 16:9 photographic study (`curiosity_parlor.jpg`) featuring 57 concrete, 1-to-1 interactive curiosities with custom hit geometries and golden magnifying lens hover outlines.
- **Three-Tier Difficulty Selector**:
  - **Beginner (Ages ~5)**: 42 common, short concrete objects. 4+ letter words reveal their second letter immediately. Targets gently pulse with a warm golden sparkle. Hints incur zero score penalty.
  - **Intermediate (Ages ~9)**: 53 objects spanning richer vocabulary with standard first-and-last letter reveals and progressive hints.
  - **Advanced (Ages 13+)**: All 57 objects, including vintage instruments and curiosity relics. Strict first-and-last reveals and high scoring stakes.
- **Session Word Uniqueness**: Tracks objects played during the active session (`sessionUsedIds`) so no word is repeated until the entire pool for the selected difficulty has been exhausted.
- **Guaranteed Solvability Engine**: The dictionary engine filters the second wheel's segments based on the first wheel's outcome, preventing impossible letter pairs or dead ends.
- **Procedural Web Audio API Sound Effects**: Synthesizes mechanical wheel tick clicks, wheel stop thuds, brass victory fanfares, gentle error bonks, and mystical hint shimmers with zero external audio files.
- **Responsive Viewport Navigation**: Smooth drag-to-pan, mouse wheel zoom-to-cursor, pinch-to-zoom on touch devices, and dedicated HUD zoom controls (+, −, ⛶).
- **Zero External Dependencies**: Pure client-side HTML5, CSS3, SVG, Canvas, and ES6 JavaScript. Compatible with any modern browser and ready for static hosting on GitHub Pages.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         index.html                          │
│           (HUD Bar, Modals, Viewport Containers)            │
└───────┬──────────────────────┬──────────────────────┬───────┘
        │                      │                      │
        ▼                      ▼                      ▼
  ┌───────────┐          ┌───────────┐          ┌───────────┐
  │ wheel.js  │          │  room.js  │          │ audio.js  │
  │  (Canvas  │          │(SVG Photo │          │(Web Audio │
  │  Physics) │          │ Hotspots) │          │Synthesis) │
  └─────┬─────┘          └─────┬─────┘          └─────┬─────┘
        │                      │                      │
        └────────────────┬─────┴──────────────────────┘
                         ▼
                   ┌───────────┐
                   │  game.js  │ ◄─── room_data.js
                   │  (State   │      (Dictionary &
                   │  Machine) │       Solvability)
                   └───────────┘
```

### Module Responsibilities

| File | Primary Responsibility |
| :--- | :--- |
| `index.html` | Application shell, accessibility attributes, HUD overlays, difficulty picker modal, ledger modal, and celebration dialogs. |
| `style.css` | Victorian curiosity visual theme, typography, layout, animations (`letterPop`, `beginnerSparklePulse`, `hotspotGlow`), and responsive breakpoints. |
| `room_data.js` | Authoritative object catalog (57 concrete 1-to-1 items) containing coordinates, category, difficulty tier, descriptive hints, and solvability query functions. |
| `room.js` | Viewport renderer, image background loader, interactive SVG hotspot overlays, zoom/pan transforms, particle explosion effects, and hint radar spotlight. |
| `wheel.js` | High-DPI HTML5 Canvas spinning wheel with physics-driven rotational deceleration, flapper spring deflection, sound triggers, and segment angle math. |
| `audio.js` | Procedural sound synthesizer using the Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`, and `BiquadFilterNode`). |
| `game.js` | Central state machine orchestrating round flows (`INTRO`, `SPIN_FIRST`, `SPIN_LAST`, `SEARCHING`, `ROUND_SUCCESS`), difficulty updates, progressive hint reveals, scoring, and HUD sync. |
| `test_room_data.js` | Automated verification test suite validating dictionary integrity, concrete-object invariants, 1-to-1 group/clue uniqueness, coordinate bounds, and 100% A–Z alphabet coverage across all difficulty tiers. |
| `server.py` | Local static file server with anti-caching headers for rapid local testing. |

---

## Difficulty Tier Matrix

| Dimension | Beginner (Ages ~5) | Intermediate (Ages ~9) | Advanced (Ages 13+) |
| :--- | :--- | :--- | :--- |
| **Object Pool Size** | 42 items | 53 items | 57 items |
| **Word Length** | 3 to 10 letters | 3 to 10 letters | 3 to 10 letters |
| **Initial Letter Slots** | First & Last revealed. For 4+ letter words, 2nd letter revealed immediately (e.g., `B O _ K`). | First & Last revealed (e.g., `B _ _ K`). | First & Last revealed (e.g., `B _ _ K`). |
| **Visual Assistance** | Active target object gently sparkles with a golden pulse. | Standard hover lens outline only. | Standard hover lens outline only. |
| **Hint Cost** | 0 points penalty. | −150 points per hint. | −250 points per hint. |
| **Example Words** | `APPLE`, `BOOK`, `BELL`, `CUP`, `PEN`, `RUG`, `TRAIN`, `KEY` | `ARMCHAIR`, `COMPASS`, `LANTERN`, `KNIGHT`, `TELESCOPE`, `TYPEWRITER` | `CHANDELIER`, `FLASK`, `PENDULUM`, `SAUCER` |

---

## Solvability Engine Details

To prevent players from spinning a letter pair with zero matching room items, the game uses a two-phase selection algorithm:

1. **Phase 1 (First Letter)**:
   The wheel spins among letters that have at least one object in the current difficulty:
   ```javascript
   const validFirsts = [...new Set(ROOM_DATA.getObjectsForDifficulty(difficulty).map(o => o.firstLetter))];
   ```
2. **Phase 2 (Ending Letter)**:
   Once the first letter $L_1$ is fixed, the second wheel dynamically updates its segments to only include ending letters $L_2$ for which a matching object exists:
   ```javascript
   const validEnds = ROOM_DATA.getValidLastLetters(L1, difficulty);
   ```
3. **Phase 3 (Target Word Selection & Hit Resolution)**:
   - The game selects a primary target from `ROOM_DATA.findMatchingObjects(L1, L2, difficulty)`.
   - Each of the 57 curiosities defines an explicit SVG silhouette outline (`path`, `polygon`, `circle`, `ellipse`, or `rect`) calibrated to the `1376×768` photographic scene.
   - Large container furniture (`desk`, `shelf`, `armchair`, `chessboard`, `rug`) is sorted to the bottom of the SVG layer, and foreground items are layered strictly from largest to smallest by geometric polygon shoelace area so smaller items contained within (or overlapping) larger items are always in the foreground.
   - If a player clicks a reasonable visual cousin or sub-part defined in `acceptedGroups` (e.g., clicking a chess piece when the target is `Chessboard`, or clicking either chair for `Chair`), it completes the round.

---

## Development & Local Testing

### Prerequisites

- A modern web browser supporting Canvas, SVG, and the Web Audio API (Chrome, Edge, Firefox, Safari).
- Node.js (v18+) for running the automated unit test suite.
- Python 3 for running the local preview server.

### 1. Automated Dictionary & Solvability Unit Tests

Run the unit test suite before and after any change to `room_data.js`:

```bash
node test_room_data.js
```

Expected output:
```
--- Testing Room Data Integrity ---
✅ PASS: ROOM_OBJECTS is an array
✅ PASS: ROOM_OBJECTS has at least 50 distinct physical objects (found 57)
...
--- Testing Alphabet Coverage (A-Z) ---
...
--- Testing Difficulty Level Engine ---
...
🎉 All tests passed successfully! Total objects: 57
```

#### What `test_room_data.js` Verifies
1. **Schema & Bounds Integrity**: Every entry in `ROOM_OBJECTS` has a unique `id`, valid `name`, matching `firstLetter` and `lastLetter`, in-bounds coordinates (`0 <= x <= 1376`, `0 <= y <= 768`), descriptive `hint`, and explicit SVG `shape`.
2. **Concrete Physical Object Invariant**: Every entry must be an actual, countable physical object—never a material or substance (`Wood`, `Gold`, `Glass`, `Sand`, `Paper`, `Ink`), an abstract concept (`Art`, `Chess`, `Zodiac`), or a vague/generic part that applies to many things in the room (`Toy`, `Ornament`, `Handle`, `Lens`, `Gear`, `Star`, `Coin`, `Utensil`, `Print`, `Shade`, `Page`, `Note`).
3. **1-to-1 Visual Hotspot Uniqueness**: Every entry has a unique `group` identifier so multiple words are never stacked onto the exact same visual object.
4. **Zero Clue Signature Collisions**: Every entry has a unique `(firstLetter, lastLetter, letterCount)` signature so no two objects ever share the same HUD clue (`First ... Last (N Letters)`).
5. **100% A–Z Solvability Across All Difficulties**: Every letter `A`–`Z` has at least one valid starting object and at least one solvable `(firstLetter, lastLetter)` pair in `beginner`, `intermediate`, and `advanced`.

### 2. Browser Self-Play Protocol (All 3 Difficulty Levels)

Whenever modifying gameplay, room geometry, or object definitions, perform real-browser self-play across all three difficulty levels:

1. **Test Coverage**:
   - Play **at least 10 different items per difficulty level** (`Beginner`, `Intermediate`, and `Advanced` — 30+ rounds total).
   - Focus specifically on **hovering** over objects in the room and **finding/clicking** the target items.
2. **Difficulty-Specific Verification**:
   - **Beginner (Ages 5+)**:
     - Verify the start screen and HUD difficulty selector switch cleanly to `Beginner`.
     - Verify 4+ letter words immediately reveal their second letter (e.g., `B O _ K`).
     - Verify the active target pulses with a warm golden outline (`.beginner-target`) in the room.
     - Verify clicking **Hint** reveals remaining letters and spotlight with `0` score penalty.
   - **Intermediate (Ages 9+)**:
     - Verify only the first and last letters are initially revealed along with the `N Letters` count badge.
     - Verify clicking **Hint** reveals unrevealed inner letters one at a time (`-150` pts) before triggering the radar spotlight.
   - **Advanced (Ages 13+)**:
     - Verify the full 57-curiosity pool (including `Chandelier`, `Flask`, `Pendulum`, `Saucer`) is active and solvable (`-250` pts per hint).

### 3. Object Selection & Ambiguity Rules

When adding or reviewing objects in `room_data.js`, check every item against these rules:

1. **Actual Objects Only (No Materials)**:
   - Ask: *"Is this word a discrete object, or is it a material/substance that many things in the room are made of?"*
   - Reject materials like `Wood` (desk, chairs, shelves, violin, clock, and chess pieces are all wood), `Glass` (window, bottles, jars, lamp shades, magnifier, and hourglasses are all glass), `Gold` (watch, chain, compass, bell, telescope, chandelier are all gold/brass), `Paper`, `Sand`, and `Ink`.
2. **Natural Full Outlines with Non-Occluded Hover Layering**:
   - Every object's SVG outline (`shape.d` / `shape.points`) traces its **complete, natural contour** (including parts partially behind foreground objects, such as the full `Rug` under the chair, the full `Armchair` behind the pillow and yarn, the full `Chessboard` under the chess pieces, and the full `Globe` behind the umbrella handle) without artificial "bite mark" cutouts.
   - Hit-testing in `room.js` preserves strict back-to-front container tier and geometric polygon shoelace area stacking order (`getSortedRoomObjects`) so smaller items sit in the foreground of any larger items containing them, and an object is hovered and outlined **only when the cursor is over a visible, non-occluded portion** of that object (`document.elementFromPoint(x, y)` at every object's visible anchor `(x, y)` resolves to that exact object).
3. **Multi-Instance Visual Consistency**:
   - If the room artwork depicts multiple instances of the same object type, the SVG path or `acceptedGroups` must cover **all of them** so the player is never penalized for clicking or hovering another visible instance:
     - **Binoculars**: All three pairs of brass binoculars — the standing field binoculars on the desk (`x: 1212, y: 595`), the brass binoculars on the upper shelf (`x: 1058, y: 372`), and the binoculars in the desk cubbyhole (`x: 1205, y: 500`).
     - **Lamp**: Both the right desk Tiffany lamp (`x: 1310, y: 240`) and the left window Tiffany lamp (`x: 204, y: 318`), plus `lantern`/`chandelier` in `acceptedGroups`.
     - **Clock**: Both the grandfather clock (`x: 418, y: 222`) and the small window mantel clock (`x: 288, y: 312`).
     - **Hourglass**: Both the desk hourglass (`x: 1086, y: 554`) and the upper shelf hourglass (`x: 996, y: 316`).
     - **Rook**: Both corner castle rooks on the chessboard (`x: 168, y: 610` and `x: 253, y: 662`).
     - **Pawn**: Individual boxes for the 7 wooden chess pawns across the chessboard.
     - **Frame**: Both upper and lower framed botanical prints on the left wall (`x: 58, y: 96` and `x: 70, y: 257`).
     - **Cross-Group Cousins (`acceptedGroups`)**: Clicking either chair counts for `Chair` or `Armchair`; clicking shelf volumes counts for `Book`; clicking any top-shelf apothecary vessel (`Flask`, `Bottle`, `Jar`) counts for any of the three; clicking any chess piece counts for `Chessboard`.

### 4. Visual Outline, Visibility & Human UX Checklist

1. **Tight Silhouette Outlines**:
   - Hover over each item and verify the golden `.hotspot-glow` outline traces the actual contours of the object in `curiosity_parlor.jpg` (e.g., the curved bouts of the `Violin`, the diagonal `Bow`, the `Bell` dome without touching the `Telescope` above it, the `Umbrella` stopping cleanly above the chair crest rail).
2. **Clear Visibility**:
   - Every object must be clearly visible and well-lit in `curiosity_parlor.jpg`. Do not place `Beginner` targets in dark shadows or on tiny `< 20px` details.
3. **Smooth Drag-to-Pan Without False Clicks**:
   - Zoom in (`+` button or scroll wheel) and drag across the room starting directly on top of objects. Verify that panning works smoothly anywhere in the viewport and that releasing the mouse after a drag (`>= 6px`) never triggers a wrong-object click penalty.
4. **Snappy, Skippable Wheel Spins**:
   - Verify wheel spins complete in ~2.8 seconds and can be fast-forwarded immediately by clicking the wheel/button or pressing `Space` / `Enter`.
5. **Race-Free Round Transitions**:
   - Rapidly click **Re-spin**, switch difficulties via the HUD pill, or start a new round immediately after finding an item. Verify that no stale timers pop up the previous round's success modal during an active round.

### 5. Running Locally with Python

From this directory, run either the included zero-cache development server or Python's built-in HTTP server:

```bash
python3 server.py 8888
```

or:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8888/` (or `http://localhost:8000/`) in your browser.

---

## Deploying to GitHub Pages

This project contains zero proprietary or internal dependencies, making it directly deployable to GitHub Pages.

### Deployment Steps

1. **Create Repository**:
   Create a new public repository on GitHub (e.g., `https://github.com/nikhilbd/spin-and-seek`).
2. **Add Files**:
   Copy the following static files into the repository root:
   - `index.html`
   - `style.css`
   - `curiosity_parlor.jpg`
   - `room.js`
   - `room_data.js`
   - `wheel.js`
   - `audio.js`
   - `game.js`
   - `README.md`
3. **Commit and Push**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Spin & Seek"
   git remote add origin https://github.com/nikhilbd/spin-and-seek.git
   git branch -M main
   git push -u origin main
   ```
4. **Enable GitHub Pages**:
   - In GitHub, navigate to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, select **Deploy from a branch**.
   - Set the branch to `main` and folder to `/ (root)`.
   - Click **Save**.
5. **Access Live Game**:
   Your game will be available at `https://nikhilbd.github.io/spin-and-seek/`.

---

## Browser Compatibility

- **Google Chrome**: Full support (desktop and mobile).
- **Mozilla Firefox**: Full support (desktop and mobile).
- **Apple Safari**: Full support (macOS and iOS/iPadOS).
- **Microsoft Edge**: Full support.

---

## License

This project is open source and available under the [MIT License](https://opensource.org/licenses/MIT).
