// Shared mock fixtures so the design pass uses consistent content
// across Today / Reading / Topics / Listen / Library / Notes.
// Pages fall back to these when the backend isn't reachable.

import type { Article, ArticleSourceKind } from "./api";

// Re-exports kept so the rest of the app can import either name.
export type { Article, ArticleSourceKind };
export type MockArticle = Article;

export interface MockTopic {
  slug: string;
  name: string;
  description: string;
  feedCount: number;
  unreadCount: number;
  coverColor: string;
  weeklySummary: string;
}

export interface MockLibraryItem {
  id: string;
  type: "book" | "film" | "tv";
  title: string;
  creator: string;
  status: "want" | "in_progress" | "done";
  rating?: number; // 1..5
  coverUrl?: string;
  progress?: number; // 0..1
  notes?: number;
}

export interface MockPodcast {
  id: string;
  title: string;
  show: string;
  durationMinutes: number;
  publishedAt: string;
  coverColor: string;
  isNew?: boolean;
  progress?: number; // 0..1
}

export interface MockHighlight {
  id: string;
  text: string;
  source: string;
  sourceType: "article" | "book";
  color: "yellow" | "blue" | "green" | "pink";
  createdAt: string;
  note?: string;
}

export interface MockNote {
  id: string;
  title: string;
  body: string;
  updatedAt: string;
  linkedArticleTitle?: string;
  tags: string[];
}

export interface MockSourceFolder {
  name: string;
  feeds: { name: string; unread: number }[];
}

// ---------- Articles ----------

export const MOCK_ARTICLES: MockArticle[] = [
  {
    id: "a1",
    title: "The future of AI assistants: from tools to collaborators",
    source: "MIT Technology Review",
    sourceKind: "newsletter",
    summary:
      "As LLMs become more capable, the line between tool and collaborator is blurring in ways that challenge how we think about productivity and creativity.",
    imageUrl: "https://picsum.photos/seed/ai1/800/500",
    url: "https://example.com/1",
    publishedAt: "2h ago",
    readTimeMinutes: 6,
    isRead: false,
    isSaved: false,
    tags: ["AI", "Technology"],
    whyItMatters:
      "Sets the framing for the workplace AI debate everyone will be having this quarter.",
  },
  {
    id: "a2",
    title: "Apple's spatial computing strategy for 2026, leaked",
    source: "The Verge",
    sourceKind: "rss",
    summary:
      "Roadmap documents suggest Apple is doubling down on visionOS with a lighter, cheaper headset aimed at mainstream consumers.",
    imageUrl: "https://picsum.photos/seed/apple2/800/500",
    url: "https://example.com/2",
    publishedAt: "4h ago",
    readTimeMinutes: 4,
    readProgress: 0.4,
    isRead: false,
    isSaved: true,
    tags: ["Apple", "Hardware"],
    whyItMatters: "Concrete signal that spatial computing isn't dead — it's reshaping for v2.",
  },
  {
    id: "a3",
    title: "How remote work reshaped city centres — and what comes next",
    source: "The Economist",
    sourceKind: "newsletter",
    summary:
      "Five years after the pandemic, urban planners are only beginning to understand the lasting effects on city layout and commercial real estate.",
    imageUrl: "https://picsum.photos/seed/city3/800/500",
    url: "https://example.com/3",
    publishedAt: "6h ago",
    readTimeMinutes: 8,
    isRead: false,
    isSaved: false,
    tags: ["Cities", "Work"],
    whyItMatters:
      "The question of whether downtowns recover defines a decade of property and policy decisions.",
  },
  {
    id: "a4",
    title: "Inside the race to build a better battery",
    source: "Wired",
    sourceKind: "rss",
    summary:
      "Solid-state batteries finally leave the lab. Three startups, three different bets, one shared deadline.",
    imageUrl: "https://picsum.photos/seed/battery4/800/500",
    url: "https://example.com/4",
    publishedAt: "8h ago",
    readTimeMinutes: 5,
    isRead: false,
    isSaved: false,
    tags: ["Energy", "Climate"],
  },
  {
    id: "a5",
    title: "Substack's pivot to video is working — for some",
    source: "Nieman Lab",
    sourceKind: "newsletter",
    summary:
      "A growing cohort of newsletter writers find video the best way to deepen reader relationships, but the economics remain fragile.",
    url: "https://example.com/5",
    publishedAt: "10h ago",
    readTimeMinutes: 3,
    isRead: true,
    isSaved: false,
    tags: ["Media"],
  },
  {
    id: "a6",
    title: "What the new EU AI Act means for developers",
    source: "Ars Technica",
    sourceKind: "rss",
    summary:
      "The Act's tiered risk framework creates compliance obligations that differ depending on the use case. Here's what engineers need to know.",
    imageUrl: "https://picsum.photos/seed/eu6/800/500",
    url: "https://example.com/6",
    publishedAt: "Yesterday",
    readTimeMinutes: 7,
    readProgress: 0.7,
    isRead: false,
    isSaved: true,
    tags: ["AI", "Policy"],
  },
  {
    id: "a7",
    title: "The quiet comeback of RSS",
    source: "Hacker Newsletter",
    sourceKind: "newsletter",
    url: "https://example.com/7",
    publishedAt: "Yesterday",
    readTimeMinutes: 2,
    isRead: false,
    isSaved: false,
    tags: ["Web"],
  },
  {
    id: "a8",
    title: "Why sleep researchers are rethinking the 8-hour myth",
    source: "New Scientist",
    sourceKind: "rss",
    summary:
      "Segmented sleep — two distinct periods separated by wakefulness — may be more natural than the consolidated eight-hour block.",
    imageUrl: "https://picsum.photos/seed/sleep8/800/500",
    url: "https://example.com/8",
    publishedAt: "Yesterday",
    readTimeMinutes: 5,
    isRead: false,
    isSaved: true,
    tags: ["Health", "Science"],
  },
  {
    id: "a9",
    title: "London's housing problem isn't supply — it's velocity",
    source: "The Guardian",
    sourceKind: "rss",
    summary:
      "A new analysis suggests transaction friction, not raw construction numbers, is the bottleneck.",
    imageUrl: "https://picsum.photos/seed/london9/800/500",
    url: "https://example.com/9",
    publishedAt: "2 days ago",
    readTimeMinutes: 9,
    isRead: false,
    isSaved: true,
    tags: ["Cities", "Policy"],
  },
  {
    id: "a10",
    title: "A field guide to the small web",
    source: "Manuel Moreale",
    sourceKind: "saved",
    summary: "Hand-picked corners of the internet that still feel personal.",
    url: "https://example.com/10",
    publishedAt: "3 days ago",
    readTimeMinutes: 4,
    isRead: false,
    isSaved: true,
    tags: ["Web"],
  },
  {
    id: "a11",
    title: "The strange resilience of the print magazine",
    source: "Columbia Journalism Review",
    sourceKind: "suggested",
    summary:
      "While digital ad markets falter, niche print titles are quietly profitable — and growing.",
    imageUrl: "https://picsum.photos/seed/print11/800/500",
    url: "https://example.com/11",
    publishedAt: "4 days ago",
    readTimeMinutes: 6,
    isRead: false,
    isSaved: false,
    tags: ["Media"],
  },
  {
    id: "a12",
    title: "Heat pumps are eating natural gas — slowly",
    source: "Heatmap News",
    sourceKind: "newsletter",
    summary:
      "The transition is real, but adoption curves vary wildly by country and even by postcode.",
    url: "https://example.com/12",
    publishedAt: "5 days ago",
    readTimeMinutes: 7,
    isRead: false,
    isSaved: false,
    tags: ["Energy", "Climate"],
  },
];

// ---------- Topics / Boards ----------

export const MOCK_TOPICS: MockTopic[] = [
  {
    slug: "ai-policy",
    name: "AI Policy",
    description: "Regulation, safety, and the politics of LLMs.",
    feedCount: 12,
    unreadCount: 7,
    coverColor: "linear-gradient(135deg, #4f7cff, #2c4cb8)",
    weeklySummary:
      "EU AI Act enforcement timelines clarified; California advances SB-1047 successor; OpenAI publishes new safety framework focused on agent autonomy.",
  },
  {
    slug: "uk-housing",
    name: "UK Housing",
    description: "Planning, supply, prices, and the politics of where Britons live.",
    feedCount: 8,
    unreadCount: 4,
    coverColor: "linear-gradient(135deg, #d97706, #92400e)",
    weeklySummary:
      "Planning reform bill clears third reading; Rightmove reports Q1 transaction volume up 11% YoY; new build starts continue to lag targets.",
  },
  {
    slug: "energy-transition",
    name: "Energy Transition",
    description: "Grids, batteries, heat pumps, and the unsexy backbone of decarbonisation.",
    feedCount: 14,
    unreadCount: 9,
    coverColor: "linear-gradient(135deg, #3ecf8e, #166534)",
    weeklySummary:
      "Solid-state battery startups report breakthroughs; UK grid constraints push offshore wind queue past 2030; heat pump installs accelerate in Sweden.",
  },
  {
    slug: "media-business",
    name: "Media Business",
    description: "Newsletters, video, paid podcasting, and the post-platform internet.",
    feedCount: 9,
    unreadCount: 3,
    coverColor: "linear-gradient(135deg, #ec4899, #9d174d)",
    weeklySummary:
      "Substack expands video monetisation; The Atlantic reports paid sub growth; major networks experiment with creator-led shows.",
  },
  {
    slug: "small-web",
    name: "The Small Web",
    description: "Personal sites, blogs, and corners of the internet that still feel handmade.",
    feedCount: 21,
    unreadCount: 12,
    coverColor: "linear-gradient(135deg, #8b5cf6, #4c1d95)",
    weeklySummary:
      "Several long-running blogs return from hiatus; new feed-reader projects launch; debate around RSS revival continues.",
  },
  {
    slug: "longevity",
    name: "Longevity & Sleep",
    description: "Healthspan research, sleep science, and what the data actually says.",
    feedCount: 6,
    unreadCount: 2,
    coverColor: "linear-gradient(135deg, #06b6d4, #0e7490)",
    weeklySummary:
      "Two new meta-analyses on segmented sleep; rapamycin trial extends; debate over Zone 2 cardio claims.",
  },
];

// ---------- Library ----------

export const MOCK_LIBRARY: MockLibraryItem[] = [
  {
    id: "l1",
    type: "book",
    title: "The Power Broker",
    creator: "Robert Caro",
    status: "in_progress",
    progress: 0.42,
    coverUrl: "https://picsum.photos/seed/book1/240/360",
    notes: 7,
  },
  {
    id: "l2",
    type: "book",
    title: "How to Live",
    creator: "Sarah Bakewell",
    status: "want",
    coverUrl: "https://picsum.photos/seed/book2/240/360",
  },
  {
    id: "l3",
    type: "book",
    title: "Working",
    creator: "Studs Terkel",
    status: "done",
    rating: 5,
    coverUrl: "https://picsum.photos/seed/book3/240/360",
    notes: 12,
  },
  {
    id: "l4",
    type: "film",
    title: "Perfect Days",
    creator: "Wim Wenders",
    status: "done",
    rating: 5,
    coverUrl: "https://picsum.photos/seed/film1/240/360",
  },
  {
    id: "l5",
    type: "film",
    title: "The Brutalist",
    creator: "Brady Corbet",
    status: "want",
    coverUrl: "https://picsum.photos/seed/film2/240/360",
  },
  {
    id: "l6",
    type: "tv",
    title: "Slow Horses",
    creator: "Apple TV+",
    status: "in_progress",
    progress: 0.65,
    coverUrl: "https://picsum.photos/seed/tv1/240/360",
  },
  {
    id: "l7",
    type: "tv",
    title: "Severance",
    creator: "Apple TV+",
    status: "in_progress",
    progress: 0.3,
    coverUrl: "https://picsum.photos/seed/tv2/240/360",
  },
  {
    id: "l8",
    type: "book",
    title: "A Pattern Language",
    creator: "Christopher Alexander",
    status: "in_progress",
    progress: 0.18,
    coverUrl: "https://picsum.photos/seed/book4/240/360",
    notes: 4,
  },
];

// ---------- Podcasts / Listen ----------

export const MOCK_PODCASTS: MockPodcast[] = [
  {
    id: "p1",
    title: "The Tariff Endgame",
    show: "The Daily",
    durationMinutes: 28,
    publishedAt: "Today",
    coverColor: "linear-gradient(135deg, #1f2937, #111827)",
    isNew: true,
  },
  {
    id: "p2",
    title: "Inside the AGI lab",
    show: "Hard Fork",
    durationMinutes: 64,
    publishedAt: "Yesterday",
    coverColor: "linear-gradient(135deg, #4f7cff, #1e3a8a)",
    progress: 0.3,
  },
  {
    id: "p3",
    title: "What planning reform actually does",
    show: "More or Less",
    durationMinutes: 22,
    publishedAt: "2 days ago",
    coverColor: "linear-gradient(135deg, #d97706, #78350f)",
    isNew: true,
  },
  {
    id: "p4",
    title: "On joy",
    show: "On Being",
    durationMinutes: 52,
    publishedAt: "3 days ago",
    coverColor: "linear-gradient(135deg, #8b5cf6, #4c1d95)",
  },
  {
    id: "p5",
    title: "The grid is the bottleneck",
    show: "Volts",
    durationMinutes: 71,
    publishedAt: "4 days ago",
    coverColor: "linear-gradient(135deg, #3ecf8e, #14532d)",
  },
];

// ---------- Highlights & Notes ----------

export const MOCK_HIGHLIGHTS: MockHighlight[] = [
  {
    id: "h1",
    text: "The cost of getting things done in cities is no longer construction — it's coordination.",
    source: "How remote work reshaped city centres",
    sourceType: "article",
    color: "yellow",
    createdAt: "2h ago",
    note: "Echoes Caro on Moses — coordination cost is the real moat.",
  },
  {
    id: "h2",
    text: "He built parks not for the people who used them, but for the people who would build the next thing beside them.",
    source: "The Power Broker",
    sourceType: "book",
    color: "blue",
    createdAt: "Yesterday",
  },
  {
    id: "h3",
    text: "Segmented sleep — two distinct periods separated by wakefulness — may be more natural than the consolidated eight-hour block.",
    source: "Why sleep researchers are rethinking the 8-hour myth",
    sourceType: "article",
    color: "green",
    createdAt: "Yesterday",
  },
  {
    id: "h4",
    text: "The Act's tiered risk framework means a chatbot is regulated very differently from a CV-screener.",
    source: "What the new EU AI Act means for developers",
    sourceType: "article",
    color: "pink",
    createdAt: "2 days ago",
    note: "Worth a longer post on what this means for our org.",
  },
];

export const MOCK_NOTES: MockNote[] = [
  {
    id: "n1",
    title: "Why coordination cost is the real urban bottleneck",
    body: "Cross-reading Caro and the Economist piece — the binding constraint isn't supply, it's how many parties have to agree before a project moves.",
    updatedAt: "2h ago",
    linkedArticleTitle: "How remote work reshaped city centres",
    tags: ["Cities", "Policy"],
  },
  {
    id: "n2",
    title: "Reading list: AI Act compliance",
    body: "Three articles + the Act itself. Need to map our products to the risk tiers before next month's review.",
    updatedAt: "Yesterday",
    tags: ["AI", "Policy"],
  },
  {
    id: "n3",
    title: "Sleep experiment — week 2",
    body: "Tried split sleep schedule. Noting energy levels morning vs afternoon.",
    updatedAt: "3 days ago",
    tags: ["Health"],
  },
];

// ---------- Sources sidebar tree ----------

export const MOCK_SOURCE_FOLDERS: MockSourceFolder[] = [
  {
    name: "Daily reads",
    feeds: [
      { name: "The Guardian", unread: 8 },
      { name: "The Economist", unread: 4 },
      { name: "The Verge", unread: 3 },
    ],
  },
  {
    name: "Newsletters",
    feeds: [
      { name: "Stratechery", unread: 1 },
      { name: "Heatmap News", unread: 2 },
      { name: "Nieman Lab", unread: 1 },
    ],
  },
  {
    name: "Tech & Science",
    feeds: [
      { name: "MIT Technology Review", unread: 5 },
      { name: "Wired", unread: 3 },
      { name: "Ars Technica", unread: 2 },
      { name: "New Scientist", unread: 4 },
    ],
  },
];

// ---------- Today brief picks ----------

export const TODAY_BRIEF_IDS = ["a1", "a3", "a6", "a9", "a12"];
