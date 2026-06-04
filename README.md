# onepieceofdata-studio

Data-driven **reels, carousels, and videos** for [One Piece of Data](https://github.com/ismailsunni/onepieceofdata-react), built with [Remotion](https://www.remotion.dev/) and sourced from the same Supabase backend that powers the React site.

**▶ Live gallery: [viz.onepieceofdata.com](https://viz.onepieceofdata.com)** — preview every composition in the browser, filter by format/status, scrub frame-by-frame.

Compositions are short, deterministic, data-driven videos: a Supabase query runs once at build time and is passed in as static props, so the same data always renders the same frames.

## What's inside

**Reels** — 1080×1920, 9:16, 30 fps:

| Composition | What it shows |
|---|---|
| `LowestBounties` | The 10 lowest pirate bounties, revealed bottom-up — Chopper (฿1K) as the punchline. |
| `TopBounties` | Highest active bounties leaderboard. |
| `AppearanceRace` | Bar-chart race of character appearances over a rolling chapter window, Ch.1 → Marineford. |
| `ArcLengthRanking` | Every arc ranked by chapter count, revealed in story order. |
| `TopSnubbed` | Characters with the biggest gap between popularity and screen time. |
| `EastBlueWeakest` | Sea-by-sea breakdown of the weakest fighters. |

**Carousels** — 1080×1350, multi-slide (rendered one PNG per slide):

| Composition | What it shows |
|---|---|
| `Top100Wishlist` | Ranked snapshot of the community wishlist. |
| `First100Chapters` | Early-era characters at the 100-follower milestone. |
| `VanishedPreSkip` | Characters last seen before the time skip — who's still missing. |

**Web gallery** (`web/`) — a Vite + React app that plays each composition via [`@remotion/player`](https://www.remotion.dev/player) from prebaked JSON snapshots, with format/status filters, a dark/light/system theme, and autoplay. Deployed to GitHub Pages at [viz.onepieceofdata.com](https://viz.onepieceofdata.com).

## Setup

```bash
npm install
cp .env.example .env
# fill in SUPABASE_URL and SUPABASE_ANON_KEY (same as the React project)
```

## Develop

```bash
npm run studio          # Remotion Studio — live preview of every composition
npm run web:dev         # the browser gallery (Vite dev server)
npm run lint            # type-check (tsc --noEmit)
```

## Render

```bash
# A reel → MP4
npm run render LowestBounties out/lowest-bounties.mp4

# A carousel → one PNG per slide, into out/carousel/<CompositionId>/
npm run carousel -- Top100Wishlist
```

## Narration (optional)

Edit `narration.json`, then:

```bash
npm run narrate         # generates public/audio/*.mp3 via ElevenLabs TTS
npm run voices          # list available ElevenLabs voices
```

Audio files are committed so renders stay deterministic. Each `<Audio>` is gated on file existence — skip narration and the reel still renders cleanly without sound.

## Web gallery & deployment

The gallery never touches Supabase from the browser. Instead, snapshots are baked at build time:

```bash
npm run web:snapshots   # query Supabase → web/public/snapshots/<Id>.json
npm run web:build       # static build into web/dist
npm run web:preview     # preview the production build locally
```

On every push to `master`, `.github/workflows/pages.yml` runs the snapshot build (using the `SUPABASE_URL` / `SUPABASE_ANON_KEY` repo secrets), builds the site with `VITE_BASE=/`, and deploys to GitHub Pages. The custom domain `viz.onepieceofdata.com` is set via `web/public/CNAME`.

The browser-side composition registry lives in `web/src/compositions.ts` and mirrors `src/Root.tsx`, plus editorial metadata (`createdAt`, `status`, `publication`, `tags`).

## Project structure

```
src/
├── index.ts                  # Remotion entry — registers Root
├── Root.tsx                  # Composition registry (id, dimensions, calculateMetadata)
├── lib/
│   ├── supabase.ts           # Supabase client (Node-side, build-time only)
│   └── format.ts             # Shared formatters (₿ bounty, etc.)
└── compositions/
    └── <Name>/
        ├── <Name>.tsx        # The composition (React + Remotion)
        └── fetch.ts          # Supabase query / snapshot loader

web/                          # Browser gallery (Vite + React + @remotion/player)
├── src/
│   ├── App.tsx               # Filters, theme chooser, gallery grid
│   ├── CompositionCard.tsx   # Per-composition player + metadata
│   └── compositions.ts       # Registry + editorial metadata (mirrors Root.tsx)
└── public/
    ├── CNAME                 # viz.onepieceofdata.com
    └── snapshots/<Id>.json   # baked at build time (gitignored)

scripts/
├── build-snapshots.ts        # baked snapshots for the gallery
├── render-carousel.ts        # render a carousel to PNGs
└── generate-narration.ts     # ElevenLabs TTS
```

## Adding a new composition

Follow the [composition guidelines](docs/composition-guidelines.md) for canvas, duration, footer/chapter conventions, safe zones, and motion.

1. Create `src/compositions/<Name>/<Name>.tsx` (the composition) and `fetch.ts` (the Supabase query).
2. Register it in `src/Root.tsx` with a `<Composition>` block — use `calculateMetadata` to fetch data once at build time and pass it as props.
3. To surface it in the web gallery:
   - add a task to `scripts/build-snapshots.ts` so its snapshot is baked,
   - add an entry to `web/src/compositions.ts` (with `kind`, `createdAt`, `status`, `tags`).

## Notes

- Data is fetched **once** in Node during `calculateMetadata`, then passed as static props. Compositions are deterministic given their props — what Remotion expects.
- The Supabase anon key is read from `process.env`, so it stays in the build/render environment and is never shipped to a browser (the gallery only ever reads the prebaked snapshot JSON).
