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

The opening is an unobstructed landscape. Click the scene, scroll, swipe, or use the compact journey controls to open Projects on a white page while the entire scene contracts into a small circular window. Continue to expand the scene and travel across the lake, then enter Experience at the next stop. Campus, Awards, About, and Contact follow in their own stops. Direct section links remain available at all sizes, including the original `#campus` anchor.

Long sections scroll within the white reading area. A new scroll gesture at its boundary advances the journey; scrolling outside the reading area or clicking the circle/white space also advances. Trackpad momentum cannot skip stops. Previous view and upward scrolling reverse the sequence. Escape returns from reading to the same lake stop. URL hashes preserve reading and travel states for direct links and browser Back/Forward. Focus follows the active section, and inactive content is removed from the keyboard and accessibility order.

- `src/content.ts`: existing projects, experience, campus, awards, and skills.
- `src/PortfolioSections.tsx`: readable work lists and contact destinations.
- `src/App.tsx`: the scene/reading composition and controls.
- `src/useJourney.ts`: alternating travel/reading state, input handling, hashes, and focus.
- `src/LakeScene.tsx`: image readiness, animation scheduling, motion preferences, and GPU lifecycle.
- `src/lake-renderer.ts`: camera travel, reflected water, wind waves, rain ripples, mist, clouds, and diagonal drizzle.
- `src/styles.css`: responsive white reading pages and the contracting landscape circle.
- `public/`: self-hosted fonts, original artwork, and static metadata.

The renderer runs at a maximum of 30 frames/second (24 for coarse pointers), caps resolution, and stops in hidden tabs. Scene settings can pause animation. System reduced motion disables weather, camera animation, and CSS transitions while preserving every interaction. Image/GPU failure retains a photographic or gradient fallback. Content never depends on the renderer loading. No backend, external public API, or added runtime dependency is used.

The landscape is original Himalayan-inspired artwork, with procedural water and weather over a panoramic backdrop. See [ARTWORK.md](ARTWORK.md) for the generation prompt and provenance.

## Publish through the existing GitHub Pages configuration

```sh
npm test
npm run stage:pages
```

`stage:pages` builds and copies `dist/` into the repository root. It replaces generated asset folders without modifying source files. Commit the source and generated files together, then merge into `main`. The existing GitHub Pages configuration publishes from `main` at `/`.

Use only GitHub account `MK-523`. To roll back, revert the change on `main` so source and generated files are restored together.
