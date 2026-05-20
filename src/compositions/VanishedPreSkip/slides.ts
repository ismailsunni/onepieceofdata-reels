export type SlideSpec =
  | {
      kind: 'cover'
      kicker: string
      title: string
      subtitle: string
      question: string
    }
  | {
      kind: 'criteria'
      kicker: string
      title: string
      buckets: { num: string; label: string; desc: string }[]
      footer?: string
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
      names: string[]
      footer?: string
    }
  | {
      kind: 'thanks'
      kicker: string
      title: string
      subtitle: string
      handle: string
    }

// 31 characters with >10 pre-timeskip appearances and 0 post-timeskip frames
// (timeskip = end of ch 597). Source: scripts/preskip-vanished.ts
export const ALL_VANISHED: string[] = [
  'Franky Family',
  'Gedatsu',
  'Gem',
  'Gomorrah',
  'Sodom',
  'Schollzo',
  'Spacey',
  'Zala',
  'Goro',
  'Kop',
  'Su',
  'Babe',
  'Oars',
  'Dago',
  'Footbianco',
  'Galaxy',
  'Ohm',
  'Hogback',
  'Ottoland',
  'Dirt Boss',
  'Shura',
  'Chess',
  'Cosmo',
  'Itomimizu',
  'Kebi',
  'Kuromarimo',
  'Victoria Cindry',
  'Chuchun',
  'Holy',
  'Haruta',
  'Kalgara',
]

// Names featured on grouped/spotlight slides — excluded from the residual "silent list" slide.
const FEATURED = new Set<string>([
  'Gedatsu',
  'Ohm',
  'Shura',
  'Chess',
  'Kuromarimo',
  'Hogback',
  'Victoria Cindry',
  'Oars',
  'Franky Family',
  'Sodom',
  'Gomorrah',
  'Gem',
  'Zala',
  'Babe',
  'Haruta',
  'Kalgara',
])

export const REMAINDER: string[] = ALL_VANISHED.filter((n) => !FEATURED.has(n))

export const SLIDES: SlideSpec[] = [
  {
    kind: 'cover',
    kicker: 'Pre-Skip · Long Gone',
    title: '31 Characters',
    subtitle:
      'showed up more than 10 times before the timeskip — and have not been drawn since',
    question: 'Where did they go?',
  },
  {
    kind: 'criteria',
    kicker: 'The Filter',
    title: 'How we count "gone"',
    buckets: [
      { num: '> 10', label: 'Pre-timeskip appearances', desc: 'Recurring, not a one-chapter cameo' },
      { num: '0', label: 'Post-timeskip appearances', desc: 'No story panel, no cover, no flashback' },
      { num: '598+', label: 'The timeskip line', desc: 'Chapter 598 onward — Fishman Island to Elbaf' },
    ],
    footer: 'Dead characters stay on the list — Oda can always redraw them in flashback',
  },
  {
    kind: 'group',
    kicker: 'Skypiea',
    title: "Enel's Priests",
    subtitle: 'God Enel had four priests. Three never came back.',
    names: ['Gedatsu', 'Ohm', 'Shura'],
  },
  {
    kind: 'group',
    kicker: 'Drum Island',
    title: "Wapol's Officers",
    subtitle: 'The Drum Kingdom enforcers — never re-drawn, even in Chopper flashbacks.',
    names: ['Chess', 'Kuromarimo'],
  },
  {
    kind: 'group',
    kicker: 'Thriller Bark',
    title: 'The Island of Horrors',
    subtitle: "Moria's surgeon, his masterpiece, and his giant zombie.",
    names: ['Hogback', 'Victoria Cindry', 'Oars'],
  },
  {
    kind: 'group',
    kicker: 'Water 7',
    title: 'The Franky Family',
    subtitle:
      "Franky's whole bounty-hunter crew — Sodom and Gomorrah included — last drawn before the timeskip.",
    names: ['Franky Family', 'Sodom', 'Gomorrah'],
  },
  {
    kind: 'group',
    kicker: 'Baroque Works',
    title: 'The Cafe Crew',
    subtitle:
      "Spider's Cafe stayed open through Alabasta. The staff never appeared again.",
    names: ['Gem', 'Zala', 'Babe'],
  },
  {
    kind: 'group',
    kicker: 'Whitebeard Pirates',
    title: 'The 12th Division Commander',
    subtitle:
      "Haruta fought at Marineford alongside Marco and Vista. Last drawn at the war's end.",
    names: ['Haruta'],
  },
  {
    kind: 'group',
    kicker: 'Shandia',
    title: 'Calgara',
    subtitle: "Noland's friend and the heart of the Shandia flashback. Last seen in chapter 299.",
    names: ['Kalgara'],
  },
  {
    kind: 'silent_list',
    kicker: 'And the rest · 1/2',
    title: 'Still Missing',
    subtitle: 'Background regulars, marines, and the pets',
    names: REMAINDER.slice(0, 8),
    footer: 'Last appearance — chapter and arc',
  },
  {
    kind: 'silent_list',
    kicker: 'And the rest · 2/2',
    title: 'Still Missing',
    subtitle: 'Background regulars, marines, and the pets',
    names: REMAINDER.slice(8),
    footer: 'Last appearance — chapter and arc',
  },
  {
    kind: 'thanks',
    kicker: 'One Piece of Data',
    title: 'Who do you miss?',
    subtitle: 'Weekly One Piece stats and rankings.',
    handle: '@onepieceofdata',
  },
]
