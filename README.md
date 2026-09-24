# Mahesh Karthikeyan — Personal Portfolio

A living Himalayan lake journey at [mk-523.github.io](https://mk-523.github.io/), built with React, TypeScript, Vite, and a small custom WebGL2 renderer. GitHub Pages serves the generated production files committed at the repository root.

## Develop and verify

Requires Node.js 22.12+ or 24+.

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
npm run format:check
```

The build includes TypeScript checking. Interaction tests cover animation lifecycle, visibility, device motion preferences, image/GPU failure, alternating navigation, wheel momentum, reading scroll, keyboard and touch input, hashes, and focus.

## Experience and editing

The opening is an unobstructed landscape, with a camera that continuously moves forward toward the mountains. Each successive section takes the camera farther across the lake. The opening is free exploration: clicks and drags do not reveal content, and no timer opens a section. The first scroll or Page Down moves farther across the lake. A second deliberate gesture opens Projects on a white page while the entire scene contracts into a small circular window. Section links bypass this approach immediately. Later stops alternate between the lake and content with a click or scroll. Drag with a mouse or touch to look around the full 360-degree horizon and up toward the sky or down toward the water. On touch devices, use the section links to leave opening exploration; swiping the landscape is reserved for looking around. Left and right arrow keys also adjust the view when the landscape is focused. The circle transition scales and clips one fixed-size rendering surface, so it does not repeatedly resize or clear the canvas. Campus, Awards, About, and Contact follow in their own stops. Direct section links remain available at all sizes, including the original `#campus` anchor.

Long sections scroll within the white reading area. A new scroll gesture at its boundary advances the journey; scrolling outside the reading area or clicking the circle/white space also advances. Trackpad momentum cannot skip stops. Upward scrolling reverses the sequence. Escape returns from reading to the same lake stop. URL hashes preserve reading and travel states for direct links and browser Back/Forward. Focus follows the active section, and inactive content is removed from the keyboard and accessibility order.

- `src/content.ts`: existing projects, experience, campus, awards, and skills.
- `src/PortfolioSections.tsx`: readable work lists and contact destinations.
- `src/App.tsx`: the scene/reading composition and controls.
- `src/useLandscape.ts`: drag/tap separation, keyboard look controls, and fixed-surface circle sizing.
- `src/useJourney.ts`: alternating travel/reading state, input handling, hashes, and focus.
- `src/LakeScene.tsx`: image readiness, animation scheduling, motion preferences, and GPU lifecycle.
- `src/lake-renderer.ts`: camera travel, reflected water, wind waves, rain ripples, mist, clouds, and diagonal drizzle.
- `src/skyline.ts`: conservative artwork ridge envelopes that keep the animated sky separate from rock and snow.
- `src/styles.css`: responsive white reading pages and the contracting landscape circle.
- `public/`: self-hosted fonts, original artwork, and static metadata.

Shader compilation is polled asynchronously where supported, keeping the fallback and navigation responsive until the first rendered frame. The renderer runs at a maximum of 60 frames/second (30 for coarse pointers), caps resolution, and stops in hidden tabs. System reduced motion disables weather, camera animation, and CSS transitions while preserving every interaction. Image/GPU failure retains a photographic or gradient fallback. Content never depends on the renderer loading. No backend, external public API, or added runtime dependency is used.

The landscape is original Himalayan-inspired artwork, with procedural water and weather inside a surrounding photographic horizon. It supports unlimited horizontal turns, with seamless texture derivatives and a softly blended wrap boundary; the mountains are a panoramic environment rather than scanned 3D terrain. Four overlapping mountain-detail textures provide about 3.4 times the previous source resolution per direction. AVIF is preferred with WebP fallbacks. A separate cloud-only texture now drifts behind protected mountain outlines. A second high cloud layer, two valley mist altitudes, moving cloud shadows and wind gusts evolve continuously and appear in the water reflections. Initial landscape imagery totals 504,145 bytes (745,414 with the lower-resolution WebP cloud fallback); side and rear details wait until visitors look around. Only the primary fallback is preloaded. Desktop rendering supports 1920 × 1200 while mobile retains its lower GPU budget. See [ARTWORK.md](ARTWORK.md) for the generation prompt and provenance.

## Publish through the existing GitHub Pages configuration

```sh
npm test
npm run stage:pages
```

`stage:pages` builds and copies `dist/` into the repository root. It replaces generated asset folders without modifying source files. Commit the source and generated files together, then merge into `main`. The existing GitHub Pages configuration publishes from `main` at `/`.

Use only GitHub account `MK-523`. To roll back, revert the change on `main` so source and generated files are restored together.
