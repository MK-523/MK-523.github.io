# Mahesh Karthikeyan — Personal Portfolio

An immersive forest-and-lake portfolio at [mk-523.github.io](https://mk-523.github.io/), built with React, TypeScript, and Vite. GitHub Pages serves the production files checked into the root of this repository.

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

The production build includes TypeScript checking. Nine interaction tests cover device motion preferences, visibility, image failure, menu keyboard behavior, hash navigation, direct links, and focus restoration.

## Edit

- `src/content.ts`: experience, projects, campus roles, recognition, and technical skills.
- `src/App.tsx`: navigation, page sections, and original project illustrations.
- `src/AlpineHero.tsx`: the responsive landscape and device-aware parallax.
- `src/styles.css`: the complete responsive design system.
- `public/`: self-hosted fonts, original landscape WebP variants, and static metadata.

The landscape is the home view. Projects, Experience, Campus, Awards, About, and Contact open as independently scrollable panels, with navigation always available. URL hashes support direct links and browser Back/Forward. The original `#campus` link still opens campus involvement. Escape closes the mobile menu first, or returns an open section to the landscape. Keyboard focus follows the selected content.

Parallax runs only for fine pointers that permit animation. Reduced-motion and touch/coarse-pointer devices use a static scene. Automatic mist movement settles within five seconds. Motion pauses behind an open panel, outside the viewport, and when the browser tab is hidden. A gradient remains behind the text if an image fails.

See [ARTWORK.md](ARTWORK.md) for the original image prompt and asset provenance.

## Publish to the existing GitHub Pages site

```sh
npm test
npm run stage:pages
```

`stage:pages` builds the site and copies `dist/` into the repository root. It replaces generated asset folders and removes obsolete intro images without modifying source files. Commit both the source and generated production changes. Merge into `main`; the existing GitHub Pages configuration publishes from `main` at `/`.

Use only GitHub account `MK-523`. No new repository, hosting service, backend, or credentials are needed.

To roll back, revert the redesign commit on `main` so the previous source and generated site are restored together.
