# Himalayan lake artwork

Created with the built-in imagegen tool on September 23, 2026. The selected output is a 1942 × 809 panoramic image, edited from an earlier original Himalayan lake generation using a reference image. This is Himalayan-inspired artwork with Gokyo/Khumbu character, not a photograph or geographically exact reconstruction.

The portfolio uses 960-pixel (83,670 bytes) and 1920-pixel (262,150 bytes) WebP exports. Only the responsive primary landscape is preloaded; the WebGL renderer reuses that same image as its texture. The panorama is a photographic backdrop. Water reflections and ripples, rain impact rings, diagonal drizzle, clouds, mist, and camera movement are implemented in the original `src/lake-renderer.ts` shader.

Production assets: `public/images/himalayas-960.webp` and `public/images/himalayas-1920.webp`.

Instrument Serif and Inter are self-hosted; their SIL Open Font Licenses are in `public/fonts/`.

## Mode and source

Imagegen reference-image edit. Selected generated file: `exec-64d9dbae-935c-45fe-bddd-18f02e262433.png`. Reference: the original Himalayan image generated in the same session, `exec-8054921a-30ee-46b9-b9bc-b8113e396cea.png`. Earlier forest and portrait-oriented iterations were not selected.

## Final prompt

Use case: photorealistic-natural.
Asset: very wide photographic backdrop for a real-time Himalayan lake scene.
Create a NEW panoramic version of the attached Himalayan lake image, using it as a visual reference. Preserve the imposing main snow-covered Himalayan pyramid, the glaciers, weather, subtle muted colors, and cold turquoise glacial lake. Extend the natural mountain range on BOTH sides to create a truly wide panoramic photograph. Crucially: output image aspect ratio 2.4:1 (for example 2400x1000), NOT 3:2. Compose the entire central peak clearly within the frame, with visible cloudy sky above it. The view must encompass more distant mountains horizontally without flattening, squashing, or stretching the peaks. Documentary expedition photograph, Gokyo/Khumbu Himalayan character, above the treeline with NO forests. Sparse rain atmosphere and low clouds, realistic geology, majestic immense scale, not fantasy, not illustration. Distant level shoreline precisely 62 percent down the frame, all terrain above it. Bottom 38 percent uninterrupted calm turquoise lake, no near rocks, no foreground objects, no boat, no people, no flags, no buildings, no text. This is a photographic environment texture; do not add any website content.

