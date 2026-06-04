# onepieceofdata-studio

Data-driven reels, carousels, and videos for [One Piece of Data](https://github.com/ismailsunni/onepieceofdata-react), built with [Remotion](https://www.remotion.dev/) and published as a gallery at [viz.onepieceofdata.com](https://viz.onepieceofdata.com).

Reels are short data-driven videos (1080×1920, 9:16, 30 fps) that surface charts and facts from the same Supabase backend that powers the React site.

## Setup

```bash
npm install
cp .env.example .env
# fill in SUPABASE_URL and SUPABASE_ANON_KEY (same as the React project)
```

## Develop

```bash
npm run studio          # opens the Remotion Studio for live preview
```

## Narration (optional)

Edit `narration.json`, then:

```bash
npm run narrate         # generates public/audio/*.mp3 via ElevenLabs TTS
```

Audio files are committed to the repo so renders are deterministic. The composition gates each `<Audio>` on file existence — if you skip narration, the reel still renders cleanly without sound.

## Render a reel

```bash
npm run render TopBounties out/top-bounties.mp4
```

## Project structure

```
src/
├── index.ts                       # Remotion entry — registers Root
├── Root.tsx                       # Composition registry
├── lib/
│   ├── supabase.ts                # Supabase client (Node-side, build-time)
│   └── format.ts                  # Shared formatters (₿ bounty, etc.)
└── compositions/
    └── TopBounties/
        ├── TopBounties.tsx        # The composition (React + Remotion)
        └── fetch.ts               # Supabase query
```

### Adding a new reel

1. Create `src/compositions/<Name>/<Name>.tsx` for the composition.
2. Create `src/compositions/<Name>/fetch.ts` for the Supabase query.
3. Register it in `src/Root.tsx` with a `<Composition>` block. Use `calculateMetadata` to fetch data at build time and pass it as props.

### Reel ideas (sourced from the React project's analytics)

- Top bounties leaderboard (implemented as the example)
- Devil Fruit type breakdown (Paramecia / Zoan / Logia)
- Character first-appearance timeline
- Saga-by-saga page count
- Top affiliations by member count
- Chapter release cadence over the years
- "Did you know?" facts (single-stat reels)

## Notes

- Data is fetched **once** in Node during `calculateMetadata`, then passed as static props to the composition. Compositions themselves are deterministic given their props, which is what Remotion expects.
- The Supabase anon key is read from `process.env`, so it lands in the rendered video's input props but never gets shipped to a browser.
