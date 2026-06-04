# Composition guidelines

Conventions for building reels and carousels in this repo, distilled from the
existing compositions. Follow these so everything stays consistent on the
[viz.onepieceofdata.com](https://viz.onepieceofdata.com) gallery and on social.

> These are guidelines, not hard rules — but deviate on purpose, not by accident.

---

## 1. Format & canvas

| Format | Size | Aspect | fps | Notes |
|---|---|---|---|---|
| **Reel** | 1080 × 1920 | 9:16 | 30 | Motion video → MP4. |
| **Carousel** | 1080 × 1350 | 4:5 | 1 | One frame = one slide. Each `remotion still --frame=N` renders slide N as a PNG. |

Export the canvas constants the gallery needs from the composition module
(`SLIDE_WIDTH` / `SLIDE_HEIGHT`, or `*_WIDTH` / `*_HEIGHT` / `*_FPS` for
non-standard reels) so `web/src/compositions.ts` can import them.

## 2. Duration (reels)

- **Aim for ≤ 15s, ideally ~10s.** Short reels retain better.
- Derive the duration from the data — don't hard-code a frame count when the
  row/slide count varies. Export a `totalFramesFor(count)` (or `totalFrames`)
  helper and use it in both `Root.tsx` (`durationInFrames` /
  `calculateMetadata`) and the web registry.
- Budget: brief title in, staggered reveal, a readable end-hold (~2–3s).

## 3. Footer watermark — **required**

Every composition must carry the site watermark.

```
onepieceofdata.com
```

Canonical style (bottom-center, understated):

```ts
{
  position: 'absolute',
  bottom: 48,              // 40–56 depending on safe zone
  left: 0,
  right: 0,
  textAlign: 'center',
  fontSize: 22,
  letterSpacing: '0.1em',
  fontWeight: 600,
  // ~0.45 opacity, adapted to the background:
  color: 'rgba(245,245,245,0.45)',   // on dark bg
  // color: 'rgba(21,35,59,0.5)',    // on light bg
}
```

Keep it inside the bottom safe zone (see §5) so Instagram's caption/CTA UI
doesn't cover it. The only composition currently missing the footer is the
legacy `TopBounties` — add it if you touch that file.

## 4. Chapter label — when the data is time-sensitive

If a composition's numbers depend on **how much manga has been published**
(appearance counts, "last seen", rankings that shift with new chapters), stamp
the chapter it's current as of, so the reel doesn't silently go stale:

- Static "as of" label near the title or footer: `data through ch. {latestChapter}` or `ch. {latestChapter}`.
- Live counter that animates with the timeline (e.g. a bar-chart race): `Ch. {chapter}`.

Fetch `latestChapter` in the same `calculateMetadata` pass and thread it through
props. Compositions whose data is **timeless** (e.g. confirmed bounties) don't
need a chapter label.

## 5. Safe zones (Instagram)

Reels get UI chrome over the canvas. Keep critical content within:

- **Top:** ~210–220px (username chip).
- **Bottom:** ~320–340px (caption + reactions + CTA).

Use these as content insets (`SAFE_TOP` / `SAFE_BOTTOM`). The footer watermark
sits below the content but should still clear the very bottom.

## 6. Typography

- Base font: `const SANS = 'system-ui, -apple-system, sans-serif'`.
- Numbers that update or align in columns: a monospace stack
  (`'ui-monospace, SFMono-Regular, Menlo, monospace'`) and/or
  `fontVariantNumeric: 'tabular-nums'`.
- Titles bold (700–800), large; supporting/meta text lighter and smaller.

## 7. Color

- **Accent:** gold `#fbbf24` (brand default for ranks, figures, highlights).
- Backgrounds are full-bleed gradients, e.g. the purple
  `linear-gradient(180deg, #2a0b3a 0%, #5b1d6e 45%, #1a0a2e 100%)`. Pick a
  gradient that fits the topic; keep enough contrast for white/dark text.
- Reuse `lib/format.ts` for value formatting (e.g. `formatBerry` → `₿1.0K`).

## 8. Motion

- Entrances use `spring()` (a damping ~14 / stiffness ~120 feel is common).
- Reveal lists with a per-item **stagger**; bottom-up reveal works well when the
  last item is the punchline.
- A short title beat (fade or center-hold-then-rise) before the content reads
  well — keep intros tight (~0.5s holds, not multi-second).
- All motion must be **deterministic** from `frame` — no `Date.now()` /
  `Math.random()`.

## 9. Data

- Fetch **once** in Node during `calculateMetadata`; pass results as static
  props. The composition is a pure function of its props.
- Keep the Supabase query in the composition's `fetch.ts`. The anon key is read
  from `process.env` and must never reach the browser — the gallery only reads
  prebaked snapshot JSON.

## 10. Web gallery integration

When a composition should appear on the gallery:

1. Add a task to `scripts/build-snapshots.ts` so its snapshot is baked.
2. Add an entry to `web/src/compositions.ts` with:
   - `kind`: `'reel' | 'carousel' | 'video'`
   - `createdAt` (ISO date — seed from the first git commit)
   - `status`: `'draft' | 'scheduled' | 'published'`
   - `publication` (once it's posted: platform + url)
   - `tags`
   - `title`, `description`, dimensions, `fps`, `snapshotPath`, `durationInFrames`

---

## New-composition checklist

- [ ] Correct canvas & fps for the format (§1)
- [ ] Duration derived from data; reel ≤ 15s (§2)
- [ ] `onepieceofdata.com` footer present (§3)
- [ ] Chapter label if data is time-sensitive (§4)
- [ ] Content within IG safe zones (§5)
- [ ] `SANS` font; tabular numbers where needed (§6)
- [ ] Gold `#fbbf24` accent; shared formatters (§7)
- [ ] Deterministic spring/stagger motion (§8)
- [ ] Data fetched once in `calculateMetadata` (§9)
- [ ] Snapshot task + gallery registry entry with metadata (§10)
