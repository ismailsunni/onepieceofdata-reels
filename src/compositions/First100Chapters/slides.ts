export type SlideSpec =
  | {
      kind: 'cover'
      kicker: string
      title: string
      subtitle: string
      question: string
    }
  | {
      kind: 'stat_split'
      kicker: string
      title: string
      buckets: { num: number; label: string; desc: string }[]
      footer?: string
      callout?: { num: number; label: string }
    }
  | {
      kind: 'group'
      kicker: string
      title: string
      subtitle: string
      names: string[]
    }
  | {
      kind: 'silent_list'
      kicker: string
      title: string
      subtitle: string
      // Bullets render name + auto-resolved date/arc from Supabase.
      names: string[]
      footer?: string
    }
  | {
      kind: 'thanks'
      kicker: string
      title: string
      subtitle: string
      handle: string
      stillWaiting: string[]
    }

export const SLIDES: SlideSpec[] = [
  {
    kind: 'cover',
    kicker: '100 Followers · Thank You',
    title: '122 Characters',
    subtitle: "appeared in One Piece's first 100 chapters",
    question: 'Where are they now?',
  },
  {
    kind: 'stat_split',
    kicker: 'The Split',
    title: 'As of ch 1182',
    buckets: [
      { num: 25, label: 'Drawn in Elbaf', desc: 'Still on the page in the current arc' },
      { num: 28, label: 'Last Seen in Egghead', desc: 'Cameos during the previous arc' },
      { num: 69, label: 'Before Egghead', desc: 'Not redrawn since' },
    ],
    callout: { num: 26, label: 'one-chapter wonders — drawn once, never again' },
  },
  {
    kind: 'group',
    kicker: 'Still Drawn · S-Tier',
    title: 'The Headliners',
    subtitle: 'All currently in Elbaf',
    names: [
      'Monkey D. Luffy',
      'Roronoa Zoro',
      'Nami',
      'Usopp',
      'Sanji',
      'Shanks',
      'Buggy',
    ],
  },
  {
    kind: 'group',
    kicker: 'Still Drawn · Elbaf',
    title: 'The Village Reunion',
    subtitle: 'Old faces redrawn during the Elbaf arc',
    names: [
      'Makino',
      'Woop Slap',
      'Kaya',
      'Tamanegi',
      'Bell-mère',
      'Nojiko',
      'Genzo',
      'Zeff',
      'Gaimon',
      'Bogard',
    ],
  },
  {
    kind: 'group',
    kicker: 'Still Drawn · Legends',
    title: 'Legends Still on the Board',
    subtitle: 'Last drawn in Elbaf',
    names: [
      'Dracule Mihawk',
      'Silvers Rayleigh',
      'Monkey D. Garp',
      'Monkey D. Dragon',
      'Gol D. Roger',
      'Scopper Gaban',
    ],
  },
  {
    kind: 'group',
    kicker: 'Still Drawn · Quiet',
    title: 'Quiet Appearances',
    subtitle: 'Late 2025 — barely there but still on the page',
    names: ['Hatchan', 'John Giant'],
  },
  {
    kind: 'group',
    kicker: 'Fading · Side Cast',
    title: 'No Elbaf Cameo (Yet)',
    subtitle: 'Old villagers last drawn in Egghead — April 2024',
    names: ['Chouchou', 'Boodle', 'Merry', 'Ninjin', 'Piiman'],
  },
  {
    kind: 'group',
    kicker: 'Fading · Red-Hair Crew',
    title: 'The Red-Hair Roll-Call',
    subtitle: 'All last drawn in chapter 1126 — September 2024',
    names: ['Benn Beckman', 'Yasopp', 'Lucky Roux', 'Bonk Punch', 'Hongo', 'Monster'],
  },
  {
    kind: 'group',
    kicker: 'Fading · Marines',
    title: 'The Marines, Fading',
    subtitle: 'Last drawn in the Egghead arc (2023 – 2024)',
    names: ['Smoker', 'Koby', 'Helmeppo', 'Tashigi', 'Brannew'],
  },
  {
    kind: 'group',
    kicker: 'Long Gone · East Blue Villains',
    title: 'East Blue Villains, Last Sighting',
    subtitle: 'Last drawn during the Egghead arc (2023 – 2024)',
    names: [
      'Kuro',
      'Arlong',
      'Morgan',
      'Jango',
      'Fullbody',
      'Cabaji',
      'Mohji',
      'Krieg',
      'Gin',
      'Pearl',
      'Alvida',
    ],
  },
  {
    kind: 'group',
    kicker: "Long Gone · Zoro's Past",
    title: 'The Dojo, Drawn Apart',
    subtitle: "Koushirou last seen in Egghead (May 2024). Kuina, six months earlier.",
    names: ['Koushirou', 'Kuina'],
  },
  {
    kind: 'silent_list',
    kicker: 'Long Gone · Silence',
    title: 'Truly Gone',
    subtitle: 'Names One Piece has not redrawn in years',
    names: [
      'Buchi',
      'Sham',
      'Mornin',
      'Ririka',
      'Sam',
      'Higuma',
      'Yosaku',
      'Johnny',
      'Chew',
      'Kuroobi',
    ],
  },
  {
    kind: 'thanks',
    kicker: '100 Followers',
    title: 'Thank you.',
    subtitle: 'Charts, rankings, and chapter stats every week.',
    handle: '@onepieceofdata',
    stillWaiting: ['Buchi', 'Sham', 'Mornin', 'Higuma', 'Ririka'],
  },
]
