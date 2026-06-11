// Editorial slide specs for the "One Piece × The World Cup" carousel.
//
// The premise: One Piece began serialization in Weekly Shonen Jump in July
// 1997, so every FIFA World Cup since has a manga moment running alongside it.
// Each `worldcup` slide pairs a tournament (host + champion flag + final) with
// where the Straw Hats' journey stood when that World Cup kicked off, fronted
// by the arc's signature character.
//
// `characterName` must match a row in the Supabase `character` table — fetch.ts
// resolves it to a portrait. `championCode` is an ISO 3166-1 alpha-2 code for
// the flag CDN. `theme` is the card's hero colour (the champion nation's), which
// the gradient blends down into the One Piece purple.
//
// Chapter numbers are approximate ("~ch.") — they mark roughly where Weekly
// Shonen Jump's serialization sat during each tournament window.

export type SlideSpec =
  | {
      kind: 'cover'
      kicker: string
      title: string
      subtitle: string
    }
  | {
      kind: 'premise'
      kicker: string
      title: string
      body: string
    }
  | {
      kind: 'worldcup'
      year: number
      host: string
      champion: string
      championCode: string
      finalResult: string
      characterName: string
      characterRole: string
      arcTitle: string
      detail: string
      chapterLabel: string
      theme: string
    }
  | {
      kind: 'closer'
      kicker: string
      year: string
      hosts: string
      question: string
      handle: string
    }

export const SLIDES: SlideSpec[] = [
  {
    kind: 'cover',
    kicker: 'A Timeline',
    title: 'ONE PIECE\n×\nWORLD CUP',
    subtitle:
      'Every World Cup since the manga began — and exactly where Luffy was each time the world watched.',
  },
  {
    kind: 'worldcup',
    year: 1998,
    host: 'France',
    champion: 'France',
    championCode: 'fr',
    finalResult: 'Hosts beat Brazil 3–0 in Paris.',
    characterName: 'Sanji',
    characterRole: 'joins the crew',
    arcTitle: 'BARATIE\nThe Sea Restaurant',
    detail:
      "Barely a year into the manga. Luffy reaches the floating restaurant Baratie, where a hot-blooded cook named Sanji is about to join — and Zoro is cut down by the world's greatest swordsman, Mihawk.",
    chapterLabel: '~ch. 45',
    theme: '#2f5ad6',
  },
  {
    kind: 'worldcup',
    year: 2002,
    host: 'Korea / Japan',
    champion: 'Brazil',
    championCode: 'br',
    finalResult: "Beat Germany 2–0 — Ronaldo's redemption.",
    characterName: 'Crocodile',
    characterRole: 'the warlord falls',
    arcTitle: 'ALABASTA\nA Desert War Ends',
    detail:
      'Luffy topples the Warlord Crocodile and saves a kingdom from civil war. Princess Vivi waves a tearful goodbye, and Nico Robin quietly slips aboard the Going Merry.',
    chapterLabel: '~ch. 215',
    theme: '#089e6a',
  },
  {
    kind: 'worldcup',
    year: 2006,
    host: 'Germany',
    champion: 'Italy',
    championCode: 'it',
    finalResult: "Beat France on penalties — Zidane's headbutt.",
    characterName: 'Nico Robin',
    characterRole: 'the rescue',
    arcTitle: 'ENIES LOBBY\nDeclaring War',
    detail:
      "The Straw Hats storm the government's judicial island to rescue Robin. Luffy unveils Gear Second and Third, and the crew burns the World Government flag — open war.",
    chapterLabel: '~ch. 400',
    theme: '#0a86c9',
  },
  {
    kind: 'worldcup',
    year: 2010,
    host: 'South Africa',
    champion: 'Spain',
    championCode: 'es',
    finalResult: 'Beat the Netherlands 1–0 — first ever title.',
    characterName: 'Portgas D. Ace',
    characterRole: 'falls here',
    arcTitle: 'MARINEFORD\nThe War of the Best',
    detail:
      'The darkest hour. Luffy watches his brother Ace die at the Summit War. Shattered, he signals the scattered crew with a coded message — wait two years. The time skip is coming.',
    chapterLabel: '~ch. 580',
    theme: '#d62a2a',
  },
  {
    kind: 'worldcup',
    year: 2014,
    host: 'Brazil',
    champion: 'Germany',
    championCode: 'de',
    finalResult: 'Beat Argentina 1–0 — Götze in extra time.',
    characterName: 'Donquixote Doflamingo',
    characterRole: 'the warlord',
    arcTitle: 'DRESSROSA\nThe Toy Kingdom',
    detail:
      "Allied with Trafalgar Law, Luffy fights up the Corrida Colosseum toward the Warlord Doflamingo. His long-presumed-dead brother Sabo returns — and claims Ace's flame-flame fruit.",
    chapterLabel: '~ch. 750',
    theme: '#c47d12',
  },
  {
    kind: 'worldcup',
    year: 2018,
    host: 'Russia',
    champion: 'France',
    championCode: 'fr',
    finalResult: 'Beat Croatia 4–2 — Mbappé arrives.',
    characterName: 'Kaidou',
    characterRole: 'the emperor',
    arcTitle: 'WANO\nThe Land of Samurai',
    detail:
      'As the kings of the world gather at the Reverie, the Straw Hats slip into the closed country of Wano. Disguised as samurai, they begin a plot to topple the shogun and the Emperor Kaido.',
    chapterLabel: '~ch. 909',
    theme: '#4a3fcf',
  },
  {
    kind: 'worldcup',
    year: 2022,
    host: 'Qatar',
    champion: 'Argentina',
    championCode: 'ar',
    finalResult: "Beat France on penalties — Messi's crown.",
    characterName: 'Monkey D. Luffy',
    characterRole: 'awakens Gear 5',
    arcTitle: 'WANO WON\nGear 5 Awakens',
    detail:
      'Months before kickoff Luffy beats Kaido and awakens the mythical Gear 5. By the time Qatar opens, Wano is free, his bounty hits ฿3.0B, he is named an Emperor — and the Final Saga has begun.',
    chapterLabel: '~ch. 1068',
    theme: '#1497db',
  },
  {
    kind: 'closer',
    kicker: 'Next Kickoff',
    year: '2026',
    hosts: 'USA · Canada · Mexico',
    question:
      "Where will Luffy be when the world watches again? The Final Saga is racing toward its end.",
    handle: 'onepieceofdata.com',
  },
]
