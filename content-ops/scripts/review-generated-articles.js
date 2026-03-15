import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { FEEDBACK_SIGNALS, hasFeedbackSignal, readFeedbackLearning } from "./feedback-learning.js";
import { listJsonFiles, readJson } from "./helpers.js";

const latestCountArg = process.argv.find((arg) => arg.startsWith("--latest-count="));
const latestCount = latestCountArg ? Number.parseInt(latestCountArg.split("=")[1], 10) : Number.parseInt(process.env.REVIEW_COUNT || "1", 10);
const threshold = Number.parseInt(process.env.ARTICLE_REVIEW_MIN_SCORE || "80", 10);
const feedbackLearning = readFeedbackLearning();

export const GENERIC_PHRASES = [
  "nilai beritanya ada pada",
  "yang membuatnya menarik bukan dramanya",
  "di titik ini",
  "kalau bagian ini diabaikan",
  "yang dibutuhkan tim bukan",
  "berita seperti ini",
];

export const LOCAL_PUBLISHERS = ["compas", "katadata", "tokopedia", "kemenperin", "bps", "bpom", "jakpat", "populix"];
export const NEWS_TITLE_PREFIX = /^(apa arti|pelajaran|mengapa|apa dampak|apa yang bisa dipelajari)/i;
const AWKWARD_PATTERNS = [/\b([a-z]{3,})\s+\1\b/i, /pendekatan pendekatan/i];
const TITLE_STOPWORDS = new Set([
  "apa", "arti", "yang", "bisa", "dipelajari", "dari", "cara", "untuk", "agar", "dan", "atau",
  "dengan", "dalam", "lebih", "pada", "bagi", "brand", "tim", "marketing", "sistem", "system",
  "tidak", "selalu", "kenapa", "kapan", "tanda", "framework", "audit", "checklist", "sop",
]);

export function getLatestOutputFiles(limit = 1) {
  return listJsonFiles("outputs").slice(-limit);
}

export function blockText(block) {
  return (block?.children || []).map((child) => child.text || "").join(" ").trim();
}

export function normalizeParagraph(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function countWords(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length;
}

export function uniquePublishers(article) {
  const refs = Array.isArray(article.sourceReferences) ? article.sourceReferences : [];
  return Array.from(new Set(refs.map((entry) => String(entry.publisher || "").trim()).filter(Boolean)));
}

export function hasLocalContext(article) {
  return uniquePublishers(article).some((publisher) => {
    const lower = publisher.toLowerCase();
    return LOCAL_PUBLISHERS.some((candidate) => lower.includes(candidate));
  });
}

export function extractTitleKeywords(text) {
  return Array.from(new Set(
    normalizeParagraph(text)
      .split(/\s+/)
      .filter((word) => word.length >= 4 && !TITLE_STOPWORDS.has(word))
  )).slice(0, 6);
}

function countKeywordMatches(text, keywords) {
  const haystack = normalizeParagraph(text);
  return keywords.filter((keyword) => haystack.includes(keyword)).length;
}

export function reviewArticle(article, filePath, options = {}) {
  const activeThreshold = Number.isFinite(options.threshold) ? options.threshold : threshold;
  const paragraphs = (article.content || []).filter((block) => block.style === "normal").map(blockText).filter(Boolean);
  const headings = (article.content || []).filter((block) => block.style === "h2").map(blockText).filter(Boolean);
  const introWords = countWords(paragraphs.slice(0, 2).join(" "));
  const titleKeywords = extractTitleKeywords(article.title || "");
  const practicalTakeaways = Array.isArray(article.practicalTakeaways) ? article.practicalTakeaways : [];
  const uniqueTakeaways = new Set(practicalTakeaways.map((item) => normalizeParagraph(item)).filter(Boolean));
  const duplicates = new Set();
  const seen = new Set();

  for (const paragraph of paragraphs) {
    const normalized = normalizeParagraph(paragraph);
    if (!normalized) continue;
    if (seen.has(normalized)) {
      duplicates.add(normalized);
    }
    seen.add(normalized);
  }

  let score = 100;
  const reasons = [];
  const criticalReasons = [];
  const sourceMinimum = hasFeedbackSignal(feedbackLearning, FEEDBACK_SIGNALS.increaseSourceDensity) ? 4 : 2;
  const genericThreshold = hasFeedbackSignal(feedbackLearning, FEEDBACK_SIGNALS.increaseSpecificity) ? 1 : 2;

  if (!article.title || countWords(article.title) < 6) {
    score -= 15;
    reasons.push("title terlalu pendek atau kurang jelas");
  }

  if (/[A-Za-z]{8,}.*:\s*$/.test(article.title || "")) {
    score -= 10;
    reasons.push("title terlihat terpotong");
  }

  if ((article.wordCount || 0) < 450) {
    score -= 15;
    reasons.push("isi terlalu pendek untuk terasa premium");
  }

  if ((article.wordCount || 0) < 520 && article.contentType === "newsAnalysis") {
    score -= 12;
    criticalReasons.push("artikel news masih terlalu tipis");
  }

  if (headings.length < 4) {
    score -= 10;
    reasons.push("struktur artikel masih terlalu tipis");
  }

  if (introWords < 45) {
    score -= 10;
    reasons.push("hook pembuka belum cukup kuat");
  }

  if (duplicates.size > 0) {
    score -= 25;
    reasons.push("ada paragraf berulang");
  }

  const joined = paragraphs.join(" ").toLowerCase();
  const genericHits = GENERIC_PHRASES.filter((phrase) => joined.includes(phrase));
  if (genericHits.length >= genericThreshold) {
    score -= 18;
    criticalReasons.push("nada tulisan masih terlalu generik");
  }

  if (AWKWARD_PATTERNS.some((pattern) => paragraphs.some((paragraph) => pattern.test(paragraph)))) {
    score -= 8;
    if (hasFeedbackSignal(feedbackLearning, FEEDBACK_SIGNALS.smoothLanguage)) {
      criticalReasons.push("bahasa artikel masih terasa canggung");
    } else {
      reasons.push("ada frasa yang masih canggung");
    }
  }

  if (practicalTakeaways.length < 3) {
    score -= 10;
    reasons.push("practical takeaways masih kurang");
  }

  if (uniqueTakeaways.size !== practicalTakeaways.length) {
    score -= 8;
    reasons.push("practical takeaways masih berulang");
  }

  if (article.contentType === "newsAnalysis") {
    const sourceRefs = Array.isArray(article.sourceReferences) ? article.sourceReferences.length : 0;
    const invalidSourceReference = (article.sourceReferences || []).some((entry) => {
      return !entry || !entry.title || !entry.publisher || !entry.url;
    });
    if (sourceRefs < sourceMinimum) {
      score -= 15;
      criticalReasons.push(`artikel news belum punya konteks sumber yang cukup, minimum ${sourceMinimum} sumber`);
    }

    if (invalidSourceReference) {
      score -= 12;
      criticalReasons.push("source references masih tidak lengkap");
    }

    const hasConcreteSignal = /\d/.test(joined) || /maret|april|mei|juni|juli|agustus|september|oktober|november|desember|januari|februari/.test(joined);
    if (!hasConcreteSignal) {
      score -= 10;
      criticalReasons.push("artikel news kurang fakta konkret");
    }

    if (!NEWS_TITLE_PREFIX.test(article.title || "")) {
      score -= 15;
      criticalReasons.push("title news masih terlalu dekat ke headline mentah");
    }

    if (/:/.test(article.title || "") && !NEWS_TITLE_PREFIX.test(article.title || "")) {
      score -= 8;
      reasons.push("title masih terasa seperti headline sumber");
    }

    if (!hasLocalContext(article)) {
      score -= 15;
      criticalReasons.push("artikel news belum punya konteks lokal Indonesia yang kuat");
    }

    const firstParagraph = paragraphs[0] || "";
    if (!/pada|tanggal|maret|april|mei|juni|juli|agustus|september|oktober|november|desember|januari|februari/.test(firstParagraph.toLowerCase())) {
      score -= 8;
      reasons.push("pembuka news belum cukup konkret");
    }
  } else {
    if (!/^(cara|framework|audit|checklist|sop|kapan|tanda|kenapa|mengapa|apa|bedanya)\b/i.test(article.title || "")) {
      score -= 12;
      criticalReasons.push("artikel evergreen belum punya format judul yang cukup jelas");
    }

    if ((article.wordCount || 0) < 480) {
      score -= 8;
      reasons.push("artikel tips masih terlalu tipis");
    }

    if (titleKeywords.length > 0 && countKeywordMatches(article.excerpt || "", titleKeywords) === 0) {
      score -= 12;
      criticalReasons.push("excerpt evergreen belum selaras dengan judul");
    }

    if (titleKeywords.length > 0 && countKeywordMatches(article.seoDescription || "", titleKeywords) === 0) {
      score -= 10;
      reasons.push("seo description evergreen belum selaras dengan judul");
    }

    if (!/audit|uji|cek|rapikan|tentukan|ukur|pangkas|prioritas|metrik|brief|approval|funnel|positioning|channel|eksperimen/i.test(`${joined} ${practicalTakeaways.join(" ")}`)) {
      score -= 12;
      criticalReasons.push("artikel evergreen belum cukup actionable");
    }

    if (hasFeedbackSignal(feedbackLearning, FEEDBACK_SIGNALS.tightenTopicRelevance) && titleKeywords.length > 0 && countKeywordMatches(joined, titleKeywords) < 2) {
      score -= 12;
      criticalReasons.push("artikel evergreen belum cukup fokus pada inti topik");
    }
  }

  const finalScore = Math.max(0, score);
  const allReasons = [...criticalReasons, ...reasons];

  return {
    filePath,
    title: article.title,
    contentType: article.contentType,
    category: article.category,
    score: finalScore,
    passed: finalScore >= activeThreshold && criticalReasons.length === 0,
    reasons: allReasons,
    criticalReasons,
  };
}

function main() {
  const files = getLatestOutputFiles(Number.isFinite(latestCount) && latestCount > 0 ? latestCount : 1);
  if (files.length === 0) {
    throw new Error("No generated article outputs found for review.");
  }

  const reports = files.map((filePath) => reviewArticle(readJson(filePath, {}), filePath));
  console.log(JSON.stringify(reports, null, 2));

  if (reports.some((report) => !report.passed)) {
    process.exit(1);
  }
}

const isDirectRun = process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;

if (isDirectRun) {
  main();
}
