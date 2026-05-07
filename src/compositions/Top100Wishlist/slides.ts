// Editorial deck for the IG carousel. Each entry becomes one slide (PNG).
// Character lookups use `name` (matches `character.name` in Supabase). If a
// name doesn't resolve, fetch.ts logs a warning and the slide falls back to
// the supplied displayName + a placeholder portrait.

export type RankingAxis =
  | 'appearance_count' // primary value = chapter appearance_count
  | 'last_appearance' // last_appearance chapter number
  | 'first_appearance' // first_appearance chapter number
  | 'arc_count' // length of arc_list
  | 'bounty' // highest known bounty in berries

export type RankingSubline =
  | 'auto' // axis-driven default
  | 'first_arc' // "First arc: <title>"
  | 'last_arc' // "Last arc: <title>"
  | 'none'

export type SlideSpec =
  | {
      kind: 'cover'
      title: string
      subtitle: string
      kicker: string
    }
  | {
      kind: 'character'
      name: string
      headline: string
      pitch: string
      showSpan?: boolean
    }
  | {
      kind: 'pair'
      names: [string, string]
      groupName: string
      pitch: string
      showRankExSHP?: boolean
    }
  | {
      kind: 'group'
      names: string[]
      groupName: string
      pitch: string
    }
  | {
      kind: 'honorable'
      names: string[]
      title: string
      subtitle: string
    }
  | {
      kind: 'ranking'
      kicker: string
      title: string
      subtitle?: string
      /** Five (or so) character names, in display order. */
      names: string[]
      axis: RankingAxis
      /** Suffix shown next to the value, e.g. "ch.", "last seen ch.", "debut". */
      valueLabel: string
      /** Show the top-100 rank badge for entries that are in the top 100. */
      showTop100Rank?: boolean
      /** Override the default subline beneath each character's name. */
      subline?: RankingSubline
    }
  | {
      kind: 'caveats'
      kicker: string
      title: string
      subtitle: string
      /** Hardcoded entries (not all are in our Supabase). */
      entries: {
        name: string
        rank: number | null
        imageUrl: string
        note: string
      }[]
      footer: string
    }
  | {
      kind: 'follow'
      kicker: string
      handle: string
      title: string
      subtitle: string
      voteHeader: string
      voteName: string
      voteReason: string
    }
  | {
      kind: 'cta'
      kicker: string
      title: string
      url: string
    }

// WT100 site face URL pattern (used for ships / animals not in our Supabase).
const wt100Face = (id: string) =>
  `https://onepiecewt100-2026.com/assets/faces/${id}.png?v=gjdgxu`

export const SLIDES: SlideSpec[] = [
  {
    kind: 'cover',
    kicker: 'WT100 2026',
    title: 'Mid-Term Top 100,\nanalyzed.',
    subtitle: 'Who really earned a spot? The numbers tell the story.',
  },
  {
    kind: 'ranking',
    kicker: 'Inside the Top 100',
    title: 'Fewest Chapters',
    subtitle: 'You voted them in. They barely show up.',
    // Pandaman excluded — undercounted in our scrape.
    names: ['Joy Boy', 'Uta', 'Rockstar', 'Demalo Black', 'Chouchou'],
    axis: 'appearance_count',
    valueLabel: 'chapters',
    showTop100Rank: true,
    subline: 'first_arc',
  },
  {
    kind: 'ranking',
    kicker: 'Inside the Top 100',
    title: 'Longest Absence',
    subtitle: 'Fan-favourites we haven’t seen in 100+ chapters.',
    names: [
      'Cavendish',
      'Enel',
      'Charlotte Perospero',
      'Donquixote Rosinante',
      'Basil Hawkins',
    ],
    axis: 'last_appearance',
    valueLabel: 'last seen ch.',
    showTop100Rank: true,
  },
  {
    kind: 'ranking',
    kicker: 'Inside the Top 100',
    title: 'Newest Debuts',
    subtitle: 'Voted in before they had a story.',
    names: ['Manmayer Gunko', 'Joy Boy', 'Lilith', 'Uta', 'Ulti'],
    axis: 'first_appearance',
    valueLabel: 'debut ch.',
    showTop100Rank: true,
  },
  {
    kind: 'ranking',
    kicker: 'Outside the Top 100',
    title: 'Many chapters,\nbut ignored.',
    subtitle: 'They carry the story. Fans left them off the list.',
    names: [
      "Kin'emon",
      'Kouzuki Momonosuke',
      'Napoleon',
      'Hatchan',
      'Hattori',
    ],
    axis: 'appearance_count',
    valueLabel: 'chapters',
  },
  {
    kind: 'ranking',
    kicker: 'Outside the Top 100',
    title: 'Across many arcs,\nbut forgotten.',
    subtitle: 'Show up everywhere in the story. Nowhere on the list.',
    names: ['Sengoku', 'Fullbody', 'Galdino', 'Jango', 'Nefertari Cobra'],
    axis: 'arc_count',
    valueLabel: 'arcs',
  },
  {
    kind: 'ranking',
    kicker: 'Outside the Top 100',
    title: 'High bounty,\nlow votes.',
    subtitle: 'Marine threat level: maximum. Fan support: minimal.',
    names: ['Aramaki', 'Brogy', 'Dorry', 'Queen', 'Jack'],
    axis: 'bounty',
    valueLabel: 'berries',
  },
  {
    kind: 'caveats',
    kicker: 'Honest Caveats',
    title: 'Not Everyone Counts.',
    subtitle:
      'The Top 100 includes 2 ships and 1 animal — our dataset doesn’t cover them.',
    entries: [
      {
        name: 'Going Merry',
        rank: 41,
        imageUrl: wt100Face('0011'),
        note: 'Ship · not tracked',
      },
      {
        name: 'Thousand Sunny',
        rank: 78,
        imageUrl: wt100Face('0012'),
        note: 'Ship · not tracked',
      },
      {
        name: 'Kung-Fu Dugong',
        rank: 65,
        imageUrl: wt100Face('0183'),
        note: 'Animal · ~5 chapters',
      },
    ],
    footer:
      'Pandaman (#100) also excluded — easter-egg appearances under-counted in our scrape.',
  },
  {
    kind: 'follow',
    kicker: 'One Last Thing',
    handle: '@onepieceofdata',
    title: 'Follow for more\nOne Piece Insight,\nbased on Data.',
    subtitle: 'Charts, rankings, and weekly chapter stats.',
    voteHeader: 'Our cheeky pick',
    voteName: 'Gaimon',
    voteReason:
      "Stuck in a treasure chest his whole life — and helped Buggy become Yonko. Vote Gaimon #1.",
  },
  {
    kind: 'cta',
    kicker: 'WT100 2026 · Final Round',
    title: 'Vote with the data.',
    url: 'onepiecewt100-2026.com',
  },
]
