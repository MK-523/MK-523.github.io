# Mahesh’s explorable portfolio park

A full-screen illustrated park built with React, TypeScript, and Vite. Walk a small explorer through a 3000 × 2200 landscape with six portfolio destinations, an orchard, waterfall, stone circle, island pavilion, connected trail loops and two bridges. The world is the website; content opens in focused overlays.

## Local preview

Requires Node.js 22.12+ or 24+.

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

Preview: http://127.0.0.1:5173/

```sh
npm test
npm run build
npm run format:check
```

The build runs TypeScript checks and writes ignored `dist/`. `npm run preview -- --host 127.0.0.1` serves that production build.

## Explore

- WASD / arrows: walk. E / Enter near a place: visit. Escape: stop walking or close a panel.
- Click or tap the landscape: walk there. Click a place sign: find a safe route, walk there, and open its content.
- Mobile direction buttons: hold to walk; release or cancel to stop.
- Directory: open any section immediately, or choose “Walk there.” No content is locked behind progress.
- Map: open the full park map; tap any point or choose a named destination to walk there. Four optional collectibles sit off the main routes and are collected by walking near them.
- Recenter: return to the entrance. Motion control: stop ambient animation. Live system reduced-motion preferences take priority.
- The workshop contains four projects; the greenhouse contains experience; the reading grove contains about/skills; the postbox contains contact links; the campsite contains community; the lookout contains milestones.

The camera follows the character within the world. Buildings, tree trunks, and the pond block movement; the bridge is traversable. Click movement uses grid pathfinding and line-of-sight smoothing. Progress counts each of six portfolio places and each optional collectible once during the current page visit; no storage or account is required. Attraction labels and functional controls remain; decorative captions, welcome prose, and the bottom-center route banner have been removed.

Dialogs support focus cycling, Escape, backdrop and explicit close, and focus return. Project details focus their heading and return focus to their card. Offscreen signs are excluded from keyboard tab order; Directory remains reachable. Existing anchors `#projects`, `#experience`, `#about`, `#contact`, `#campus`, and `#awards` open the respective panel directly.

## Edit

- `src/App.tsx`: game loop, camera, navigation, HUD, mobile controls, dialogs, progress and motion preferences.
- `src/park.ts`: world layout, collision geometry, proximity and pathfinding.
- `src/ParkArt.tsx`: original SVG scenery, buildings, trees and character.
- `src/ParkExpansion.tsx`: orchard, waterfall, stone circle, island pavilion and expanded trails.
- `src/ParkMap.tsx`: shared minimap and interactive destination map, derived from the world geometry.
- `src/ParkPanel.tsx`: portfolio content overlays and project details.
- `src/styles.css`: responsive world, HUD, panels and animation.
- `src/content.ts`: original factual portfolio content, unchanged.
- `src/park.test.ts` and `src/park-ui.test.tsx`: movement, routes, collisions, content access, focus and motion tests.

No resume existed in the source, so no resume button or generated resume has been added. Experience is directly accessible.

## Preserved work

The field-guide iteration is preserved in `src/FieldGuide.tsx`, `src/field-guide.css`, `src/NatureWorld.tsx`, and its tests. The original lake implementation is preserved in `src/LakeJourney.tsx` and its existing supporting modules/tests. Neither previous interface is mounted by the production entry point. The new app reuses only the small sprout icon from `NatureWorld`.

The historical image assets remain on disk, while the park itself is rendered as SVG. The social preview retains the existing Himalayan image.

## GitHub Pages

GitHub Pages serves the root of `main` at https://mk-523.github.io/ . Source files live in `src/`; the local production build is generated in ignored `dist/`.

```sh
npm test
npm run format:check
npm run stage:pages
```

`stage:pages` runs the production build and copies its generated output into the repository root. Commit the source and generated output together, then push to `main` to trigger the existing GitHub Pages deployment. Keep local QA screenshots, review notes and metadata out of the repository; `qa/` is ignored.
