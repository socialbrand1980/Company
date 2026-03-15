import { XMLParser } from "fast-xml-parser";
import { truncateAtWord } from "./helpers.js";

const DEFAULT_TOPIC_HINTS = [
  "fashion brand marketing",
  "beauty skincare brand campaign",
  "consumer brand strategy retail",
  "UMKM Indonesia brand marketing",
  "FMCG brand campaign",
  "Indonesia retail consumer brand",
  "AI product strategy startup",
  "SaaS growth marketing Asia",
  "fintech brand strategy Asia",
  "creator economy platform update",
];

const RESEARCH_QUERY_SUFFIXES = [
  "market size growth",
  "consumer behavior trend",
  "ecommerce distribution",
  "forecast outlook",
  "Indonesia market",
];

const STOPWORDS = new Set([
  "and",
  "the",
  "for",
  "with",
  "from",
  "this",
  "that",
  "into",
  "their",
  "about",
  "after",
  "before",
  "brand",
  "brands",
  "market",
  "strategy",
  "indonesia",
]);

const SOURCE_REGISTRY = [
  {
    id: "antara-id-ekonomi",
    label: "ANTARA News",
    kind: "html",
    url: "https://www.antaranews.com/ekonomi",
    local: true,
    priority: 13,
    articleUrlPattern: /^https:\/\/www\.antaranews\.com\/berita\/[0-9]+\/[^/?#]+/i,
    maxLinks: 16,
    role: ["seed", "research"],
  },
  {
    id: "antara-en-business",
    label: "ANTARA News English",
    kind: "rss",
    url: "https://en.antaranews.com/rss/business-investment.xml",
    local: true,
    priority: 12,
    maxItems: 14,
    role: ["seed", "research"],
  },
  {
    id: "compas",
    label: "Compas",
    kind: "html",
    url: "https://compas.co.id/article/",
    local: true,
    priority: 12,
    articleUrlPattern: /^https:\/\/compas\.co\.id\/article\/(?!article\/)[^/?#]+\/?$/i,
    maxLinks: 10,
    role: ["seed", "research"],
  },
  {
    id: "katadata",
    label: "Katadata",
    kind: "html",
    url: "https://katadata.co.id/berita",
    local: true,
    priority: 11,
    articleUrlPattern: /^https:\/\/katadata\.co\.id\/berita\/[^/]+\/[a-z0-9]+\/[^/?#]+/i,
    maxLinks: 12,
    role: ["seed"],
  },
  {
    id: "marketeers",
    label: "Marketeers",
    kind: "html",
    url: "https://www.marketeers.com/",
    local: true,
    priority: 11,
    articleUrlPattern: /^https:\/\/www\.marketeers\.com\/(?!category\/|tag\/|author\/|page\/|about|contact|privacy-policy|sitemap|feed\/|wp-)[^/?#]+\/?$/i,
    maxLinks: 14,
    role: ["seed", "research"],
  },
  {
    id: "marketing-interactive",
    label: "Marketing-Interactive",
    kind: "html",
    url: "https://www.marketing-interactive.com/",
    local: false,
    priority: 10,
    articleUrlPattern: /^https:\/\/www\.marketing-interactive\.com\/(?!about-marketing|contact-us|subscribe|topics\/|author\/|page\/|search|production\/)[a-z0-9][a-z0-9-]+\/?$/i,
    maxLinks: 14,
    role: ["seed", "research"],
  },
  {
    id: "tokopedia-blog",
    label: "Tokopedia",
    kind: "html",
    url: "https://www.tokopedia.com/blog/",
    local: true,
    priority: 9,
    articleUrlPattern: /^https:\/\/www\.tokopedia\.com\/blog\//i,
    maxLinks: 8,
    role: ["research"],
  },
  {
    id: "kemenperin",
    label: "Kemenperin",
    kind: "html",
    url: "https://kemenperin.go.id/artikel",
    local: true,
    priority: 8,
    articleUrlPattern: /^https:\/\/kemenperin\.go\.id\/artikel\//i,
    maxLinks: 8,
    role: ["research"],
  },
  {
    id: "campaign-asia",
    label: "Campaign Asia",
    kind: "html",
    url: "https://www.campaignasia.com/",
    local: false,
    priority: 8,
    articleUrlPattern: /^https:\/\/www\.campaignasia\.com\/article\/[^/?#]+\/\d+\/?$/i,
    maxLinks: 12,
    role: ["seed", "research"],
  },
  {
    id: "retail-news-asia",
    label: "Retail News Asia",
    kind: "html",
    url: "https://www.retailnews.asia/",
    local: false,
    priority: 8,
    articleUrlPattern: /^https:\/\/www\.retailnews\.asia\/(?!about|contact|advertise|submit|category\/|tag\/|page\/|privacy-policy|terms-and-conditions)[^/?#]+\/?$/i,
    maxLinks: 12,
    role: ["seed", "research"],
  },
  {
    id: "retail-asia",
    label: "Retail Asia",
    kind: "html",
    url: "https://retailasia.com/",
    local: false,
    priority: 7,
    articleUrlPattern: /^https:\/\/retailasia\.com\/[^/]+\/news\/[^/?#]+/i,
    maxLinks: 12,
    role: ["seed", "research"],
  },
  {
    id: "the-drum",
    label: "The Drum",
    kind: "html",
    url: "https://www.thedrum.com/",
    local: false,
    priority: 6,
    articleUrlPattern: /^https:\/\/www\.thedrum\.com\/news\/[^/?#]+/i,
    maxLinks: 12,
    role: ["seed", "research"],
  },
  {
    id: "glossy",
    label: "Glossy",
    kind: "rss",
    url: "https://www.glossy.co/feed/",
    local: false,
    priority: 6,
    maxItems: 10,
    role: ["seed", "research"],
  },
];

const PREFERRED_LOCAL_SOURCES = [
  "antara",
  "antaranews",
  "jakpat",
  "populix",
  "kantar",
  "nielseniq",
  "mckinsey",
  "deloitte",
  "bps",
  "badan pusat statistik",
  "kemenperin",
  "kementerian perindustrian",
  "bpom",
  "katadata",
  "compas",
  "marketeers",
  "shopee",
  "tokopedia",
  "tiktok shop",
  "tiktok",
];

const STRATEGIC_KEYWORDS = [
  "brand",
  "branding",
  "campaign",
  "marketing",
  "rebrand",
  "positioning",
  "social media",
  "creator",
  "consumer",
  "launch",
  "acquisition",
  "partnership",
  "collaboration",
  "retail",
  "advertising",
  "fashion",
  "beauty",
  "skincare",
  "cosmetics",
  "fragrance",
  "lifestyle",
  "fmcg",
  "ecommerce",
  "umkm",
  "sme",
  "consumer goods",
  "ai",
  "artificial intelligence",
  "saas",
  "software",
  "fintech",
  "startup",
  "platform",
  "product",
  "award",
  "creator economy",
  "marketplace",
  "b2b",
];

const INDUSTRY_PRIORITY_KEYWORDS = [
  "fashion",
  "beauty",
  "skincare",
  "cosmetics",
  "personal care",
  "fragrance",
  "retail",
  "consumer",
  "fmcg",
  "d2c",
  "ecommerce",
  "umkm",
  "sme",
  "indonesia",
  "apparel",
  "modest fashion",
  "makeup",
  "wellness",
  "ai",
  "artificial intelligence",
  "saas",
  "fintech",
  "startup",
  "platform",
  "creator economy",
  "software",
  "productivity",
  "automation",
];

const EXCLUDED_KEYWORDS = [
  "gambling",
  "betting",
  "casino",
  "sportsbook",
  "poker",
  "lottery",
  "slot",
  "jackpot",
  "wager",
  "bookmaker",
  "bet365",
  "draftkings",
  "fanduel",
];

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  trimValues: true,
});

const fetchCache = new Map();

function escapeRegex(text) {
  return String(text || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function keywordMatches(haystack, keyword) {
  const source = String(haystack || "").toLowerCase();
  const needle = String(keyword || "").toLowerCase().trim();

  if (!needle) {
    return false;
  }

  if (needle.length <= 3 || /\s/.test(needle)) {
    const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegex(needle)}($|[^a-z0-9])`, "i");
    return pattern.test(source);
  }

  return source.includes(needle);
}

function decodeEntities(text) {
  return String(text || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number.parseInt(code, 10)));
}

function stripHtml(text) {
  return decodeEntities(String(text || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function normalizeTitle(text) {
  const base = String(text || "")
    .replace(/\s+-\s+[^-]+$/g, "")
    .replace(/\.\s+-\s+[^-]+$/g, "");

  return base
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeWhitespace(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function sanitizeSummary(text) {
  return truncateAtWord(stripHtml(text), 260);
}

function getTopicHints() {
  const configured = String(process.env.NEWS_QUERIES || "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

  return configured.length > 0 ? configured : DEFAULT_TOPIC_HINTS;
}

function tokenize(text) {
  return normalizeTitle(text)
    .split(" ")
    .filter((word) => word.length > 2)
    .filter((word) => !STOPWORDS.has(word));
}

function computeTopicHintScore(item, hints = []) {
  const haystack = `${item.title} ${item.summary || ""}`.toLowerCase();

  return hints.reduce((score, hint) => {
    const tokens = tokenize(hint);
    if (tokens.length === 0) {
      return score;
    }

    const matched = tokens.filter((token) => haystack.includes(token)).length;
    return score + Math.min(8, matched * 2);
  }, 0);
}

function scoreCandidate(item, source, topicHints = []) {
  const haystack = `${item.title} ${item.summary || ""} ${topicHints.join(" ")}`.toLowerCase();
  const keywordScore = STRATEGIC_KEYWORDS.reduce((score, keyword) => {
    return keywordMatches(haystack, keyword) ? score + 2 : score;
  }, 0);
  const industryScore = INDUSTRY_PRIORITY_KEYWORDS.reduce((score, keyword) => {
    return keywordMatches(haystack, keyword) ? score + 3 : score;
  }, 0);
  const sourceHaystack = `${source?.label || item.sourceName || ""}`.toLowerCase();
  const localSourceScore = PREFERRED_LOCAL_SOURCES.reduce((score, keyword) => {
    return keywordMatches(sourceHaystack, keyword) ? score + 8 : score;
  }, 0);
  const indonesiaContextScore = /indonesia|indonesian|jakarta|umkm|lokal|ri\b/.test(haystack) ? 6 : 0;
  const sourcePriorityScore = Number(source?.priority || 0) * 2;
  const topicHintScore = computeTopicHintScore(item, topicHints);

  let freshnessScore = 0;
  const publishedTime = new Date(item.publishedAt).getTime();
  if (Number.isFinite(publishedTime)) {
    const ageHours = (Date.now() - publishedTime) / (1000 * 60 * 60);
    freshnessScore = ageHours <= 24 ? 8 : ageHours <= 72 ? 5 : ageHours <= 168 ? 3 : 1;
  }

  return keywordScore + industryScore + localSourceScore + indonesiaContextScore + sourcePriorityScore + topicHintScore + freshnessScore;
}

function isExcludedCandidate(title, summary, sourceName) {
  const haystack = `${title} ${summary} ${sourceName}`.toLowerCase();
  return EXCLUDED_KEYWORDS.some((keyword) => keywordMatches(haystack, keyword));
}

function hasPriorityIndustry(title, summary) {
  const haystack = `${title} ${summary}`.toLowerCase();
  return INDUSTRY_PRIORITY_KEYWORDS.some((keyword) => keywordMatches(haystack, keyword));
}

function isStrongSeedTitle(title, sourceName = "") {
  const haystack = `${title} ${sourceName}`.toLowerCase();

  if (/^(glossy podcast|glossy pop newsletter|luxury briefing|fashion briefing|exclusive:)/.test(haystack) || /\barchives?\b/.test(haystack)) {
    return false;
  }

  if (/^(why|how)\s/.test(haystack) && !/(launch|acquire|partnership|campaign|tiktok shop|sales|growth|funding|expands|enters|opens)/.test(haystack)) {
    return false;
  }

  return /(launch|launches|announces|acquires|acquire|partnership|partners|campaign|sales|growth|expands|enters|opens|turns to|tiktok shop|marketplace|beauty|fashion|retail|\bai\b|fintech|platform)/.test(haystack);
}

function hasPreferredLocalSource(sourceName) {
  const normalized = String(sourceName || "").toLowerCase();
  return PREFERRED_LOCAL_SOURCES.some((keyword) => normalized.includes(keyword));
}

function withinMaxAge(publishedAt, maxAgeDays) {
  if (!publishedAt) {
    return true;
  }

  const publishedTime = new Date(publishedAt).getTime();
  if (!Number.isFinite(publishedTime)) {
    return true;
  }

  return Date.now() - publishedTime <= maxAgeDays * 24 * 60 * 60 * 1000;
}

async function fetchText(url) {
  if (fetchCache.has(url)) {
    return fetchCache.get(url);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; SocialBrand1980 Content Ops/1.0; +https://socialbrand1980.com)",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    },
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  const text = await response.text();
  fetchCache.set(url, text);
  return text;
}

function getItemsFromXml(xmlText) {
  const parsed = parser.parse(xmlText);
  const items = parsed?.rss?.channel?.item;

  if (!items) {
    return [];
  }

  return Array.isArray(items) ? items : [items];
}

function extractMetaContent(html, patterns) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return decodeEntities(match[1]).trim();
    }
  }

  return "";
}

function extractJsonLdDate(html) {
  const matches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];

  for (const match of matches) {
    const jsonText = match.replace(/^<script[^>]*>/i, "").replace(/<\/script>$/i, "");
    const dateMatch = jsonText.match(/"datePublished"\s*:\s*"([^"]+)"/i) || jsonText.match(/"dateModified"\s*:\s*"([^"]+)"/i);
    if (dateMatch?.[1]) {
      return dateMatch[1];
    }
  }

  return "";
}

function normalizePublishedAt(value, fallbackOffset = 0) {
  const parsed = new Date(value);
  if (Number.isFinite(parsed.getTime())) {
    return parsed.toISOString();
  }

  return new Date(Date.now() - fallbackOffset * 60 * 60 * 1000).toISOString();
}

function extractArticleDetails(html, url, source, fallbackOffset = 0) {
  const title = normalizeWhitespace(
    extractMetaContent(html, [
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"]+)["']/i,
      /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"]+)["']/i,
      /<title[^>]*>([^<]+)<\/title>/i,
    ])
  );
  const summary = sanitizeSummary(
    extractMetaContent(html, [
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"]+)["']/i,
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"]+)["']/i,
      /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"]+)["']/i,
    ])
  );
  const publishedAt = normalizePublishedAt(
    extractMetaContent(html, [
      /<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"]+)["']/i,
      /<meta[^>]+property=["']og:published_time["'][^>]+content=["']([^"]+)["']/i,
      /<meta[^>]+name=["']pubdate["'][^>]+content=["']([^"]+)["']/i,
      /<time[^>]+datetime=["']([^"]+)["']/i,
    ]) || extractJsonLdDate(html),
    fallbackOffset
  );

  const normalizedTitle = title.replace(/\s+-\s+[^-]+$/g, "").trim();

  if (/\barchives?\b/i.test(normalizedTitle)) {
    return {
      title: "",
      summary: "",
      link: url,
      sourceName: source.label,
      publishedAt,
    };
  }

  return {
    title: normalizedTitle,
    summary,
    link: url,
    sourceName: source.label,
    publishedAt,
  };
}

function extractAnchorLinks(html, source) {
  const links = [];
  const seen = new Set();
  const matches = html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi);

  for (const match of matches) {
    const rawHref = String(match[1] || "").trim();
    if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("javascript:")) {
      continue;
    }

    let absolute;
    try {
      absolute = new URL(rawHref, source.url).toString();
    } catch {
      continue;
    }

    if (!source.articleUrlPattern.test(absolute) || seen.has(absolute)) {
      continue;
    }

    seen.add(absolute);
    links.push(absolute);
  }

  return links.slice(0, source.maxLinks || 8);
}

async function fetchHtmlSourceItems(source, maxAgeDays, topicHints) {
  const listHtml = await fetchText(source.url);
  const articleLinks = extractAnchorLinks(listHtml, source);
  const items = [];

  for (let index = 0; index < articleLinks.length; index += 1) {
    const link = articleLinks[index];

    try {
      const articleHtml = await fetchText(link);
      const item = extractArticleDetails(articleHtml, link, source, index);

      if (!item.title || isExcludedCandidate(item.title, item.summary, item.sourceName)) {
        continue;
      }

      if (!withinMaxAge(item.publishedAt, maxAgeDays)) {
        continue;
      }

      items.push({
        ...item,
        query: source.id,
        score: scoreCandidate(item, source, topicHints),
      });
    } catch (error) {
      console.warn(`Source item skipped for "${source.label}": ${error.message}`);
    }
  }

  return items;
}

async function fetchRssSourceItems(source, maxAgeDays, topicHints) {
  const xmlText = await fetchText(source.url);

  return getItemsFromXml(xmlText)
    .map((item) => {
      const normalized = {
        title: normalizeWhitespace(stripHtml(item.title || "").replace(/\s+-\s+[^-]+$/g, "")),
        summary: sanitizeSummary(item.description || item["content:encoded"] || ""),
        link: String(item.link || "").trim(),
        sourceName: source.label,
        publishedAt: normalizePublishedAt(item.pubDate || item.isoDate || item.published || "", 0),
        query: source.id,
      };

      return {
        ...normalized,
        score: scoreCandidate(normalized, source, topicHints),
      };
    })
    .filter((item) => item.link && item.title)
    .filter((item) => !isExcludedCandidate(item.title, item.summary, item.sourceName))
    .filter((item) => withinMaxAge(item.publishedAt, maxAgeDays))
    .slice(0, source.maxItems || 8);
}

async function fetchSourceItems(source, maxAgeDays, topicHints) {
  if (source.kind === "rss") {
    return fetchRssSourceItems(source, maxAgeDays, topicHints);
  }

  return fetchHtmlSourceItems(source, maxAgeDays, topicHints);
}

function getSourcesByRole(role) {
  return SOURCE_REGISTRY.filter((source) => source.role.includes(role));
}

function collectKeywordsFromQueries(queries = []) {
  return Array.from(new Set(queries.flatMap((query) => tokenize(query))));
}

function inferResearchTopic(news) {
  const haystack = `${news.title} ${news.summary || ""} ${news.query || ""}`.toLowerCase();

  if (/(beauty|skincare|cosmetics|makeup|fragrance|personal care)/.test(haystack)) {
    return "beauty skincare cosmetics";
  }

  if (/(fashion|apparel|retail|lifestyle|consumer)/.test(haystack)) {
    return "fashion retail consumer";
  }

  if (/\bai\b|artificial intelligence|saas|software|automation|productivity/.test(haystack)) {
    return "AI software";
  }

  if (/(fintech|payments|banking|wallet|lending)/.test(haystack)) {
    return "fintech digital payments";
  }

  if (/(creator|platform|social media|marketplace)/.test(haystack)) {
    return "creator economy platform";
  }

  const words = normalizeTitle(news.title)
    .split(" ")
    .filter((word) => word.length > 3)
    .filter((word) => !STOPWORDS.has(word))
    .slice(0, 4);

  return words.join(" ") || "consumer business";
}

function buildResearchQueries(news) {
  const topic = inferResearchTopic(news);
  const baseQueries = RESEARCH_QUERY_SUFFIXES.map((suffix) => `${topic} ${suffix}`);
  const queryHints = [];
  const localQueryHints = [
    `${topic} Indonesia`,
    `${topic} Indonesia Jakpat`,
    `${topic} Indonesia Populix`,
    `${topic} Indonesia Katadata`,
    `${topic} Indonesia Compas`,
    `${topic} Indonesia Tokopedia`,
  ];

  if (/(beauty|skincare|cosmetics|makeup|fragrance|personal care)/.test(topic)) {
    queryHints.push(`${topic} gen z`, `${topic} social commerce`, `${topic} product trend`, `${topic} Indonesia gen z`);
  }

  if (/(fashion|retail|consumer)/.test(topic)) {
    queryHints.push(`${topic} consumer demand`, `${topic} marketplace trend`, `${topic} Indonesia marketplace`);
  }

  if (/(ai|software|saas)/.test(topic)) {
    queryHints.push(`${topic} adoption trend`, `${topic} enterprise demand`, `${topic} pricing growth`, `${topic} Indonesia adoption`);
  }

  if (/(fintech|payments)/.test(topic)) {
    queryHints.push(`${topic} adoption`, `${topic} regulation market`, `${topic} digital user behavior`, `${topic} Indonesia digital user behavior`);
  }

  return Array.from(new Set([...localQueryHints, ...baseQueries, ...queryHints])).slice(0, 10);
}

function buildFocusKeywords(topic) {
  const haystack = String(topic || "").toLowerCase();
  const keywords = new Set(tokenize(topic));

  if (/beauty|skincare|cosmetics/.test(haystack)) {
    ["beauty", "kecantikan", "skincare", "kosmetik", "cosmetics", "makeup"].forEach((item) => keywords.add(item));
  }

  if (/fashion|retail|consumer/.test(haystack)) {
    ["fashion", "fesyen", "retail", "consumer", "konsumen", "apparel", "fmcg", "ecommerce", "marketplace"].forEach((item) => keywords.add(item));
  }

  if (/\bai\b|software/.test(haystack)) {
    ["ai", "artificial intelligence", "kecerdasan", "automation", "software", "saas", "aplikasi"].forEach((item) => keywords.add(item));
  }

  if (/fintech|payments/.test(haystack)) {
    ["fintech", "payments", "payment", "pembayaran", "wallet", "banking"].forEach((item) => keywords.add(item));
  }

  if (/creator|platform/.test(haystack)) {
    ["creator", "influencer", "platform", "marketplace", "social commerce", "content creator"].forEach((item) => keywords.add(item));
  }

  return Array.from(keywords).filter(Boolean);
}

function scoreResearchRelevance(item, queries = [], focusKeywords = []) {
  const haystack = `${item.title} ${item.summary || ""} ${item.sourceName || ""}`.toLowerCase();
  const focusMatched = focusKeywords.filter((keyword) => haystack.includes(keyword)).length;
  if (focusKeywords.length > 0 && focusMatched === 0) {
    return 0;
  }

  const keywords = collectKeywordsFromQueries(queries);
  const matched = keywords.filter((keyword) => haystack.includes(keyword)).length;
  if (matched === 0) {
    return 0;
  }

  const localBoost = hasPreferredLocalSource(item.sourceName) ? 12 : 0;
  return matched * 3 + localBoost;
}

export async function fetchNewsCandidates({
  limit = 6,
  maxAgeDays = 7,
  excludeUrls = [],
  excludeTitles = [],
} = {}) {
  const recentUrlSet = new Set(excludeUrls.map((entry) => String(entry || "").trim()).filter(Boolean));
  const recentTitleSet = new Set(excludeTitles.map((entry) => normalizeTitle(entry)).filter(Boolean));
  const topicHints = getTopicHints();
  const sources = getSourcesByRole("seed");
  const seenLinks = new Set();
  const seenTitles = new Set();
  const sourceResults = await Promise.all(
    sources.map(async (source) => {
      try {
        return await fetchSourceItems(source, maxAgeDays, topicHints);
      } catch (error) {
        console.warn(`Source skipped for "${source.label}": ${error.message}`);
        return [];
      }
    })
  );

  const candidates = [];

  for (const items of sourceResults) {
    for (const item of items) {
      if (!item.link || !item.title) {
        continue;
      }

      const normalizedTitle = normalizeTitle(item.title);
      if (
        recentUrlSet.has(item.link) ||
        recentTitleSet.has(normalizedTitle) ||
        seenLinks.has(item.link) ||
        seenTitles.has(normalizedTitle)
      ) {
        continue;
      }

      if (!hasPriorityIndustry(item.title, item.summary)) {
        continue;
      }

      if (!isStrongSeedTitle(item.title, item.sourceName)) {
        continue;
      }

      if (computeTopicHintScore(item, topicHints) <= 0) {
        continue;
      }

      seenLinks.add(item.link);
      seenTitles.add(normalizedTitle);
      candidates.push(item);
    }
  }

  return candidates
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    })
    .slice(0, limit);
}

export async function fetchDeepResearchPacket({
  news,
  limit = 6,
  maxAgeDays = 365,
  excludeUrls = [],
} = {}) {
  if (!news) {
    return {
      topic: "",
      queries: [],
      items: [],
    };
  }

  const queries = buildResearchQueries(news);
  const focusKeywords = buildFocusKeywords(inferResearchTopic(news));
  const sources = getSourcesByRole("research");
  const excludeSet = new Set([news.link, ...excludeUrls].map((entry) => String(entry || "").trim()).filter(Boolean));
  const seenLinks = new Set();
  const seenTitles = new Set();
  const sourceResults = await Promise.all(
    sources.map(async (source) => {
      try {
        return await fetchSourceItems(source, maxAgeDays, queries);
      } catch (error) {
        console.warn(`Research source skipped for "${source.label}": ${error.message}`);
        return [];
      }
    })
  );

  const items = [];

  for (const sourceItems of sourceResults) {
    for (const item of sourceItems) {
      if (!item.link || !item.title) {
        continue;
      }

      const normalizedTitle = normalizeTitle(item.title);
      if (excludeSet.has(item.link) || seenLinks.has(item.link) || seenTitles.has(normalizedTitle)) {
        continue;
      }

      const relevanceScore = scoreResearchRelevance(item, queries, focusKeywords);
      if (relevanceScore <= 0) {
        continue;
      }

      seenLinks.add(item.link);
      seenTitles.add(normalizedTitle);
      items.push({
        ...item,
        researchQuery: queries.join(" | "),
        score: item.score + relevanceScore,
      });
    }
  }

  return {
    topic: inferResearchTopic(news),
    queries,
    items: items
      .sort((a, b) => {
        const localDelta = Number(hasPreferredLocalSource(b.sourceName)) - Number(hasPreferredLocalSource(a.sourceName));
        if (localDelta !== 0) {
          return localDelta;
        }

        if (b.score !== a.score) {
          return b.score - a.score;
        }

        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      })
      .slice(0, limit),
  };
}
