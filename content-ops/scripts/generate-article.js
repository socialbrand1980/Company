import path from "path";
import dotenv from "dotenv";
import {
  ensureDir,
  writeJson,
  buildOutputPath,
  makeSlug,
  readJson,
  readText,
  createBlock,
  estimateReadTime,
  countWordsInBlocks,
  truncateAtWord,
  extractBulletItems,
  extractSection,
  listJsonFiles,
} from "./helpers.js";
import { generateCoverImage } from "./generate-cover-image.js";
import { FEEDBACK_SIGNALS, hasFeedbackSignal, readFeedbackLearning } from "./feedback-learning.js";
import { fetchDeepResearchPacket, fetchNewsCandidates } from "./news-sourcing.js";
import { fetchRecentPublishedArticleSignals } from "./sanity-intelligence.js";

dotenv.config();

const RECENT_TOPICS_FILE = "recent-topics.json";
const RECENT_NEWS_FILE = "recent-news.json";
const DEFAULT_ARTICLE_COUNT = Number.parseInt(process.env.ARTICLE_COUNT || "1", 10);
const DEFAULT_MIN_WORDS = Number.parseInt(process.env.MIN_WORDS || "800", 10);
const ARTICLE_MODES = new Set(["evergreen", "mixed", "news"]);
const CONTEXT_FILES = {
  agents: "AGENTS.md",
  brand: path.join("docs", "personal-brand.md"),
  audience: path.join("docs", "audience.md"),
  pillars: path.join("docs", "content-pillars.md"),
  offers: path.join("docs", "offers-and-services.md"),
  editorial: path.join("docs", "editorial-rules.md"),
  news: path.join("docs", "news-sourcing.md"),
  topics: path.join("docs", "topic-bank.md"),
  seo: path.join("docs", "seo-rules.md"),
  publishing: path.join("docs", "publishing-rules.md"),
  visual: path.join("docs", "visual-style.md"),
};

function loadBrandContext() {
  const agents = readText(CONTEXT_FILES.agents);
  const brand = readText(CONTEXT_FILES.brand);
  const audience = readText(CONTEXT_FILES.audience);
  const pillars = readText(CONTEXT_FILES.pillars);
  const offers = readText(CONTEXT_FILES.offers);
  const editorial = readText(CONTEXT_FILES.editorial);
  const news = readText(CONTEXT_FILES.news);
  const seo = readText(CONTEXT_FILES.seo);
  const publishing = readText(CONTEXT_FILES.publishing);
  const visual = readText(CONTEXT_FILES.visual);
  const feedbackLearning = readFeedbackLearning();

  return {
    toneRules: extractBulletItems(extractSection(agents, "Tone Rules")).slice(0, 4),
    differentiators: extractBulletItems(extractSection(brand, "What makes this brand different")).slice(0, 4),
    audiencePainPoints: extractBulletItems(audience).slice(0, 6),
    pillarAngles: extractBulletItems(pillars).slice(0, 6),
    serviceAngles: extractBulletItems(extractSection(offers, "Main Services")).slice(0, 6),
    editorialRules: extractBulletItems(extractSection(editorial, "Style Rules")).slice(0, 5),
    newsSelectionRules: extractBulletItems(extractSection(news, "Selection Rules")).slice(0, 5),
    seoRules: extractBulletItems(seo).slice(0, 4),
    publishingRules: extractBulletItems(publishing).slice(0, 3),
    visualMood: extractBulletItems(extractSection(visual, "Preferred Color Mood")).slice(0, 5),
    visualTypes: extractBulletItems(extractSection(visual, "Preferred Cover Image Types")).slice(0, 5),
    visualAvoid: extractBulletItems(extractSection(visual, "What to Avoid")).slice(0, 5),
    feedbackLearning,
  };
}

function parseTopicSections() {
  const topicBank = readText(CONTEXT_FILES.topics);
  const sections = {
    high: [],
    medium: [],
    low: [],
  };

  let current = null;
  topicBank.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed === "## High Priority Topics") current = "high";
    else if (trimmed === "## Medium Priority Topics") current = "medium";
    else if (trimmed === "## Low Priority Topics") current = "low";
    else if (/^\d+\.\s+/.test(trimmed) && current) {
      sections[current].push(trimmed.replace(/^\d+\.\s+/, "").trim());
    }
  });

  return sections;
}

function readRecentOutputTitles() {
  return listJsonFiles("outputs")
    .map((filePath) => {
      try {
        const article = readJson(filePath, null);
        return article?.workflowNotes?.topicSeed || article?.title;
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function mergeRecentTopicEntries(existingEntries, nextEntries, limit = 30) {
  const merged = [];
  const seen = new Set();

  for (const entry of [...existingEntries, ...nextEntries]) {
    const value = String(entry || "").trim();
    if (!value) continue;

    const normalized = normalizeTopic(value);
    if (seen.has(normalized)) continue;

    seen.add(normalized);
    merged.push(value);
  }

  return merged.slice(-limit);
}

function normalizeTopic(topic) {
  return String(topic || "").trim().toLowerCase();
}

function buildTopicCandidates(topicSections) {
  return [
    ...topicSections.high.map((topic) => ({ topic, priority: 3 })),
    ...topicSections.medium.map((topic) => ({ topic, priority: 2 })),
    ...topicSections.low.map((topic) => ({ topic, priority: 1 })),
  ];
}

function scoreTopicWithFeedback(topic, feedbackLearning) {
  let score = 0;
  const category = mapCategory(topic);
  const preferredCategories = feedbackLearning?.preferredCategories || [];
  const discouragedCategories = feedbackLearning?.discouragedCategories || [];
  const preferredContentTypes = feedbackLearning?.preferredContentTypes || [];
  const discouragedContentTypes = feedbackLearning?.discouragedContentTypes || [];

  if (preferredCategories.includes(category)) {
    score += 3;
  }

  if (discouragedCategories.includes(category)) {
    score -= 3;
  }

  if (preferredContentTypes.includes("evergreen")) {
    score += 1;
  }

  if (discouragedContentTypes.includes("evergreen")) {
    score -= 1;
  }

  return score;
}

function isTipsTopic(topic) {
  return /^(cara|framework|audit|checklist|sop|kapan|tanda)\b/i.test(String(topic || "").trim());
}

function getEvergreenStyle() {
  const raw = String(process.env.EVERGREEN_TOPIC_STYLE || "standard").trim().toLowerCase();
  return raw === "tips" ? "tips" : "standard";
}

function pickTopic(topicSections, recentTopics, options = {}) {
  const recentSet = new Set(recentTopics.map((topic) => normalizeTopic(topic)).filter(Boolean));
  const style = options.style || "standard";
  const feedbackLearning = options.feedbackLearning || null;
  const allCandidates = buildTopicCandidates(topicSections);
  const candidates = allCandidates
    .filter(({ topic }) => !recentSet.has(normalizeTopic(topic)))
    .filter(({ topic }) => style !== "tips" || isTipsTopic(topic))
    .sort((a, b) => {
      const priorityGap = b.priority - a.priority;
      if (priorityGap !== 0) {
        return priorityGap;
      }

      return scoreTopicWithFeedback(b.topic, feedbackLearning) - scoreTopicWithFeedback(a.topic, feedbackLearning);
    });

  const fallbackPool = style === "tips"
    ? allCandidates.filter(({ topic }) => isTipsTopic(topic))
    : allCandidates;
  const pool = candidates.length > 0 ? candidates : (fallbackPool.length > 0 ? fallbackPool : allCandidates);
  const highestPriority = pool[0]?.priority ?? 1;
  const samePriority = pool.filter((entry) => entry.priority === highestPriority);
  return samePriority[Math.floor(Math.random() * samePriority.length)].topic;
}

function mapCategory(topic) {
  const normalized = topic.toLowerCase();

  if (
    normalized.includes("social media") ||
    normalized.includes("engagement") ||
    normalized.includes("instagram") ||
    normalized.includes("tiktok") ||
    normalized.includes("youtube") ||
    normalized.includes("algorithm") ||
    normalized.includes("creator")
  ) {
    return "Social Media";
  }

  if (normalized.includes("content") || normalized.includes("workflow") || normalized.includes("approval") || normalized.includes("editorial")) {
    return "Content Marketing";
  }

  return "Brand Strategy";
}

function pickPrimaryAudience(topic) {
  const normalized = topic.toLowerCase();

  if (normalized.includes("team") || normalized.includes("workflow") || normalized.includes("approval")) {
    return "marketing manager dan brand manager";
  }

  if (normalized.includes("scale") || normalized.includes("positioning")) {
    return "brand yang sedang scale dan para founder";
  }

  return "founder dan marketing manager";
}

function derivePillar(topic) {
  const normalized = topic.toLowerCase();

  if (normalized.includes("funnel") || normalized.includes("journey")) return "Funnel and Customer Journey";
  if (normalized.includes("kpi") || normalized.includes("reporting") || normalized.includes("engagement")) return "KPI, Reporting, and Optimization";
  if (normalized.includes("campaign")) return "Campaign Planning";
  if (normalized.includes("content") || normalized.includes("workflow") || normalized.includes("approval")) return "Content System";
  if (
    normalized.includes("social media") ||
    normalized.includes("instagram") ||
    normalized.includes("tiktok") ||
    normalized.includes("youtube") ||
    normalized.includes("algorithm") ||
    normalized.includes("creator")
  ) return "Social Media Growth";
  return "Brand Positioning";
}

function localizePhrase(phrase) {
  const dictionary = {
    "strategy-first approach": "pendekatan yang dimulai dari strategi",
    "sharp brand thinking": "cara berpikir brand yang tajam",
    "practical digital strategy": "strategi digital yang praktis",
    "structured content systems": "sistem konten yang terstruktur",
    "social media growth with business relevance": "pertumbuhan social media yang relevan dengan bisnis",
    "campaign planning with measurable outcomes": "perencanaan campaign dengan outcome yang terukur",
    "premium agency perspective": "perspektif agency premium",
    "operational clarity and marketing decision-making": "kejelasan operasional dan keputusan marketing yang lebih baik",
    "marketing feels random": "marketing terasa acak dan reaktif",
    "content exists but does not move the business": "konten berjalan tetapi tidak menggerakkan bisnis",
    "hard to know what to prioritize": "tim sulit menentukan prioritas",
    "unclear positioning": "positioning belum jelas",
    "inconsistent brand message": "pesan brand tidak konsisten",
    "low conversion from content efforts": "konversi dari konten masih rendah",
    "positioning mistakes": "kesalahan positioning",
    "message clarity": "kejernihan pesan brand",
    "brand narrative": "narasi brand",
    "differentiating in crowded markets": "cara tampil berbeda di pasar yang padat",
    "brand strategy": "konsultasi strategi brand",
    "social media management": "retainer social media",
    "content production": "produksi konten yang terarah",
    "KOL / influencer activation": "aktivasi KOL atau influencer",
    "performance marketing": "dukungan performance marketing",
    "omnichannel marketing": "dukungan omnichannel marketing",
    "premium but accessible": "premium tetapi tetap mudah dipahami",
    "confident but not arrogant": "percaya diri tanpa terkesan arogan",
    "expert but not academic": "ahli tetapi tidak terasa akademis",
    "commercial but not pushy": "komersial tetapi tidak memaksa",
  };

  return dictionary[phrase] || phrase;
}

function localizePillar(pillar) {
  const dictionary = {
    "Funnel and Customer Journey": "funnel dan customer journey",
    "KPI, Reporting, and Optimization": "KPI, reporting, dan optimasi",
    "Campaign Planning": "perencanaan campaign",
    "Content System": "sistem konten",
    "Social Media Growth": "pertumbuhan social media",
    "Brand Positioning": "brand positioning",
  };

  return dictionary[pillar] || pillar.toLowerCase();
}

function buildDecisionLens(topic, pillar) {
  if (pillar === "KPI, Reporting, and Optimization") {
    return "Topik ini paling berguna saat dipakai untuk membedakan metrik yang sekadar terlihat aktif dengan metrik yang benar-benar membantu keputusan bisnis.";
  }

  if (pillar === "Content System") {
    return "Nilai utamanya ada pada kemampuannya mengaudit ritme kerja tim, kualitas briefing, dan kejelasan alur approval.";
  }

  if (pillar === "Campaign Planning") {
    return "Topik ini seharusnya dipakai untuk mengecek apakah objective, message, channel role, dan success metric sudah saling terhubung.";
  }

  if (pillar === "Funnel and Customer Journey") {
    return "Pembacaannya menjadi relevan saat dipakai untuk menguji apakah konten dan campaign sudah mendukung tahap audience yang tepat.";
  }

  return `Inti topik ini ada pada penilaian apakah keputusan di sekitar "${topic}" benar-benar memperkuat positioning dan pertumbuhan bisnis.`;
}

function lowerFirst(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) {
    return trimmed;
  }

  return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
}

function stripTopicPrefix(topic) {
  return String(topic || "")
    .trim()
    .replace(/^(cara|framework|audit|checklist|sop|kapan|tanda|review|analisis strategis)\s+/i, "")
    .trim();
}

function buildEvergreenInsightProfile(topic, pillar, primaryAudience) {
  const normalized = String(topic || "").toLowerCase();
  const topicLabel = lowerFirst(stripTopicPrefix(topic) || topic);
  const baseProfile = {
    operationalSymptom: `${topicLabel} sering dibahas, tetapi prioritas tim tidak benar-benar berubah setelah rapat selesai`,
    businessRisk: "tim memproduksi banyak output tanpa tahu keputusan apa yang sedang diperbaiki",
    auditFocus: "objective, pesan utama, ownership keputusan, dan indikator yang dipakai saat evaluasi",
    firstMove: "memilih satu keputusan yang paling mahal lalu menyederhanakan apa yang harus diperjelas dalam dua minggu ke depan",
    measurement: "kecepatan tim menutup loop evaluasi, kualitas brief, dan apakah prioritas benar-benar berubah setelah data dibaca",
    meetingQuestion: "Keputusan apa yang sebenarnya ingin dibantu oleh topik ini, dan apa bukti bahwa keputusan itu membaik",
    commonTrap: "menambah aktivitas baru sebelum struktur keputusan lamanya dibenahi",
    audienceOutcome: `membantu ${primaryAudience} membuat keputusan marketing yang lebih jernih dan tidak terus kerja reaktif`,
    weeklyCadence: "mulai dari satu masalah prioritas, jalankan perubahan paling relevan, lalu baca hasilnya dengan ukuran yang disepakati sejak awal",
    metaFocus: "prioritas, pesan, dan indikator utama",
    metaAction: "memperjelas satu keputusan inti",
    metaMetric: "indikator yang benar-benar mengubah keputusan",
  };

  if (pillar === "Content System" || /workflow|approval|editorial|pillar/.test(normalized)) {
    return {
      operationalSymptom: "brief sering berubah di tengah jalan, approval menumpuk, dan kalender konten membuat tim terus mengejar deadline",
      businessRisk: "energi tim habis di revisi, konsistensi pesan turun, dan kecepatan eksekusi tidak pernah benar-benar stabil",
      auditFocus: "alur brief, SLA approval, prioritas channel, definisi done, dan siapa pemilik keputusan akhir",
      firstMove: "membekukan satu siklus konten lalu merapikan template brief, SLA approval, dan batas revisi sebelum menambah output baru",
      measurement: "lead time approval, jumlah revisi per asset, dan apakah pesan utama tetap konsisten dari brief sampai tayang",
      meetingQuestion: "Bagian mana dari workflow yang paling mahal: brief yang kabur, approval yang terlalu ramai, atau evaluasi yang tidak pernah menutup loop",
      commonTrap: "membeli tool baru padahal aturan keputusan dan ownership dasarnya masih kabur",
      audienceOutcome: "workflow konten menjadi lebih tenang, lebih cepat, dan lebih bisa dipakai untuk menjaga kualitas keputusan",
      weeklyCadence: "rapikan aturan kerja dan pemilik keputusan, lalu cek apakah kualitas brief dan kecepatan approval benar-benar membaik",
      metaFocus: "brief, approval, dan prioritas channel",
      metaAction: "merapikan satu siklus kerja konten",
      metaMetric: "lead time approval dan jumlah revisi",
    };
  }

  if (pillar === "KPI, Reporting, and Optimization" || /kpi|reporting|engagement|metric|metrics/.test(normalized)) {
    return {
      operationalSymptom: "dashboard ramai, tetapi tim tetap bingung mana sinyal yang layak direspons dan mana yang cuma vanity metric",
      businessRisk: "brand mengoptimalkan angka yang terlihat bagus sementara conversion, kualitas demand, atau margin tidak ikut membaik",
      auditFocus: "hubungan antara objective bisnis, leading indicator, metrik outcome, dan keputusan yang harus berubah saat angka bergerak",
      firstMove: "memangkas dashboard menjadi tiga metrik inti per objective lalu menyepakati keputusan apa yang akan berubah jika tiap metrik naik atau turun",
      measurement: "tren conversion, cost per qualified lead, kualitas pipeline, dan kecepatan tim mengambil keputusan korektif",
      meetingQuestion: "Kalau dashboard dipotong 70 persen, metrik mana yang tetap wajib dipertahankan agar tim tidak buta arah",
      commonTrap: "mengira laporan yang detail otomatis berguna padahal keputusan tim tetap sama dari minggu ke minggu",
      audienceOutcome: "reporting berubah dari arsip aktivitas menjadi alat kalibrasi keputusan bisnis",
      weeklyCadence: "pilih metrik inti, lalu cek apakah rapat evaluasi benar-benar menghasilkan keputusan yang berbeda",
      metaFocus: "objective, metrik inti, dan evaluasi",
      metaAction: "memangkas dashboard ke tiga metrik inti",
      metaMetric: "conversion dan kualitas demand",
    };
  }

  if (pillar === "Campaign Planning" || /campaign|kol|creator/.test(normalized)) {
    return {
      operationalSymptom: "campaign terdengar menarik saat kickoff, tetapi objective, pesan, dan role tiap channel cepat kabur ketika eksekusi dimulai",
      businessRisk: "budget menyebar ke banyak aktivitas tanpa ada satu pendorong hasil yang benar-benar dominan",
      auditFocus: "kesesuaian antara objective, big message, role tiap channel, audience prioritas, dan definisi sukses per fase campaign",
      firstMove: "memilih satu objective utama, satu audience prioritas, dan satu alasan percaya yang wajib muncul di semua asset inti",
      measurement: "lift pada metrik utama, kualitas demand yang masuk, dan gap antara channel yang mendorong reach versus conversion",
      meetingQuestion: "Campaign ini sebenarnya ingin memenangkan perhatian, pertimbangan, atau aksi, dan apakah semua channel punya pekerjaan yang jelas",
      commonTrap: "menambah channel dan format karena takut kehilangan momentum, bukan karena channel itu punya kontribusi yang spesifik",
      audienceOutcome: "campaign menjadi lebih fokus dan lebih mudah dioptimalkan setelah launch",
      weeklyCadence: "sebelum launch cek alignment objective dan message, lalu setelah tayang baca gap antar channel dan potong yang tidak membantu",
      metaFocus: "objective campaign, pesan utama, dan role channel",
      metaAction: "memilih satu objective dan satu audience prioritas",
      metaMetric: "lift metrik utama dan kualitas demand",
    };
  }

  if (pillar === "Funnel and Customer Journey" || /funnel|journey|conversion/.test(normalized)) {
    return {
      operationalSymptom: "konten terlihat aktif di atas funnel, tetapi pertimbangan dan conversion tidak bergerak seimbang di tahap berikutnya",
      businessRisk: "budget bocor karena pesan, offer, dan follow-up tidak sinkron di tiap tahap customer journey",
      auditFocus: "drop-off terbesar, pesan per tahap, friction sebelum conversion, dan handoff antar channel atau tim",
      firstMove: "memetakan satu journey prioritas dari awareness sampai conversion lalu menemukan satu bottleneck paling mahal untuk diuji lebih dulu",
      measurement: "CTR ke langkah berikutnya, conversion per tahap, quality of follow-up, dan waktu yang dibutuhkan prospect untuk bergerak maju",
      meetingQuestion: "Tahap mana yang paling banyak kehilangan calon buyer yang sebenarnya sudah cukup qualified untuk lanjut",
      commonTrap: "memperbaiki konten atas funnel terus-menerus tanpa menyentuh friction yang terjadi sesudahnya",
      audienceOutcome: "customer journey menjadi lebih jelas dan setiap konten punya peran yang bisa dipertanggungjawabkan",
      weeklyCadence: "cari bottleneck terbesar, lalu uji satu perubahan pada pesan, offer, atau follow-up di titik itu",
      metaFocus: "bottleneck funnel, pesan per tahap, dan follow-up",
      metaAction: "memetakan satu journey prioritas",
      metaMetric: "conversion per tahap",
    };
  }

  if (pillar === "Social Media Growth" || /social media|instagram|tiktok|youtube|algorithm|creator/.test(normalized)) {
    return {
      operationalSymptom: "reach naik turun dan tim sulit menjelaskan pengaruhnya ke demand, pipeline, atau kualitas audience yang masuk",
      businessRisk: "brand bergantung pada tren atau format yang ramai tanpa membangun sistem distribusi yang bisa diulang",
      auditFocus: "role tiap format konten, distribusi organic dan paid, CTA yang dipakai, dan hubungan antara attention dengan demand",
      firstMove: "memisahkan konten untuk reach, trust, dan conversion lalu menghentikan format yang ramai tetapi tidak memindahkan audience ke langkah berikutnya",
      measurement: "saves, profile visits, qualified inbound, conversion dari owned channel, dan kecepatan tim memotong format yang tidak efektif",
      meetingQuestion: "Format mana yang benar-benar memindahkan audience ke langkah berikutnya, dan mana yang hanya memberi rasa sibuk",
      commonTrap: "menyamakan engagement tinggi dengan kontribusi bisnis tanpa membaca kualitas audience yang dihasilkan",
      audienceOutcome: "social media dibaca sebagai sistem pertumbuhan, bukan mesin posting yang mengejar variasi format",
      weeklyCadence: "pisahkan peran format, lalu evaluasi apakah attention yang datang benar-benar berubah menjadi trust atau demand",
      metaFocus: "role format, CTA, dan distribusi",
      metaAction: "memisahkan konten untuk reach, trust, dan conversion",
      metaMetric: "qualified inbound dan conversion dari owned channel",
    };
  }

  if (/agency|vendor|offer|penawaran|positioning|storytelling|premium/.test(normalized) || pillar === "Brand Positioning") {
    return {
      operationalSymptom: "pesan brand terasa bisa dipakai siapa saja sehingga tim sales terus turun ke harga, promo, atau pembenaran tambahan",
      businessRisk: "brand sulit premium karena promise, proof, dan siapa yang ingin diyakinkan tidak pernah benar-benar konsisten",
      auditFocus: "janji inti brand, proof yang paling dipercaya market, siapa audience yang ingin dimenangkan, dan bagaimana pesan itu diulang lintas channel",
      firstMove: "merapikan one-sentence positioning lalu mengecek apakah offer, proof, dan CTA di channel utama masih mengikuti logika yang sama",
      measurement: "kualitas inbound, kecepatan menjelaskan nilai brand, close rate, dan seberapa sering sales harus turun ke diskon untuk menutup deal",
      meetingQuestion: "Bagian mana dari pesan brand yang masih terlalu generik untuk memenangkan kategori dan menjaga persepsi premium",
      commonTrap: "mengira storytelling yang rapi otomatis cukup kuat padahal pasar belum diberi alasan percaya yang jelas",
      audienceOutcome: "positioning menjadi lebih mudah dijelaskan, lebih konsisten, dan lebih dekat ke keputusan beli",
      weeklyCadence: "rapikan janji dan proof, lalu cek apakah channel utama mengulang logika yang sama tanpa kontradiksi",
      metaFocus: "janji brand, proof, dan audience prioritas",
      metaAction: "merapikan positioning satu kalimat",
      metaMetric: "kualitas inbound dan close rate",
    };
  }

  return baseProfile;
}

function shortenWords(text, maxWords = 10) {
  return String(text || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, maxWords)
    .join(" ");
}

function hashString(text) {
  return Array.from(String(text || "")).reduce((hash, char) => {
    return (hash * 31 + char.charCodeAt(0)) >>> 0;
  }, 7);
}

function pickVariant(seedSource, variants, offset = 0) {
  if (!variants || variants.length === 0) {
    return "";
  }

  const index = (hashString(seedSource) + offset) % variants.length;
  return variants[index];
}

function pickRotatingVariant(seedSource, variants, iteration = 0, offset = 0) {
  if (!variants || variants.length === 0) {
    return "";
  }

  const baseIndex = hashString(`${seedSource}-${offset}`) % variants.length;
  return variants[(baseIndex + iteration) % variants.length];
}

function buildPracticalTakeaways(topic, profile) {
  const subject = lowerFirst(stripTopicPrefix(topic) || topic);
  return [
    `Gunakan topik "${topic}" sebagai alat audit untuk ${profile.auditFocus}.`,
    `Mulai dari langkah paling tajam: ${profile.firstMove}.`,
    `Pantau ${profile.measurement} supaya diskusi tentang ${subject} tidak berhenti di opini.`,
  ];
}

function getArticleCount() {
  const countArg = process.argv.find((arg) => arg.startsWith("--count="));
  const parsed = countArg ? Number.parseInt(countArg.split("=")[1], 10) : DEFAULT_ARTICLE_COUNT;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function getMinimumWords() {
  const minArg = process.argv.find((arg) => arg.startsWith("--min-words="));
  const parsed = minArg ? Number.parseInt(minArg.split("=")[1], 10) : DEFAULT_MIN_WORDS;
  return Number.isFinite(parsed) && parsed >= 300 ? parsed : 800;
}

function getAdaptiveMinimumWords(baseMinimum, feedbackLearning, contentType) {
  let minimum = baseMinimum;

  if (hasFeedbackSignal(feedbackLearning, FEEDBACK_SIGNALS.increaseBusinessDepth)) {
    minimum += contentType === "newsAnalysis" ? 180 : 120;
  }

  if (hasFeedbackSignal(feedbackLearning, FEEDBACK_SIGNALS.increaseSpecificity)) {
    minimum += 80;
  }

  return minimum;
}

function getAdaptiveResearchLimit(feedbackLearning) {
  let limit = 6;

  if (hasFeedbackSignal(feedbackLearning, FEEDBACK_SIGNALS.increaseSourceDensity)) {
    limit += 2;
  }

  if (hasFeedbackSignal(feedbackLearning, FEEDBACK_SIGNALS.increaseLocalContext)) {
    limit += 1;
  }

  return limit;
}

function getArticleMode() {
  const raw = String(process.env.ARTICLE_MODE || "evergreen").trim().toLowerCase();
  return ARTICLE_MODES.has(raw) ? raw : "evergreen";
}

function getNewsArticleCount(totalCount, mode) {
  if (mode === "evergreen") {
    return 0;
  }

  const raw = Number.parseInt(process.env.NEWS_ARTICLE_COUNT || "", 10);
  if (Number.isFinite(raw) && raw >= 0) {
    return Math.min(totalCount, raw);
  }

  if (mode === "news") {
    return totalCount;
  }

  return Math.max(1, Math.floor(totalCount / 2));
}

function getNewsMaxAgeDays() {
  const raw = Number.parseInt(process.env.NEWS_MAX_AGE_DAYS || "7", 10);
  return Number.isFinite(raw) && raw > 0 ? raw : 7;
}

function getNewsArticleStyle() {
  const raw = String(process.env.NEWS_ARTICLE_STYLE || "premium").trim().toLowerCase();
  return raw === "standard" ? "standard" : "premium";
}

function getNewsPoolOffset() {
  const raw = Number.parseInt(process.env.NEWS_POOL_OFFSET || "0", 10);
  return Number.isFinite(raw) && raw >= 0 ? raw : 0;
}

function getResearchMode() {
  const raw = String(process.env.ARTICLE_RESEARCH_MODE || "deep").trim().toLowerCase();
  return raw === "standard" ? "standard" : "deep";
}

function getDeepResearchMaxAgeDays() {
  const raw = Number.parseInt(process.env.DEEP_RESEARCH_MAX_AGE_DAYS || "365", 10);
  return Number.isFinite(raw) && raw > 0 ? raw : 365;
}

function buildCoverImageStyle(category, context) {
  const colorMood = context.visualMood.join(", ");
  const visualType = context.visualTypes[0] || "premium business editorial scenes";

  return {
    category,
    mood: "premium, strategic, modern, editorial",
    colorPalette: colorMood || "deep navy, charcoal black, electric blue, cyan accents",
    preferredType: visualType,
  };
}

function buildCoverImageBrief(topic, category, context) {
  const avoidList = context.visualAvoid.slice(0, 3).join(", ");
  const palette = context.visualMood.slice(0, 4).join(", ");

  return `Buat cover image untuk artikel "${topic}" dengan nuansa premium editorial, modern, dan strategis. Gunakan pendekatan visual yang relevan dengan kategori ${category}, dominasi warna ${palette}, komposisi bersih dengan focal point kuat, dan metafora bisnis yang terasa cerdas. Hindari ${avoidList}.`;
}

function buildCoverImageAlt(topic, category) {
  const categoryMap = {
    "Brand Strategy": "Ilustrasi editorial premium tentang strategi brand dan kejelasan positioning untuk pertumbuhan bisnis.",
    "Social Media": "Ilustrasi modern tentang sistem pertumbuhan social media dan pembacaan performa marketing.",
    "Content Marketing": "Ilustrasi editorial tentang workflow konten, perencanaan, dan eksekusi marketing yang terstruktur.",
  };

  return categoryMap[category] || `Ilustrasi editorial premium yang merepresentasikan topik ${topic.toLowerCase()} dalam konteks bisnis.`;
}

function buildEvergreenSectionPlan(topic, context, pillar, primaryAudience, profile) {
  const decisionLens = buildDecisionLens(topic, pillar);
  const differentiator = localizePhrase(context.differentiators[0] || "strategy-first approach");
  const pillarAngle = localizePhrase(context.pillarAngles[0] || "positioning mistakes");
  const serviceAngle = localizePhrase(context.serviceAngles[0] || "brand strategy");
  const toneRule = localizePhrase(context.toneRules[0] || "premium but accessible");
  const subject = lowerFirst(stripTopicPrefix(topic) || topic);
  const seed = `${topic}-${pillar}-section-plan`;
  const sections = {
    diagnosis: {
      heading: pickVariant(seed, [
        "Gejala yang Perlu Dibaca Lebih Dulu",
        "Masalah yang Biasanya Muncul di Permukaan",
        "Sinyal Awal yang Terlalu Sering Diabaikan",
      ]),
      paragraphs: [
        `Untuk ${primaryAudience}, isu ${subject} biasanya mulai terasa mahal ketika ${profile.operationalSymptom}. Di fase itu, tim bukan kekurangan aktivitas, tetapi kekurangan struktur keputusan yang cukup tegas untuk memotong hal yang tidak penting.`,
        `${profile.businessRisk.charAt(0).toUpperCase() + profile.businessRisk.slice(1)}. Itu sebabnya banyak tim terlihat sibuk, tetapi dampaknya sulit dikaitkan ke objective bisnis yang benar-benar ingin dikejar.`,
      ],
    },
    tradeoff: {
      heading: pickVariant(seed, [
        "Trade-off yang Harus Dibuat Terlihat",
        "Kenapa Isu Ini Cepat Menjadi Mahal",
        "Di Mana Banyak Tim Salah Membaca",
      ], 1),
      paragraphs: [
        `${decisionLens} Selama trade-off utamanya tidak dibuat terlihat, tim akan terus menambah output tanpa pernah menyepakati apa yang memang perlu dihentikan.`,
        `Masalah seperti ini jarang berdiri sendiri. Ia cepat merembet ke area lain seperti ${pillarAngle}, dan jebakan yang paling sering muncul adalah ${profile.commonTrap}.`,
      ],
    },
    audit: {
      heading: pickVariant(seed, [
        "Audit yang Paling Berguna",
        "Apa yang Harus Diperiksa Lebih Dulu",
        "Cara Membacanya dengan Lebih Tajam",
      ], 2),
      paragraphs: [
        `Audit terbaik untuk topik ini tidak dimulai dari ide baru, tetapi dari ${profile.auditFocus}. Fokusnya adalah menemukan bottleneck keputusan mana yang paling mahal bila dibiarkan satu bulan lagi.`,
        `Pendekatan ${differentiator} relevan di sini karena ia memaksa tim menghubungkan strategi, eksekusi, dan evaluasi dalam satu logika yang sama. Jadi, pembahasannya tidak berhenti di output atau opini yang terdengar rapi.`,
      ],
    },
    action: {
      heading: pickVariant(seed, [
        "Langkah yang Paling Masuk Akal",
        "Apa yang Perlu Dilakukan Sekarang",
        "Kalau Harus Bergerak, Mulai dari Sini",
      ], 3),
      paragraphs: [
        `Langkah paling sehat adalah ${profile.firstMove}. Urutannya sengaja dibuat sempit supaya tim belajar memperbaiki satu keputusan dengan benar sebelum menambah kompleksitas baru.`,
        `${profile.weeklyCadence.charAt(0).toUpperCase() + profile.weeklyCadence.slice(1)}. Dengan ritme seperti ini, tim punya kesempatan membaca sebab-akibat, bukan sekadar menumpuk aktivitas lalu berharap hasilnya terasa.`,
      ],
    },
    metrics: {
      heading: pickVariant(seed, [
        "Metrik yang Layak Dipantau",
        "Bukti yang Harus Dikunci dari Awal",
        "Supaya Diskusinya Tidak Berhenti di Opini",
      ], 4),
      paragraphs: [
        `Supaya diskusi tentang ${subject} tidak berhenti di opini, pantau ${profile.measurement}. Ukuran itu penting karena ia memaksa tim membaca kualitas keputusan, bukan hanya volume pekerjaan.`,
        `Kalau indikator tadi tidak bergerak, jangan langsung menambah kampanye atau format baru. Periksa kembali apakah ownership, urutan kerja, dan definisi suksesnya memang sudah cukup jelas untuk dijalankan.`,
      ],
    },
    meeting: {
      heading: pickVariant(seed, [
        "Pertanyaan yang Layak Dibawa ke Meeting",
        "Kalau Dibahas di Level Founder",
        "Pertanyaan yang Menentukan Langkah Berikutnya",
      ], 5),
      paragraphs: [
        `${profile.meetingQuestion}? Pertanyaan itu sengaja dibuat keras karena tanpa pertanyaan seperti ini, tim biasanya kembali ke kebiasaan lama yang terasa aman tetapi mahal.`,
        `Kalau tim kesulitan menjaga disiplin seperti ini secara konsisten, dukungan seperti ${serviceAngle} menjadi relevan. Tujuannya bukan menambah komentar, tetapi menjaga mutu keputusan sampai arah kerja terasa lebih ${toneRule}.`,
      ],
    },
  };

  const orderMap = {
    "Content System": ["diagnosis", "audit", "action", "metrics", "meeting"],
    "KPI, Reporting, and Optimization": ["diagnosis", "metrics", "audit", "action", "meeting"],
    "Campaign Planning": ["diagnosis", "tradeoff", "audit", "action", "meeting"],
    "Funnel and Customer Journey": ["diagnosis", "audit", "metrics", "action", "meeting"],
    "Social Media Growth": ["diagnosis", "tradeoff", "metrics", "action", "meeting"],
    "Brand Positioning": ["diagnosis", "tradeoff", "audit", "action", "meeting"],
  };

  const sectionOrder = orderMap[pillar] || ["diagnosis", "tradeoff", "audit", "action", "meeting"];
  return sectionOrder.map((key) => sections[key]).filter(Boolean);
}

function buildBlocks(topic, context) {
  const pillar = derivePillar(topic);
  const primaryAudience = pickPrimaryAudience(topic);
  const profile = buildEvergreenInsightProfile(topic, pillar, primaryAudience);
  const sections = buildEvergreenSectionPlan(topic, context, pillar, primaryAudience, profile);
  const introSeed = `${topic}-${pillar}-intro`;
  const introBlocks = [
    createBlock(
      pickVariant(introSeed, [
        `Topik ${lowerFirst(topic)} biasanya mulai terasa mendesak ketika ${profile.operationalSymptom}. Di fase itu, masalah utamanya jarang ada di tool atau tenaga, tetapi di mutu keputusan yang mengatur pekerjaan harian.`,
        `${topic} sering terdengar seperti isu eksekusi, padahal akarnya justru ada di struktur keputusan. Begitu ${profile.operationalSymptom}, brand mulai membayar harga dari prioritas yang tidak pernah dibuat jelas.`,
        `Kalau ${lowerFirst(topic)} terus muncul sebagai masalah, biasanya itu tanda bahwa organisasi sedang bertumbuh lebih cepat daripada kualitas cara memilihnya. Yang dibutuhkan bukan aktivitas tambahan, tetapi kerangka yang membuat keputusan terasa lebih keras dan lebih jernih.`,
      ])
    ),
    createBlock(
      pickVariant(introSeed, [
        `${profile.businessRisk.charAt(0).toUpperCase() + profile.businessRisk.slice(1)}. Karena itu, artikel seperti ini harus dibaca sebagai alat untuk menajamkan keputusan, bukan sekadar menambah teori baru.`,
        `Efek buruknya jarang datang sekaligus. Ia muncul sebagai brief yang melemah, rapat yang berputar, dan evaluasi yang tidak pernah benar-benar mengubah arah kerja berikutnya.`,
        `Begitu pola ini dibiarkan, tim terlihat aktif tetapi keputusan intinya tetap kabur. Itulah alasan kenapa topik ini penting dibahas pada level bisnis, bukan hanya operasional.`,
      ], 1)
    ),
  ];
  const sectionBlocks = sections.flatMap((section) => ([
    createBlock(section.heading, "h2"),
    ...section.paragraphs.map((paragraph) => createBlock(paragraph)),
  ]));

  return [
    ...introBlocks,
    ...sectionBlocks,
    createBlock("Hal yang Perlu Dibawa ke Rapat", "h2"),
    ...buildPracticalTakeaways(topic, profile).map((item) => createBlock(`- ${item}`)),
    createBlock(
      `Pada akhirnya, nilai dari topik ${lowerFirst(topic)} ada pada kemampuannya membantu tim membaca ${profile.auditFocus} dengan lebih jernih. Kalau setelah membaca ini tim masih hanya menambah daftar kerja, berarti masalah intinya belum benar-benar disentuh.`
    ),
  ];
}

function buildExpansionBlocks(topic, context, iteration = 0) {
  const pillar = derivePillar(topic);
  const primaryAudience = pickPrimaryAudience(topic);
  const profile = buildEvergreenInsightProfile(topic, pillar, primaryAudience);
  const serviceAngle = localizePhrase(context.serviceAngles[1] || context.serviceAngles[0] || "brand strategy");
  const editorialRule = context.editorialRules[0] || "be direct";
  const seed = `${topic}-${pillar}-expansion-${iteration}`;
  const evergreenSeed = `${topic}-${pillar}-evergreen-expansion`;

  if (iteration === 0) {
    return [
      createBlock(
        pickVariant(seed, [
          "Yang Sering Terlewat Setelah Audit Awal",
          "Kalau Mau Membawanya ke Level Operasional",
          "Satu Keputusan yang Biasanya Menentukan",
        ]),
        "h2"
      ),
      createBlock(
        pickVariant(seed, [
          `Bagian yang paling sering terlewat dari topik ${lowerFirst(topic)} adalah keberanian mengubah ritme kerja, bukan hanya bahasanya. Setelah audit awal selesai, tim harus berani menindaklanjuti ${profile.firstMove} tanpa menunggu semuanya terasa sempurna.`,
          `Topik ${lowerFirst(topic)} baru terasa nyata ketika diterjemahkan ke prioritas mingguan. Titik tekannya bukan ide apa yang mau ditambah, tetapi keputusan mana yang harus dipotong, dipertegas, atau dipindahkan pemiliknya.`,
          `Banyak tim sudah bisa mengidentifikasi gejalanya, tetapi berhenti sebelum menyentuh konsekuensinya. Padahal kualitas keputusan justru diuji saat ada sesuatu yang benar-benar dihentikan demi menjaga fokus.`,
        ], 1)
      ),
      createBlock(
        pickVariant(seed, [
          `Di titik itu, partner seperti ${serviceAngle} berguna bukan untuk menambah noise, tetapi untuk menjaga supaya diskusi tentang ${profile.auditFocus} tetap menghasilkan keputusan. Prinsip seperti "${editorialRule}" penting karena kompleksitas biasanya naik lebih cepat daripada kejernihan pesan tim.`,
          `Semakin besar bisnis bertumbuh, semakin mahal biaya dari prioritas yang salah. Itulah alasan kenapa kualitas cara memilih sering lebih penting daripada sekadar kecepatan eksekusi.`,
          `Kalau fase lanjutan ini dijaga dengan disiplin, tim tidak hanya memperbaiki output. Mereka memperbaiki cara berpikir yang menghasilkan output tersebut sejak awal.`,
        ], 2)
      ),
    ];
  }

  const followUpIteration = Math.max(0, iteration - 1);
  const cycle = Math.floor(followUpIteration / 3);
  const refinementA = cycle === 0
    ? ""
    : ` ${pickRotatingVariant(evergreenSeed, [
      "Pada putaran evaluasi berikutnya, yang perlu dicari bukan ide baru, tetapi titik keputusan mana yang paling banyak membuang energi tim.",
      "Di fase lanjutan seperti ini, kualitas strategi biasanya terlihat dari seberapa berani tim menyederhanakan fokusnya sendiri.",
      "Semakin jauh diskusi berjalan, semakin penting memastikan bahwa semua prioritas tambahan masih terhubung ke objective bisnis yang sama.",
    ], cycle - 1, 11)}`;
  const refinementB = cycle === 0
    ? ""
    : ` ${pickRotatingVariant(evergreenSeed, [
      "Dengan begitu, tim tidak hanya sibuk merapikan output, tetapi juga memperbaiki mutu keputusan yang menghasilkan output tersebut.",
      "Itulah yang biasanya membedakan brand yang terus bergerak dengan brand yang benar-benar maju.",
      "Kalau bagian ini dijaga, pertumbuhan brand tidak hanya terasa aktif, tetapi juga makin mudah dipahami arahnya.",
    ], cycle - 1, 12)}`;

  return [
    createBlock(
      `${pickRotatingVariant(evergreenSeed, [
        `Kalau dibawa selangkah lebih jauh, topik ${lowerFirst(topic)} sebenarnya bicara tentang standar berpikir. Tim yang matang tidak hanya bertanya apa yang harus dikerjakan, tetapi kenapa satu prioritas layak didahulukan dibanding yang lain.`,
        `Semakin banyak channel dan inisiatif berjalan, semakin penting topik ${lowerFirst(topic)} dipakai sebagai alat penyaring. Tanpa itu, semua pekerjaan akan terlihat sama penting meski efek bisnisnya sangat berbeda.`,
        `Buat founder, lapisan tambahan dari topik ${lowerFirst(topic)} ada pada keberanian mengevaluasi keputusan lama. Sering kali yang perlu diperbaiki bukan rencana baru, tetapi asumsi lama yang diam-diam menghambat hasil.`,
      ], followUpIteration, 3)}${refinementA}`
    ),
    createBlock(
      `${pickRotatingVariant(evergreenSeed, [
        `Di fase ini, partner seperti ${serviceAngle} bisa membantu sebagai sparring partner yang menjaga mutu keputusan. Fokusnya bukan mengambil alih semua hal, tetapi memastikan energi tim tidak habis di area yang salah.`,
        `Karena itu, kualitas eksekusi tidak pernah berdiri sendiri. Ia selalu bergantung pada kualitas cara baca tim terhadap ${profile.auditFocus} dan disiplin mereka dalam menguji hasilnya.`,
        `Kalau prinsip seperti "${editorialRule}" dijaga dengan serius, brand biasanya lebih cepat menemukan pesan yang relevan dan lebih lambat terjebak pada pekerjaan yang hanya terlihat penting di permukaan.`,
      ], followUpIteration, 4)}${refinementB}`
    ),
  ];
}

function formatNewsDate(dateString) {
  try {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

function mapNewsCategory(news) {
  return mapCategory(`${news.title} ${news.summary || ""}`);
}

function buildNewsExcerpt(news) {
  const frame = buildNewsFrame(news);
  return truncateAtWord(
    `${frame.title}. Analisis strategi untuk membaca positioning, channel, dan konteks pasar yang relevan bagi brand di Indonesia.`,
    150
  );
}

function sanitizeNewsSummary(summary, news) {
  const raw = String(summary || "")
    .replace(new RegExp(news.sourceName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig"), " ")
    .replace(new RegExp(news.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig"), " ")
    .replace(/\s+/g, " ")
    .trim();

  return raw.length >= 40
    ? raw
    : "Berita ini memberi sinyal bisnis yang cukup jelas untuk dibaca dari sudut pandang brand, distribusi, dan keputusan pertumbuhan.";
}

function sanitizeResearchSummary(item) {
  return String(item?.summary || item?.title || "")
    .replace(/\s+/g, " ")
    .trim();
}

function findResearchItem(items, keywords = []) {
  return items.find((item) => {
    const haystack = `${item.title} ${item.summary || ""} ${item.researchQuery || ""}`.toLowerCase();
    return keywords.some((keyword) => haystack.includes(keyword));
  }) || null;
}

function extractMetricSnippet(text) {
  const source = String(text || "");
  const patterns = [
    /CAGR\s?[0-9][0-9.,]*\s?%/i,
    /[0-9][0-9.,]*\s?%/i,
    /(USD|US\$|\$|Rp|IDR)\s?[0-9][0-9.,]*(?:\s?(?:miliar|billion|trillion|juta|million|bn|tn))/i,
    /(USD|US\$|\$|Rp|IDR)\s?[0-9][0-9.,]{3,}/i,
    /20[0-9]{2}/,
  ];

  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return "";
}

function buildResearchContextSentence(item, fallback) {
  if (!item) {
    return fallback;
  }

  const titleSnippet = shortenWords(item.title || "", 12).toLowerCase();
  return `${item.sourceName} juga memberi konteks tambahan lewat laporan tentang ${titleSnippet}, sehingga sinyal yang dibaca tidak berhenti pada satu headline saja.`;
}

function pickDistinctResearchItem(primaryItem, usedLinks = new Set()) {
  if (!primaryItem?.link) {
    return primaryItem;
  }

  if (usedLinks.has(primaryItem.link)) {
    return null;
  }

  usedLinks.add(primaryItem.link);
  return primaryItem;
}

function buildNewsSeoDescription(news) {
  const frame = buildNewsFrame(news);
  return truncateAtWord(
    `${frame.title}. Bahas channel, positioning, dan konteks pasar untuk brand di Indonesia.`,
    145
  );
}

function buildNewsPracticalTakeaways(news) {
  const frame = buildNewsFrame(news);
  const type = inferNewsType(news);
  const watchFocusMap = {
    acquisition: "portofolio, distribusi, dan posisi kategori",
    partnership: "asosiasi brand, kualitas audience, dan relevansi kolaborasi",
    ai: "workflow yang diubah, efisiensi operasional, dan kualitas keputusan",
    distribution: "peran channel, economics distribusi, dan perilaku buyer",
    recognition: "atribut brand yang sedang diberi premi market",
    "strategic-move": "prioritas kategori, channel, dan sinyal persaingan",
  };

  return [
    `Jangan berhenti di headline "${news.title}". Baca dulu logika bisnis di balik peristiwanya, lalu baru ukur relevansinya ke brand Anda.`,
    `Gunakan pertanyaan ini sebagai audit: ${frame.auditQuestion}`,
    `Pantau ${watchFocusMap[type] || watchFocusMap["strategic-move"]} agar pembacaan berita tidak berhenti di opini atau FOMO.`,
  ];
}

function stripNewsDecorators(text) {
  return String(text || "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractLeadEntity(title) {
  const clean = stripNewsDecorators(title);
  const separators = [
    " announces ",
    " reports ",
    " records ",
    " posts ",
    " accelerates ",
    " plans ",
    " invests ",
    " raises ",
    " targets ",
    " eyes ",
    " launch",
    " launches ",
    " enters ",
    " expands ",
    " acquires ",
    " acquisition ",
    " partners ",
    " partnership ",
    " turns to ",
    " bets on ",
    ":",
  ];

  const lower = clean.toLowerCase();
  for (const separator of separators) {
    const index = lower.indexOf(separator.trim() === ":" ? ":" : separator);
    if (index > 0) {
      return clean.slice(0, index).trim();
    }
  }

  return shortenWords(clean, 4);
}

function looksLikeBrandEntity(entity) {
  const words = String(entity || "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return false;
  }

  const capitalizedCount = words.filter((word) => /^[A-Z0-9&]/.test(word)).length;
  return capitalizedCount >= Math.max(1, Math.ceil(words.length / 2));
}

function inferNewsSector(title) {
  const haystack = String(title || "").toLowerCase();
  if (/(beauty|skincare|cosmetics|makeup|fragrance|sephora|ulta|clinique)/.test(haystack)) return "beauty";
  if (/(fashion|apparel|luxury)/.test(haystack)) return "fashion";
  if (/\bai\b|artificial intelligence|software|saas/.test(haystack)) return "AI";
  if (/(fintech|payment|bank|wallet)/.test(haystack)) return "fintech";
  if (/(retail|marketplace|e-commerce|ecommerce|shop)/.test(haystack)) return "retail";
  return "brand";
}

function buildNewsFrame(news) {
  const rawTitle = stripNewsDecorators(news.title);
  const lower = rawTitle.toLowerCase();
  const entity = extractLeadEntity(rawTitle);
  const sector = inferNewsSector(rawTitle);

  if (/tiktok shop/.test(lower) && /net sales|sales jump|sales/.test(lower)) {
    return {
      title: `Apa arti langkah ${entity} masuk ke TikTok Shop bagi brand`,
      eventSummary: `${entity} mulai mendorong TikTok Shop ketika penjualan masih tumbuh, sehingga isu utamanya bukan sekadar ekspansi channel, tetapi perpindahan fungsi social dari discovery ke commerce.`,
      implication: "Untuk brand consumer, ini menandakan social commerce makin layak dibaca sebagai kanal penjualan yang serius, bukan sekadar eksperimen kampanye.",
      auditQuestion: "Apakah brand Anda masih memisahkan channel awareness dan channel transaksi terlalu kaku?",
    };
  }

  if (/creator-led campaign|creator led campaign/.test(lower)) {
    return {
      title: `Mengapa campaign creator-led mulai penting untuk brand ${sector}`,
      eventSummary: `${entity} memilih format campaign yang bertumpu pada figur creator atau talent, bukan hanya presentasi produk yang dingin dan seragam.`,
      implication: "Artinya, daya dorong kampanye kini makin bergantung pada kedekatan narasi dan kredibilitas figur, bukan sekadar polish visual.",
      auditQuestion: "Kalau brand Anda memakai creator, apakah perannya benar-benar membangun kepercayaan atau hanya menambah distribusi?",
    };
  }

  if (/rising oil prices|oil prices/.test(lower) && /fashion/.test(lower)) {
    return {
      title: "Apa dampak kenaikan harga minyak bagi brand fashion",
      eventSummary: "Kenaikan harga minyak mulai menekan biaya bahan baku, logistik, dan margin di industri fashion.",
      implication: "Buat brand fashion, isu ini cepat berubah dari berita makro menjadi masalah pricing, inventory, dan positioning produk.",
      auditQuestion: "Apakah brand Anda sudah tahu biaya mana yang paling cepat menekan margin saat tekanan makro naik?",
    };
  }

  if (/paris fashion week|fashion week/.test(lower)) {
    return {
      title: "Apa yang bisa dipelajari brand dari sinyal Paris Fashion Week",
      eventSummary: `${entity} menyoroti brand dan tren yang paling menonjol di Paris Fashion Week, yang berarti market sedang memperlihatkan selera dan simbol status apa yang kembali dianggap penting.`,
      implication: "Buat brand fashion dan lifestyle, sinyal seperti ini berguna untuk membaca arah estetika, harga diri kategori, dan cara diferensiasi dibangun.",
      auditQuestion: "Apakah brand Anda sedang membaca tren sebagai permukaan visual saja, atau sebagai perubahan selera yang memengaruhi produk dan pesan?",
    };
  }

  if (/(partnership|partners|collaboration|collab)/.test(lower)) {
    return {
      title: /f1 academy/.test(lower)
        ? "Apa arti kolaborasi Sephora dengan F1 Academy bagi brand beauty"
        : `Apa arti kolaborasi ${entity} bagi strategi brand`,
      eventSummary: /f1 academy/.test(lower)
        ? "Sephora mengaitkan brand-nya dengan F1 Academy, sehingga pesan yang muncul bukan sekadar sponsorship, tetapi perebutan relevansi di titik temu antara beauty, sport, dan kultur populer."
        : `${entity} memilih kolaborasi sebagai alat untuk memperluas relevansi dan membentuk asosiasi baru di kepala audiens.`,
      implication: "Kolaborasi seperti ini penting dibaca karena brand sedang mencari jalan untuk masuk ke komunitas dan percakapan yang lebih besar daripada kategori produknya sendiri.",
      auditQuestion: "Kalau brand Anda berkolaborasi, apakah tujuannya sekadar exposure, atau benar-benar memindahkan persepsi brand ke ruang baru?",
    };
  }

  if (/(acquires|acquire|acquisition|buys|buy)/.test(lower)) {
    return {
      title: `Pelajaran brand dari langkah akuisisi ${entity}`,
      eventSummary: `Langkah akuisisi ini menunjukkan bahwa pertumbuhan kategori makin sering dikejar lewat kombinasi portofolio, distribusi, dan kecepatan masuk pasar.`,
      implication: "Bagi brand lain, yang penting dibaca bukan ukuran transaksinya, tetapi logika kenapa kategori itu dianggap layak dipercepat sekarang.",
      auditQuestion: "Kalau market bergerak lewat akuisisi, apa artinya bagi posisi brand Anda di kategori tersebut?",
    };
  }

  if (/\bai\b|artificial intelligence/.test(lower)) {
    return {
      title: `Apa yang bisa dipelajari brand dari langkah AI ${entity}`,
      eventSummary: `${entity} memakai AI bukan sebagai gimmick, tetapi sebagai cara mempercepat operasi, personalisasi, atau efisiensi keputusan.`,
      implication: "Untuk brand dan tim growth, pertanyaannya bukan apakah AI dipakai, tetapi pekerjaan mana yang paling layak diubah oleh AI terlebih dahulu.",
      auditQuestion: "Kalau tim Anda bicara AI, apakah pembahasannya sudah terhubung ke output bisnis yang jelas?",
    };
  }

  if (/(online shopping|ecommerce|e-commerce)/.test(lower) && /[0-9][0-9.,]*\s?%/.test(lower)) {
    return {
      title: "Apa arti lonjakan ecommerce bagi strategi brand",
      eventSummary: "Pertumbuhan ecommerce yang kuat menunjukkan bahwa perilaku beli digital masih bergerak, dan implikasinya bukan hanya pada transaksi tetapi juga pada ekspektasi channel, promosi, dan kecepatan distribusi.",
      implication: "Bagi brand consumer, sinyal seperti ini penting untuk membaca ulang peran marketplace, social commerce, dan owned channel dalam struktur pertumbuhan mereka.",
      auditQuestion: "Apakah struktur channel brand Anda masih selaras dengan cara buyer sekarang menemukan dan membeli produk?",
    };
  }

  const genericTitle = looksLikeBrandEntity(entity)
    ? pickVariant(rawTitle, [
      `Apa arti langkah ${entity} bagi brand ${sector}`,
      `Pelajaran strategi dari langkah ${entity}`,
      `Apa yang bisa dipelajari brand dari langkah ${entity}`,
    ])
    : pickVariant(rawTitle, [
      `Apa arti pergeseran ${sector} ini bagi strategi brand`,
      `Pelajaran strategi dari perubahan di ${sector}`,
      `Apa yang bisa dipelajari brand dari sinyal ${sector} ini`,
    ]);

  return {
    title: genericTitle,
    eventSummary: `Ada langkah penting yang diambil ${entity}, dan nilainya terletak pada perubahan prioritas bisnis yang sedang dicoba dibaca oleh market.`,
    implication: "Yang perlu diperhatikan bukan besarnya headline, tetapi alasan bisnis yang membuat langkah itu terasa mendesak.",
    auditQuestion: "Apakah berita ini mengubah cara Anda membaca prioritas brand, channel, atau kategori?",
  };
}

function buildNewsTitle(news) {
  return buildNewsFrame(news).title;
}

function inferNewsType(news) {
  const lower = `${news.title} ${news.summary || ""}`.toLowerCase();

  if (/(acquires|acquire|acquisition|merger|buys|buy)/.test(lower)) return "acquisition";
  if (/(partnership|partners|collaboration|collab|sponsorship)/.test(lower)) return "partnership";
  if (/\bai\b|artificial intelligence|automation/.test(lower)) return "ai";
  if (/(tiktok shop|marketplace|retail|distribution|expands|enters|opens|launches)/.test(lower)) return "distribution";
  if (/(award|excellence|wins|penghargaan)/.test(lower)) return "recognition";
  return "strategic-move";
}

function buildResearchDetail(item, fallback) {
  if (!item) {
    return fallback;
  }

  const summary = sanitizeResearchSummary(item)
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .filter((sentence, index, all) => all.findIndex((entry) => entry.toLowerCase() === sentence.toLowerCase()) === index)
    .slice(0, 1)
    .join(" ");
  const metric = extractMetricSnippet(`${item.title} ${item.summary || ""}`);
  const shortSummary = truncateAtWord(summary, 120).toLowerCase();

  if (!shortSummary) {
    return fallback;
  }

  if (metric) {
    return `${item.sourceName} menambah konteks dengan data ${metric} dalam pembahasan tentang ${shortSummary}.`;
  }

  return `${item.sourceName} juga memberi konteks lewat pembahasan tentang ${shortSummary}.`;
}

function hasLocalNewsContext(news, researchItems = []) {
  const haystack = `${news.title} ${news.summary || ""} ${researchItems.map((item) => `${item.title} ${item.sourceName}`).join(" ")}`.toLowerCase();
  return /indonesia|indonesian|jakarta|umkm|ri\b|tokopedia|shopee|tiktok shop|compas|katadata|bps|kemenperin|bpom/.test(haystack);
}

function buildNewsInsightProfile(news, context, articleTitle, researchPacket = null, mode = "standard") {
  const dateLabel = formatNewsDate(news.publishedAt);
  const category = mapNewsCategory(news);
  const pillar = derivePillar(`${news.title} ${news.summary || ""}`);
  const summary = news.summary || "Sumber berita menampilkan update yang relevan untuk dibaca dari kacamata brand, marketing, dan keputusan bisnis.";
  const cleanSummary = sanitizeNewsSummary(summary, news);
  const type = inferNewsType(news);
  const serviceAngle = localizePhrase(context.serviceAngles[0] || "brand strategy");
  const seed = `${news.title}-${news.sourceName}-${articleTitle}-${mode}`;
  const frame = buildNewsFrame(news);
  const researchItems = researchPacket?.items || [];
  const usedResearchLinks = new Set();
  const marketItem = pickDistinctResearchItem(
    findResearchItem(researchItems, ["market", "growth", "forecast", "sales", "revenue", "outlook"]),
    usedResearchLinks
  );
  const consumerItem = pickDistinctResearchItem(
    findResearchItem(researchItems, ["consumer", "gen z", "gen alpha", "buyer", "demand", "adoption"]),
    usedResearchLinks
  );
  const channelItem = pickDistinctResearchItem(
    findResearchItem(researchItems, ["ecommerce", "marketplace", "retail", "distribution", "social commerce", "platform"]),
    usedResearchLinks
  );
  const localItem = pickDistinctResearchItem(
    findResearchItem(researchItems, ["indonesia", "jakarta", "umkm", "ri", "tokopedia", "shopee", "tiktok"]),
    usedResearchLinks
  );
  const primaryMetric = extractMetricSnippet(`${news.title} ${summary} ${researchItems.map((item) => `${item.title} ${item.summary || ""}`).join(" ")}`);
  const hasLocalContext = hasLocalNewsContext(news, researchItems);

  const typeMap = {
    acquisition: {
      whyNow: "Market sedang bergerak ke arah portofolio yang lebih lebar, distribusi yang lebih rapat, dan kecepatan masuk kategori yang lebih tinggi.",
      brandImpact: "Buat brand lain, isu utamanya bukan sekadar ukuran transaksi, tetapi siapa yang sekarang punya leverage lebih besar di kategori, shelf, dan channel.",
      localAngle: hasLocalContext
        ? "Bagi brand di Indonesia, logika seperti ini penting karena pasar lokal juga makin menuntut kombinasi antara kecepatan distribusi, relevansi kategori, dan efisiensi channel."
        : "Meski terjadi di luar Indonesia, logika akuisisi seperti ini relevan karena pasar lokal juga sedang bergerak ke kategori dan channel yang makin padat.",
      counterpoint: "Tetap perlu ditahan: akuisisi bukan otomatis strategi terbaik untuk semua brand. Tanpa distribusi, integrasi, dan positioning yang jelas, transaksi besar pun bisa gagal menghasilkan leverage yang diharapkan.",
      watchFocus: "struktur portofolio, distribusi, dan seberapa cepat category fit bisa dibangun",
    },
    partnership: {
      whyNow: "Kolaborasi makin sering dipakai sebagai jalan pintas untuk meminjam relevansi, komunitas, atau simbol budaya yang belum dimiliki brand secara organik.",
      brandImpact: "Artinya, pertarungan brand hari ini tidak cuma soal produk, tetapi soal siapa yang paling cepat menempel pada percakapan yang sedang punya energi.",
      localAngle: hasLocalContext
        ? "Di Indonesia, pendekatan ini penting karena banyak kategori consumer tumbuh lewat kombinasi komunitas, creator, dan momentum kultur lokal."
        : "Buat brand di Indonesia, pelajarannya tetap relevan: kolaborasi hanya bernilai kalau benar-benar memindahkan persepsi, bukan sekadar menaikkan exposure sesaat.",
      counterpoint: "Banyak kolaborasi terlihat menarik di permukaan tetapi lemah di belakangnya. Kalau asosiasi yang dipinjam tidak nyambung dengan positioning inti, kolaborasi mudah terasa oportunistik.",
      watchFocus: "relevansi asosiasi, kualitas audience yang dipinjam, dan apakah persepsi brand benar-benar bergeser",
    },
    ai: {
      whyNow: "Tekanan terhadap efisiensi dan personalisasi membuat AI bergeser dari bahan demo menjadi alat operasional yang benar-benar diuji dalam workflow bisnis.",
      brandImpact: "Buat brand dan tim growth, inti sinyalnya bukan soal teknologi itu sendiri, tetapi pekerjaan mana yang sekarang terlalu mahal bila tetap dilakukan dengan cara lama.",
      localAngle: hasLocalContext
        ? "Untuk pasar Indonesia, pembacaan ini penting karena adopsi AI akan terasa paling nyata di area yang langsung menyentuh speed, personalisasi, dan biaya operasional."
        : "Meski konteks beritanya global, pertanyaannya tetap relevan di Indonesia: bagian mana dari operasi brand yang paling siap mendapat leverage dari AI.",
      counterpoint: "Tidak semua pemakaian AI layak ditiru. Kalau masalah dasar seperti data, positioning, atau proses keputusan belum rapi, AI hanya akan mempercepat kekacauan yang sudah ada.",
      watchFocus: "workflow yang paling mahal, kualitas keputusan yang diotomasi, dan efeknya ke efisiensi operasional",
    },
    distribution: {
      whyNow: "Perubahan distribusi dan channel discovery membuat brand harus membaca ulang hubungan antara awareness, transaksi, dan ownership audience.",
      brandImpact: "Kalau channel baru mulai memegang peran ganda sebagai tempat discovery dan purchase, model kampanye dan pengukuran lama cepat terasa terlalu sempit.",
      localAngle: hasLocalContext
        ? "Untuk brand di Indonesia, isu ini sangat nyata karena marketplace, social commerce, dan retail modern sama-sama memengaruhi cara buyer menemukan dan membeli produk."
        : "Bagi brand di Indonesia, pelajarannya tetap kuat: channel bukan hanya tempat distribusi, tetapi juga mesin pembentukan preferensi dan perilaku beli.",
      counterpoint: "Tetap perlu dibedakan antara channel yang benar-benar mengubah perilaku pasar dengan channel yang hanya ramai sesaat. Tidak semua lonjakan channel berarti perubahan struktural.",
      watchFocus: "peran channel, economics distribusi, dan perpindahan perilaku buyer",
    },
    recognition: {
      whyNow: "Penghargaan atau pengakuan hanya layak dibaca jika ia menandai perubahan preferensi pasar, standar kategori, atau simbol yang dianggap bernilai oleh konsumen.",
      brandImpact: "Kalau dibaca dengan benar, berita seperti ini bukan soal selebrasi, tetapi soal sinyal atribut apa yang sedang dihargai market.",
      localAngle: hasLocalContext
        ? "Di Indonesia, pelajarannya penting bila penghargaan itu memperlihatkan siapa yang berhasil menangkap selera lokal, trust, atau diferensiasi kategori."
        : "Buat brand lokal, gunanya bukan meniru pencapaian luarnya, tetapi membaca atribut apa yang sedang diberi premi oleh pasar.",
      counterpoint: "Tidak semua award berarti keunggulan bisnis yang berkelanjutan. Banyak pengakuan hanya memperkuat citra, tetapi belum tentu memperbaiki distribusi, demand, atau margin.",
      watchFocus: "atribut yang dipremi market, bukti sosial, dan apakah sinyalnya benar-benar mengubah preferensi buyer",
    },
    "strategic-move": {
      whyNow: "Ada perubahan prioritas bisnis yang sedang diuji secara nyata, dan market biasanya memberi sinyal seperti ini sebelum dampaknya terlihat penuh di dashboard.",
      brandImpact: "Buat brand lain, nilainya ada pada kemampuan membaca siapa yang sedang mengambil posisi lebih cepat dan apa yang membuat langkah itu terasa masuk akal sekarang.",
      localAngle: hasLocalContext
        ? "Bagi pembaca di Indonesia, pertanyaan pentingnya adalah apakah sinyal ini juga mulai muncul di pasar lokal, baik lewat distribusi, perilaku buyer, maupun cara kategori dibangun."
        : "Meski peristiwanya tidak terjadi di Indonesia, pola strateginya tetap layak dibaca sebagai petunjuk tentang arah kategori dan ekspektasi market.",
      counterpoint: "Tidak semua langkah besar perlu direspons dengan gerakan besar. Sering kali nilai utamanya justru ada pada kemampuan menyaring mana implikasi yang relevan dan mana yang hanya menambah noise.",
      watchFocus: "pergeseran prioritas kategori, perilaku buyer, dan daya saing channel",
    },
  };

  const typeProfile = typeMap[type] || typeMap["strategic-move"];
  const marketContext = buildResearchDetail(marketItem, "Kalau dilihat bersama sumber lain, sinyal ini berdiri di atas perubahan ukuran pasar dan dinamika kategori yang lebih luas.");
  const consumerContext = buildResearchDetail(consumerItem, "Dari sisi konsumen, sinyal utamanya ada pada perubahan cara orang memilih produk, kanal, dan alasan percaya.");
  const channelContext = buildResearchDetail(channelItem, "Dari sisi channel, perubahan biasanya terlihat lebih dulu pada cara produk ditemukan, dibanding pada dampak revenue yang langsung kelihatan.");
  const localContextLine = localItem
    ? buildResearchDetail(localItem, typeProfile.localAngle)
    : typeProfile.localAngle;

  return {
    seed,
    dateLabel,
    category,
    pillar,
    cleanSummary,
    frame,
    serviceAngle,
    researchItems,
    primaryMetric,
    marketContext,
    consumerContext,
    channelContext,
    localContextLine,
    typeProfile,
    type,
  };
}

function buildNewsSectionPlan(profile, mode = "standard") {
  const {
    seed,
    dateLabel,
    news,
    frame,
    pillar,
    cleanSummary,
    marketContext,
    consumerContext,
    channelContext,
    localContextLine,
    typeProfile,
    researchItems,
  } = profile;

  const introLead = pickVariant(seed, [
    `Pada ${dateLabel}, ${news.sourceName} menyoroti "${news.title}". ${frame.eventSummary}`,
    `"${news.title}" yang dimuat ${news.sourceName} pada ${dateLabel} penting dibaca karena ${frame.eventSummary.toLowerCase()}`,
    `${news.sourceName} menulis "${news.title}" pada ${dateLabel}. Bagi brand, nilainya bukan hanya pada beritanya, tetapi pada arah bisnis yang sedang terlihat di baliknya.`,
  ]);
  const introCommentary = pickVariant(seed, [
    `${frame.implication} Di situlah nilai utama berita ini untuk founder dan marketing leader.`,
    `Nilai utamanya ada pada perubahan prioritas yang sedang dicoba dibaca market, bukan pada ramainya headline itu sendiri.`,
    `Kalau dibaca dengan disiplin, berita ini membantu kita melihat keputusan apa yang sedang naik nilainya di kategori ini.`,
  ], 1);

  const sections = [
    {
      heading: pickVariant(seed, [
        "Apa yang Terjadi dan Kenapa Itu Penting",
        "Membaca Peristiwanya dengan Jernih",
        "Fakta yang Perlu Ditahan Lebih Dulu",
      ], 2),
      paragraphs: [
        `Fakta dasarnya jelas: ${frame.eventSummary} ${profile.primaryMetric ? `Ada sinyal konkret seperti ${profile.primaryMetric} yang membuat pembacaan ini tidak berhenti di opini.` : "Yang penting sekarang adalah membaca motif bisnis di balik langkah tersebut, bukan terpaku pada headline."}`,
        `Berita seperti ini paling berguna bila dibaca dari luar ke dalam. Mulai dari faktanya, lalu baca motif bisnisnya, baru setelah itu ukur apakah implikasinya relevan untuk brand lain yang ukurannya berbeda.`,
      ],
    },
    {
      heading: pickVariant(seed, [
        "Kenapa Ini Muncul Sekarang",
        "Sinyal Pasar di Baliknya",
        "Apa yang Sedang Diuji oleh Market",
      ], 3),
      paragraphs: [
        `${typeProfile.whyNow} Sinyal terkuatnya ada di area ${localizePillar(pillar)}.`,
        `${marketContext} ${consumerContext}`,
      ],
    },
    {
      heading: pickVariant(seed, [
        "Apa Artinya untuk Brand di Indonesia",
        "Implikasinya bagi Brand Lokal",
        "Apa yang Perlu Dibaca oleh Founder dan Marketing Leader",
      ], 4),
      paragraphs: [
        `${typeProfile.brandImpact} ${localContextLine}`,
        `${frame.auditQuestion} ${channelContext}`,
      ],
    },
    {
      heading: pickVariant(seed, [
        "Counterpoint yang Perlu Dijaga",
        "Apa yang Tidak Boleh Disederhanakan",
        "Di Mana Banyak Orang Salah Membaca",
      ], 5),
      paragraphs: [
        `${typeProfile.counterpoint}`,
        `Itulah sebabnya berita seperti ini lebih berguna untuk menajamkan cara baca daripada mendorong reaksi cepat. Relevansi selalu lebih penting daripada kecepatan ikut bergerak.`,
      ],
    },
  ];

  if (mode === "premium") {
    sections.splice(3, 0, {
      heading: pickVariant(seed, [
        "Struktur Persaingan yang Sedang Bergeser",
        "Siapa yang Diuntungkan, Siapa yang Tertekan",
        "Lapisan yang Sering Tidak Terlihat",
      ], 6),
      paragraphs: [
        `Kalau sinyal ini berlanjut, area yang paling terdampak biasanya adalah ${typeProfile.watchFocus}. Di situlah brand perlu membaca siapa yang sekarang punya leverage lebih besar dan siapa yang justru makin terjepit.`,
        `${researchItems.length > 0 ? `Artikel ini tidak hanya berdiri di atas satu headline. Ada ${researchItems.length} sumber konteks tambahan yang membantu menguji apakah pola yang terlihat memang cukup kuat untuk dibaca sebagai pergeseran pasar.` : "Kalau belum ada konteks tambahan, pembacaan seperti ini tetap perlu dijaga supaya tidak berubah menjadi kesimpulan yang terlalu luas."}`,
      ],
    });
  }

  const sourceClose = researchItems.length > 0
    ? `Sumber utama tulisan ini adalah ${news.sourceName} pada ${dateLabel}, dengan headline "${news.title}" di ${news.link}. Selain itu, ada ${researchItems.length} sumber konteks tambahan untuk membaca ukuran pasar, perilaku buyer, dan perubahan channel di sekitar topik ini.`
    : `Sumber utama tulisan ini adalah ${news.sourceName} pada ${dateLabel}, dengan headline "${news.title}" di ${news.link}. Sumber ini dipakai sebagai pemicu analisis, bukan sebagai instruksi untuk ditiru mentah-mentah.`;

  return {
    introLead,
    introCommentary,
    sections,
    sourceClose,
    closing: pickVariant(seed, [
      "Berita yang kuat tidak berhenti sebagai informasi. Ia menjadi berguna ketika berhasil membantu brand membaca pasar dengan standar yang lebih tinggi.",
      "Kalau sebuah artikel bisnis tidak membuat prioritas terasa lebih jelas, nilainya berhenti di level konsumsi informasi. Di situlah pembeda antara update biasa dan bahan baca yang benar-benar berguna.",
      "Market hampir selalu memberi sinyal sebelum dampaknya terlihat penuh di dashboard. Tugas brand yang matang adalah menangkap sinyal itu tanpa kehilangan disiplin berpikir.",
    ], 7),
  };
}

function buildDynamicNewsBlocks(news, context, articleTitle, researchPacket = null, mode = "standard") {
  const profile = buildNewsInsightProfile(news, context, articleTitle, researchPacket, mode);
  profile.news = news;
  const plan = buildNewsSectionPlan(profile, mode);

  return [
    createBlock(plan.introLead),
    createBlock(plan.introCommentary),
    ...plan.sections.flatMap((section) => ([
      createBlock(section.heading, "h2"),
      ...section.paragraphs.map((paragraph) => createBlock(paragraph)),
    ])),
    createBlock("Sumber Rujukan", "h2"),
    createBlock(plan.sourceClose),
    createBlock(plan.closing),
  ];
}

function buildNewsBlocks(news, context, articleTitle) {
  return buildDynamicNewsBlocks(news, context, articleTitle, null, "standard");
}

function buildPremiumNewsBlocks(news, context, articleTitle, researchPacket = null) {
  return buildDynamicNewsBlocks(news, context, articleTitle, researchPacket, "premium");
}

function buildNewsExpansionBlocks(news, iteration = 0) {
  const seed = `${news.title}-news-expansion-${iteration}`;
  const newsSeed = `${news.title}-${news.sourceName}-news-expansion`;

  if (iteration === 0) {
    return [
      createBlock(
        pickVariant(seed, [
          "Kalau Mau Dibawa ke Ruang Meeting",
          "Satu Disiplin yang Berguna",
          "Yang Sering Hilang Setelah Membaca Berita",
        ]),
        "h2"
      ),
      createBlock(
        pickVariant(seed, [
          `Kebiasaan yang paling berguna setelah membaca berita seperti "${news.title}" adalah mengubahnya menjadi memo keputusan singkat: apa yang terjadi, kenapa itu penting, dan asumsi mana yang perlu dibaca ulang.`,
          `Berita seperti "${news.title}" seharusnya tidak berhenti sebagai bahan obrolan internal. Ia lebih berguna bila dipaksa masuk ke format keputusan yang konkret dan bisa diperdebatkan dengan jernih.`,
          `Kalau tim ingin lebih matang membaca pasar, jangan berhenti di headline. Tulis ulang insight-nya ke bahasa prioritas. Di situlah kualitas strategi mulai terlihat.`,
        ], 1)
      ),
      createBlock(
        pickVariant(seed, [
          "Kebiasaan ini membantu founder menghindari dua jebakan sekaligus: telat membaca perubahan, atau bereaksi terlalu cepat tanpa konteks. Kalau ritmenya terjaga, berita industri berubah menjadi bahan bakar strategi.",
          "Perbedaan antara tim yang dewasa dan tim yang reaktif sering terlihat di sini. Yang dewasa memakai berita untuk menajamkan keputusan. Yang reaktif memakainya untuk membenarkan kepanikan.",
          "Semakin disiplin tim mempraktikkan ini, semakin kecil kemungkinan mereka mengejar sesuatu yang terlihat update tetapi tidak relevan dengan bisnis.",
        ], 2)
      ),
    ];
  }

  const followUpIteration = Math.max(0, iteration - 1);
  const cycle = Math.floor(followUpIteration / 3);
  const refinementA = cycle === 0
    ? ""
    : ` ${pickRotatingVariant(newsSeed, [
      "Di tahap berikutnya, kualitas respons biasanya ditentukan oleh seberapa cepat tim bisa mengaitkan insight itu ke eksperimen yang nyata.",
      "Kalau diskusi ini diteruskan, fokusnya sebaiknya bergeser dari opini ke bukti: sinyal apa yang benar-benar mau diuji dan kenapa.",
      "Pada putaran berikutnya, yang lebih penting bukan lagi headline-nya, tetapi disiplin tim dalam memilih implikasi mana yang paling relevan.",
    ], cycle - 1, 21)}`;
  const refinementB = cycle === 0
    ? ""
    : ` ${pickRotatingVariant(newsSeed, [
      "Di sanalah berita berubah fungsi, dari bahan konsumsi informasi menjadi alat kalibrasi keputusan.",
      "Kalau ritme ini dijaga, berita industri tidak akan lagi terasa seperti gangguan yang memecah fokus tim.",
      "Bagi brand yang matang, ketenangan membaca sinyal seperti ini justru menjadi salah satu keunggulan paling mahal.",
    ], cycle - 1, 22)}`;

  return [
    createBlock(
      `${pickRotatingVariant(newsSeed, [
        `Kalau saya membawa berita ini satu langkah lebih jauh, pertanyaan berikutnya selalu sama: apakah tim punya mekanisme untuk mengubah insight menjadi prioritas yang bisa diuji dengan kepala dingin, atau semua berhenti di level obrolan yang terdengar cerdas.`,
        `Berita seperti ini juga menguji kedewasaan tim. Apakah mereka sanggup menahan dorongan untuk terlihat cepat, lalu memilih respons yang benar-benar relevan dengan bisnis yang sedang dijalankan.`,
        `Ada banyak berita yang terdengar menarik. Tetapi hanya sedikit yang benar-benar layak masuk ke sistem keputusan. Karena itu, disiplin menyaring berita seperti ini justru menjadi keunggulan operasional tersendiri.`,
      ], followUpIteration, 3)}${refinementA}`
    ),
    createBlock(
      `${pickRotatingVariant(newsSeed, [
        "Begitu kebiasaan ini dibangun, market tidak lagi terasa menakutkan atau terlalu bising. Ia berubah menjadi medan baca yang lebih tenang, karena tim tahu bagaimana membedakan sinyal yang penting dari noise yang hanya ramai sesaat.",
        "Di situlah kualitas strategi terasa. Bukan pada seberapa cepat tim berkomentar, tetapi pada seberapa tepat mereka memilih apa yang perlu direspons dan apa yang lebih baik dibiarkan lewat.",
        "Bagi saya, itu salah satu tanda brand yang benar-benar matang: mereka bisa belajar cepat dari pasar tanpa kehilangan fokus pada objective utamanya.",
      ], followUpIteration, 4)}${refinementB}`
    ),
  ];
}

function countHeadings(blocks) {
  return blocks.filter((block) => block.style === "h2").length;
}

function ensureMinimumWordCount(blocks, minimumWords, expansionFactory, options = {}) {
  const safeMinimum = Math.max(300, minimumWords);
  const softFloor = Math.max(600, Math.min(safeMinimum, options.softFloor ?? 800));
  const minimumHeadings = options.minimumHeadings ?? 4;
  const maxExtraIterations = options.maxExtraIterations ?? 2;
  const expandedBlocks = [...blocks];
  let wordCount = countWordsInBlocks(expandedBlocks);
  let iteration = 0;
  let headingCount = countHeadings(expandedBlocks);

  if (wordCount >= softFloor && headingCount >= minimumHeadings) {
    return {
      blocks: expandedBlocks,
      wordCount,
    };
  }

  while (wordCount < safeMinimum && iteration < maxExtraIterations) {
    expandedBlocks.push(...expansionFactory(iteration));
    wordCount = countWordsInBlocks(expandedBlocks);
    headingCount = countHeadings(expandedBlocks);
    if (wordCount >= softFloor && headingCount >= minimumHeadings) {
      break;
    }
    iteration += 1;
  }

  return {
    blocks: expandedBlocks,
    wordCount,
  };
}

function buildEvergreenExcerpt(topic, pillar) {
  const profile = buildEvergreenInsightProfile(topic, pillar, pickPrimaryAudience(topic));
  return truncateAtWord(
    `${topic}. Fokus pada ${profile.metaFocus}.`,
    145
  );
}

function buildEvergreenSeoDescription(topic, pillar) {
  const profile = buildEvergreenInsightProfile(topic, pillar, pickPrimaryAudience(topic));
  return truncateAtWord(
    `${topic}. Bahas ${profile.metaFocus} agar keputusan marketing lebih tepat.`,
    145
  );
}

function buildEvergreenArticle(topic, context) {
  const title = topic;
  const minimumWords = getAdaptiveMinimumWords(getMinimumWords(), context.feedbackLearning, "evergreen");
  const pillar = derivePillar(topic);
  const primaryAudience = pickPrimaryAudience(topic);
  const profile = buildEvergreenInsightProfile(topic, pillar, primaryAudience);
  const expanded = ensureMinimumWordCount(
    buildBlocks(topic, context),
    minimumWords,
    (iteration) => buildExpansionBlocks(topic, context, iteration),
    {
      softFloor: 750,
      minimumHeadings: 4,
      maxExtraIterations: 1,
    }
  );
  const content = expanded.blocks;
  const category = mapCategory(topic);

  return {
    title,
    slug: makeSlug(title),
    excerpt: buildEvergreenExcerpt(topic, pillar),
    seoDescription: buildEvergreenSeoDescription(topic, pillar),
    content,
    category,
    language: process.env.DEFAULT_LANGUAGE || "id-ID",
    author: process.env.AUTHOR_NAME || "Jhordi Deamarall",
    status: "readyForReview",
    publishedAt: new Date().toISOString(),
    readTime: estimateReadTime(content),
    wordCount: expanded.wordCount,
    practicalTakeaways: buildPracticalTakeaways(topic, profile),
    coverImageStyle: buildCoverImageStyle(category, context),
    coverImageBrief: buildCoverImageBrief(topic, category, context),
    coverImageAlt: buildCoverImageAlt(topic, category),
    featured: false,
    contentType: "evergreen",
    sourceReferences: [],
    workflowNotes: {
      seo: context.seoRules[0] || "use a clear primary keyword naturally",
      publishing: context.publishingRules[0] || "Always create documents in Sanity as drafts first.",
      topicSeed: topic,
      feedbackSignals: context.feedbackLearning?.activeSignals || [],
    },
  };
}

async function buildNewsArticle(news, context) {
  const title = buildNewsTitle(news);
  const minimumWords = getAdaptiveMinimumWords(getMinimumWords(), context.feedbackLearning, "newsAnalysis");
  const newsStyle = getNewsArticleStyle();
  const researchMode = getResearchMode();
  const researchPacket = researchMode === "deep"
    ? await fetchDeepResearchPacket({
      news,
      limit: getAdaptiveResearchLimit(context.feedbackLearning),
      maxAgeDays: getDeepResearchMaxAgeDays(),
    })
    : { topic: "", queries: [], items: [] };
  const expanded = ensureMinimumWordCount(
    newsStyle === "premium"
      ? buildPremiumNewsBlocks(news, context, title, researchPacket)
      : buildNewsBlocks(news, context, title),
    minimumWords,
    (iteration) => buildNewsExpansionBlocks(news, iteration),
    {
      softFloor: newsStyle === "premium" ? 1100 : 800,
      minimumHeadings: newsStyle === "premium" ? 5 : 4,
      maxExtraIterations: newsStyle === "premium" ? 1 : 1,
    }
  );
  const content = expanded.blocks;
  const category = mapNewsCategory(news);
  const sourceReferences = [
    {
      title: news.title,
      publisher: news.sourceName,
      url: news.link,
      publishedAt: news.publishedAt,
    },
    ...researchPacket.items.map((item) => ({
      title: item.title,
      publisher: item.sourceName,
      url: item.link,
      publishedAt: item.publishedAt,
    })),
  ];

  return {
    title,
    slug: makeSlug(title),
    excerpt: buildNewsExcerpt(news),
    seoDescription: buildNewsSeoDescription(news),
    content,
    category,
    language: process.env.DEFAULT_LANGUAGE || "id-ID",
    author: process.env.AUTHOR_NAME || "Jhordi Deamarall",
    status: "readyForReview",
    publishedAt: new Date().toISOString(),
    readTime: estimateReadTime(content),
    wordCount: expanded.wordCount,
    practicalTakeaways: buildNewsPracticalTakeaways(news),
    coverImageStyle: buildCoverImageStyle(category, context),
    coverImageBrief: buildCoverImageBrief(title, category, context),
    coverImageAlt: buildCoverImageAlt(title, category),
    featured: false,
    contentType: "newsAnalysis",
    sourceReferences,
    workflowNotes: {
      seo: context.seoRules[0] || "use a clear primary keyword naturally",
      publishing: context.publishingRules[0] || "Always create documents in Sanity as drafts first.",
      topicSeed: news.title,
      sourceQuery: news.query,
      newsStyle,
      researchMode,
      researchTopic: researchPacket.topic,
      researchSourceCount: researchPacket.items.length,
      feedbackSignals: context.feedbackLearning?.activeSignals || [],
    },
  };
}

async function getNewsPool(articleCount, recentOutputTitles, recentNewsLinks) {
  const mode = getArticleMode();
  const targetCount = getNewsArticleCount(articleCount, mode);

  if (targetCount === 0) {
    return [];
  }

  const candidates = await fetchNewsCandidates({
    limit: Math.max(articleCount * 4, targetCount * 3),
    maxAgeDays: getNewsMaxAgeDays(),
    excludeUrls: recentNewsLinks,
    excludeTitles: recentOutputTitles,
  });

  const offset = getNewsPoolOffset();
  const shifted = candidates.slice(offset, offset + targetCount);
  if (shifted.length === targetCount) {
    return shifted;
  }

  return [...shifted, ...candidates].slice(0, targetCount);
}

async function main() {
  ensureDir("outputs");

  const context = loadBrandContext();
  const topicSections = parseTopicSections();
  const articleCount = getArticleCount();
  const articleMode = getArticleMode();
  const evergreenStyle = getEvergreenStyle();
  const sanitySignals = await fetchRecentPublishedArticleSignals(40);
  const initialRecentTopics = [
    ...readJson(RECENT_TOPICS_FILE, []),
    ...readRecentOutputTitles(),
    ...sanitySignals.topicSeeds,
  ];
  const initialRecentNewsLinks = [...readJson(RECENT_NEWS_FILE, []), ...sanitySignals.sourceLinks];
  const selectedTitles = [];
  const selectedTrackingTopics = [];
  const usedNewsLinks = [];
  const newsPool = await getNewsPool(articleCount, initialRecentTopics, initialRecentNewsLinks);

  if ((articleMode === "mixed" || articleMode === "news") && newsPool.length === 0) {
    if (String(process.env.REQUIRE_FRESH_NEWS || "").trim() === "1" && articleMode === "news") {
      throw new Error("NO_FRESH_NEWS");
    }
    console.warn("No relevant news candidates found. Falling back to evergreen topics for this run.");
  }

  for (let index = 0; index < articleCount; index += 1) {
    const shouldUseNews = newsPool.length > 0;
    let article;

    if (shouldUseNews) {
      const news = newsPool.shift();
      article = await buildNewsArticle(news, context);
      usedNewsLinks.push(news.link);
      console.log(`Selected news source: ${news.sourceName}`);
      console.log(`Selected headline: ${news.title}`);
    } else {
      const topic = pickTopic(topicSections, [...initialRecentTopics, ...selectedTitles], {
        style: evergreenStyle,
        feedbackLearning: context.feedbackLearning,
      });
      article = buildEvergreenArticle(topic, context);
    }

    selectedTitles.push(article.title);
    selectedTrackingTopics.push(article.workflowNotes?.topicSeed || article.title);

    const imageResult = await generateCoverImage(article);
    article.coverImagePath = imageResult.filePath;
    const filePath = buildOutputPath(article.title);

    writeJson(filePath, article);

    console.log(`Generated article: ${filePath}`);
    console.log(`Title: ${article.title}`);
    console.log(`Type: ${article.contentType}`);
    console.log(`Category: ${article.category}`);
    console.log(`Word count: ${article.wordCount}`);
    console.log(`Cover image: ${imageResult.filePath}`);
  }

  writeJson(
    RECENT_TOPICS_FILE,
    mergeRecentTopicEntries(readJson(RECENT_TOPICS_FILE, []), selectedTrackingTopics, 30)
  );
  writeJson(RECENT_NEWS_FILE, [...initialRecentNewsLinks, ...usedNewsLinks].slice(-50));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
