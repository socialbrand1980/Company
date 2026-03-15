import {
  countWordsInBlocks,
  estimateReadTime,
  makeSlug,
  readJson,
  truncateAtWord,
  writeJson,
} from "./helpers.js";
import {
  GENERIC_PHRASES,
  NEWS_TITLE_PREFIX,
  blockText,
  countWords,
  getLatestOutputFiles,
  normalizeParagraph,
  reviewArticle,
} from "./review-generated-articles.js";
import { pathToFileURL } from "url";

const latestCountArg = process.argv.find((arg) => arg.startsWith("--latest-count="));
const latestCount = latestCountArg ? Number.parseInt(latestCountArg.split("=")[1], 10) : Number.parseInt(process.env.REWRITE_COUNT || "1", 10);
const threshold = Number.parseInt(process.env.ARTICLE_REVIEW_MIN_SCORE || "80", 10);
const maxPasses = Number.parseInt(process.env.ARTICLE_REWRITE_MAX_PASSES || "2", 10);
const alwaysPolish = String(process.env.ARTICLE_AUTO_REWRITE || "1").trim() !== "0";

const BAD_PHRASE_REPLACEMENTS = [
  [/Pendekatan pendekatan yang dimulai dari strategi/gi, "Pendekatan yang dimulai dari strategi"],
  [/nilai beritanya ada pada/gi, "nilai utamanya ada pada"],
  [/yang membuatnya menarik bukan dramanya/gi, "yang relevan justru implikasi bisnisnya"],
  [/Di titik ini/gi, "Di fase ini"],
  [/Di titik itu/gi, "Di fase itu"],
  [/Kalau bagian ini dijaga/gi, "Jika disiplin ini dijaga"],
  [/Berita seperti ini/gi, "Update seperti ini"],
];

const FILLER_PATTERNS = [
  /di fase lanjutan seperti ini/i,
  /pada putaran evaluasi berikutnya/i,
  /semakin jauh diskusi berjalan/i,
  /kalau dibawa selangkah lebih jauh/i,
  /yang dibutuhkan tim bukan/i,
  /banyak founder baru merasakan/i,
  /di fase itulah/i,
  /partner seperti retainer social media/i,
  /prinsip seperti "be direct"/i,
  ...GENERIC_PHRASES.map((phrase) => new RegExp(escapeRegExp(phrase), "i")),
];

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function splitSentences(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function cleanupSentence(sentence) {
  let cleaned = String(sentence || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  for (const [pattern, replacement] of BAD_PHRASE_REPLACEMENTS) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  cleaned = cleaned
    .replace(/\b([A-Za-z]+)\s+\1\b/gi, "$1")
    .replace(/\s+,/g, ",")
    .replace(/\s+\./g, ".")
    .trim();

  return cleaned;
}

function isFillerSentence(sentence) {
  return FILLER_PATTERNS.some((pattern) => pattern.test(sentence));
}

function ensureSentencePeriod(sentence) {
  if (!sentence) return "";
  return /[.!?]$/.test(sentence) ? sentence : `${sentence}.`;
}

function normalizeTitleCase(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function lowerFirst(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
}

function formatDateIndo(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function primarySource(article) {
  return Array.isArray(article.sourceReferences) && article.sourceReferences.length > 0 ? article.sourceReferences[0] : null;
}

function extractEntity(text) {
  const source = String(text || "")
    .replace(/^[\"'“”]+|[\"'“”]+$/g, "")
    .split(/ accelerates | reports | records | posts | plans | invests | raises | targets | eyes |[:,-]/i)[0]
    .trim();

  if (!source) {
    return "";
  }

  const words = source.split(/\s+/).filter(Boolean).slice(0, 5);
  return words.join(" ");
}

function rewriteNewsTitle(article) {
  const source = primarySource(article);
  const publisher = source?.publisher || "sumber utama";
  const publishedLabel = formatDateIndo(source?.publishedAt);
  const entity = extractEntity(source?.title || article.title) || "langkah brand ini";
  const lcEntity = lowerFirst(entity);

  if (/tiktok shop/i.test(source?.title || article.title)) {
    return `Apa arti langkah ${lcEntity} masuk ke TikTok Shop bagi brand di Indonesia`;
  }

  if (/acqui|ambil alih|merger/i.test(source?.title || article.title)) {
    return `Pelajaran brand dari akuisisi ${lcEntity}`;
  }

  if (/partner|kolaborasi|collab/i.test(source?.title || article.title)) {
    return `Apa arti kolaborasi ${lcEntity} bagi brand yang membaca pasar`;
  }

  if (publishedLabel) {
    return `Apa arti langkah ${lcEntity} pada ${publishedLabel} bagi pembaca bisnis`;
  }

  return `Apa arti langkah ${lcEntity} bagi brand di Indonesia`;
}

function rewriteEvergreenTitle(article) {
  const trimmed = normalizeTitleCase(article.title);
  if (/^(cara|framework|audit|checklist|sop|kapan|tanda|kenapa|mengapa|apa|bedanya)\b/i.test(trimmed)) {
    return trimmed;
  }

  return `Cara ${lowerFirst(trimmed)}`;
}

function tightenParagraphText(text, state, options = {}) {
  const originalSentences = splitSentences(text).map(cleanupSentence).filter(Boolean);
  const kept = [];

  for (const sentence of originalSentences) {
    const normalized = normalizeParagraph(sentence);
    if (!normalized) {
      continue;
    }

    if (state.seenSentences.has(normalized)) {
      continue;
    }

    if (isFillerSentence(sentence) && originalSentences.length > 1 && options.allowFiller !== true) {
      continue;
    }

    state.seenSentences.add(normalized);
    kept.push(sentence);
  }

  const tightened = kept.slice(0, options.maxSentences || 2).map(ensureSentencePeriod).join(" ").trim();
  return tightened || originalSentences.slice(0, 1).map(ensureSentencePeriod).join(" ").trim();
}

function stripTopicPrefix(topic) {
  return String(topic || "")
    .trim()
    .replace(/^(cara|framework|audit|checklist|sop|kapan|tanda|review|analisis strategis)\s+/i, "")
    .trim();
}

function buildEvergreenRewriteProfile(article) {
  const normalized = String(article.title || "").toLowerCase();

  if (/workflow|approval|editorial|pillar/.test(normalized)) {
    return {
      symptom: "brief berubah di tengah jalan, approval menumpuk, dan kalender konten membuat tim kerja reaktif",
      auditFocus: "alur brief, SLA approval, prioritas channel, dan definisi done",
      firstMove: "membekukan satu siklus konten lalu merapikan template brief, SLA approval, dan batas revisi",
      measurement: "lead time approval, jumlah revisi, dan konsistensi pesan dari brief sampai tayang",
      outcome: "workflow konten lebih tenang dan keputusan tim tidak terus bergantung pada firefighting",
      metaFocus: "brief, approval, dan prioritas channel",
      metaAction: "merapikan satu siklus kerja konten",
      metaMetric: "lead time approval dan jumlah revisi",
    };
  }

  if (/kpi|reporting|engagement|metric|metrics/.test(normalized)) {
    return {
      symptom: "dashboard ramai tetapi tim tidak tahu metrik mana yang benar-benar layak dipakai mengambil keputusan",
      auditFocus: "hubungan antara objective, leading indicator, dan metrik outcome",
      firstMove: "memangkas dashboard menjadi tiga metrik inti per objective dan menyepakati respons untuk tiap perubahan angka",
      measurement: "conversion, cost per qualified lead, dan kecepatan tim membuat keputusan korektif",
      outcome: "reporting menjadi alat kalibrasi keputusan, bukan arsip aktivitas mingguan",
      metaFocus: "objective, metrik inti, dan evaluasi",
      metaAction: "memangkas dashboard ke tiga metrik inti",
      metaMetric: "conversion dan kualitas demand",
    };
  }

  if (/campaign|kol|creator/.test(normalized)) {
    return {
      symptom: "objective campaign, pesan, dan role channel cepat kabur begitu eksekusi dimulai",
      auditFocus: "objective, big message, role tiap channel, dan definisi sukses per fase campaign",
      firstMove: "memilih satu objective utama, satu audience prioritas, dan satu alasan percaya yang wajib muncul di asset inti",
      measurement: "lift pada metrik utama, kualitas demand, dan gap performa antar channel",
      outcome: "campaign menjadi lebih fokus dan lebih mudah dioptimalkan",
      metaFocus: "objective campaign, pesan utama, dan role channel",
      metaAction: "memilih satu objective dan satu audience prioritas",
      metaMetric: "lift metrik utama dan kualitas demand",
    };
  }

  if (/funnel|journey|conversion/.test(normalized)) {
    return {
      symptom: "konten aktif di atas funnel tetapi pertimbangan dan conversion tidak bergerak seimbang",
      auditFocus: "drop-off terbesar, pesan per tahap, dan friction sebelum conversion",
      firstMove: "memetakan satu journey prioritas lalu memilih satu bottleneck paling mahal untuk diuji lebih dulu",
      measurement: "conversion per tahap, CTR ke langkah berikutnya, dan kualitas follow-up",
      outcome: "customer journey lebih jelas dan tiap konten punya peran yang bisa dibaca",
      metaFocus: "bottleneck funnel, pesan per tahap, dan follow-up",
      metaAction: "memetakan satu journey prioritas",
      metaMetric: "conversion per tahap",
    };
  }

  if (/social media|instagram|tiktok|youtube|algorithm/.test(normalized)) {
    return {
      symptom: "reach naik turun dan tim sulit menjelaskan pengaruhnya ke demand atau pipeline",
      auditFocus: "role tiap format konten, distribusi, CTA, dan hubungan attention dengan demand",
      firstMove: "memisahkan konten untuk reach, trust, dan conversion lalu menghentikan format yang hanya ramai",
      measurement: "saves, profile visits, qualified inbound, dan conversion dari owned channel",
      outcome: "social media dibaca sebagai sistem pertumbuhan, bukan mesin posting",
      metaFocus: "role format, CTA, dan distribusi",
      metaAction: "memisahkan konten untuk reach, trust, dan conversion",
      metaMetric: "qualified inbound dan conversion dari owned channel",
    };
  }

  return {
    symptom: "pesan brand terasa terlalu umum sehingga tim sales turun ke harga atau penjelasan tambahan",
    auditFocus: "janji inti brand, proof yang paling dipercaya market, dan siapa yang sebenarnya ingin diyakinkan",
    firstMove: "merapikan positioning satu kalimat lalu mengecek apakah offer, proof, dan CTA di channel utama masih sejalan",
    measurement: "kualitas inbound, close rate, dan seberapa cepat nilai brand bisa dijelaskan",
    outcome: "positioning lebih jelas dan tim tidak terus menerjemahkan ulang brand dari nol",
    metaFocus: "janji brand, proof, dan audience prioritas",
    metaAction: "merapikan positioning satu kalimat",
    metaMetric: "kualitas inbound dan close rate",
  };
}

function buildEvergreenMeta(article) {
  const profile = buildEvergreenRewriteProfile(article);
  return {
    intro: [
      `Topik ${lowerFirst(article.title)} biasanya terasa mahal saat ${profile.symptom}. Pada fase ini, masalahnya jarang ada di kurangnya aktivitas, tetapi di mutu keputusan yang mengatur aktivitas tersebut.`,
      `Audit yang paling berguna dimulai dari ${profile.auditFocus}. Dari situ tim bisa menentukan langkah sempit seperti ${profile.firstMove} dan membaca hasilnya lewat ${profile.measurement}.`,
    ],
    excerpt: truncateAtWord(
      `${article.title}. Fokus pada ${profile.metaFocus}.`,
      145
    ),
    seo: truncateAtWord(
      `${article.title}. Bahas ${profile.metaFocus} agar keputusan marketing lebih tepat.`,
      145
    ),
  };
}

function buildNewsMeta(article) {
  const source = primarySource(article);
  const dateLabel = formatDateIndo(source?.publishedAt);
  const sourceLabel = source?.publisher || "sumber utama";
  const sourceTitle = source?.title || article.title;

  return {
    intro: [
      `${sourceLabel}${dateLabel ? ` pada ${dateLabel}` : ""} melaporkan ${lowerFirst(sourceTitle)}. Yang penting dari update ini bukan hanya peristiwanya, tetapi sinyal bisnis yang bisa dibaca brand dengan lebih tenang.`,
      "Bagi pembaca di Indonesia, nilai artikel seperti ini ada pada cara menerjemahkan langkah pemain besar menjadi keputusan yang lebih relevan untuk positioning, channel, dan ekspektasi konsumen lokal.",
    ],
    excerpt: truncateAtWord(
      `${article.title}. Analisis strategi untuk membaca positioning, channel, dan konteks pasar yang relevan bagi brand di Indonesia.`,
      150
    ),
    seo: truncateAtWord(
      `${article.title}. Bahas channel, positioning, dan konteks pasar untuk brand di Indonesia.`,
      145
    ),
  };
}

function rewriteEvergreenIntro(article) {
  return buildEvergreenMeta(article).intro;
}

function rewriteNewsIntro(article) {
  return buildNewsMeta(article).intro;
}

function buildSpecificExcerpt(article) {
  if (article.contentType === "newsAnalysis") {
    return buildNewsMeta(article).excerpt;
  }

  return buildEvergreenMeta(article).excerpt;
}

function buildSpecificSeo(article) {
  if (article.contentType === "newsAnalysis") {
    return buildNewsMeta(article).seo;
  }

  return buildEvergreenMeta(article).seo;
}

export function rewriteArticle(article, report, passIndex = 0) {
  const next = clone(article);
  const state = { seenSentences: new Set() };
  const introParagraphs = next.contentType === "newsAnalysis" ? rewriteNewsIntro(next) : rewriteEvergreenIntro(next);
  const preserveLength = (article.wordCount || 0) < 560;
  let seenHeading = new Set();
  let currentParagraph = 0;

  next.content = (next.content || []).map((block) => {
    if (block.style === "h2") {
      const heading = normalizeTitleCase(blockText(block));
      const normalized = normalizeParagraph(heading);
      if (seenHeading.has(normalized)) {
        return {
          ...block,
          children: block.children.map((child, index) => ({
            ...child,
            text: index === 0 ? `${heading} Lanjutan` : child.text,
          })),
        };
      }

      seenHeading.add(normalized);
      return block;
    }

    if (block.style !== "normal") {
      return block;
    }

    let text = blockText(block);

    if (
      currentParagraph < introParagraphs.length &&
      (
        report.reasons.includes("hook pembuka belum cukup kuat") ||
        report.reasons.includes("pembuka news belum cukup konkret") ||
        !report.passed
      )
    ) {
      text = introParagraphs[currentParagraph];
      state.seenSentences.add(normalizeParagraph(text));
    } else {
      text = tightenParagraphText(text, state, {
        maxSentences: preserveLength ? 3 : (passIndex > 0 ? 2 : 3),
        allowFiller: preserveLength,
      });
    }

    currentParagraph += 1;
    return {
      ...block,
      children: block.children.map((child, index) => ({
        ...child,
        text: index === 0 ? text : "",
      })),
    };
  }).filter((block) => block.style !== "normal" || blockText(block));

  if (next.contentType === "newsAnalysis" && (!NEWS_TITLE_PREFIX.test(next.title || "") || report.reasons.includes("title news masih terlalu dekat ke headline mentah"))) {
    next.title = rewriteNewsTitle(next);
    next.slug = makeSlug(next.title);
  } else if (
    next.contentType !== "newsAnalysis"
    && (
      report.criticalReasons.includes("artikel evergreen belum terasa tips/how-to")
      || report.criticalReasons.includes("artikel evergreen belum punya format judul yang cukup jelas")
    )
  ) {
    next.title = rewriteEvergreenTitle(next);
    next.slug = makeSlug(next.title);
  }

  next.excerpt = buildSpecificExcerpt(next);
  next.seoDescription = buildSpecificSeo(next);
  next.coverImageAlt = next.title;
  next.wordCount = countWordsInBlocks(next.content);
  next.readTime = estimateReadTime(next.content);
  next.workflowNotes = {
    ...(next.workflowNotes || {}),
    rewritePasses: passIndex + 1,
    rewriteMode: "sentence-level",
  };

  return next;
}

function compareReports(candidate, baseline) {
  if (candidate.passed !== baseline.passed) {
    return candidate.passed ? 1 : -1;
  }

  if (candidate.criticalReasons.length !== baseline.criticalReasons.length) {
    return baseline.criticalReasons.length - candidate.criticalReasons.length;
  }

  if (candidate.score !== baseline.score) {
    return candidate.score - baseline.score;
  }

  if (candidate.reasons.length !== baseline.reasons.length) {
    return baseline.reasons.length - candidate.reasons.length;
  }

  return 0;
}

function buildRewriteFingerprint(article) {
  return JSON.stringify({
    title: article.title,
    excerpt: article.excerpt,
    seoDescription: article.seoDescription,
    content: (article.content || []).map((block) => ({
      style: block.style,
      text: blockText(block),
    })),
  });
}

function main() {
  const files = getLatestOutputFiles(Number.isFinite(latestCount) && latestCount > 0 ? latestCount : 1);
  if (files.length === 0) {
    throw new Error("No generated article outputs found for rewrite.");
  }

  const reports = [];

  for (const filePath of files) {
    let article = readJson(filePath, {});
    let report = reviewArticle(article, filePath, { threshold });
    const shouldAttemptRewrite = alwaysPolish || !report.passed;

    if (!shouldAttemptRewrite) {
      reports.push(report);
      continue;
    }

    for (let passIndex = 0; passIndex < Math.max(1, maxPasses); passIndex += 1) {
      const rewritten = rewriteArticle(article, report, passIndex);
      const rewrittenReport = reviewArticle(rewritten, filePath, { threshold });
      const reportDelta = compareReports(rewrittenReport, report);
      const shouldKeepEqualScoreRewrite = reportDelta === 0
        && rewrittenReport.score >= report.score
        && rewrittenReport.criticalReasons.length <= report.criticalReasons.length
        && rewrittenReport.reasons.length <= report.reasons.length
        && buildRewriteFingerprint(rewritten) !== buildRewriteFingerprint(article);

      if (reportDelta > 0 || shouldKeepEqualScoreRewrite) {
        article = rewritten;
        report = rewrittenReport;
      } else if (report.passed) {
        break;
      }

      if (report.passed && passIndex > 0) {
        break;
      }
    }

    writeJson(filePath, article);
    reports.push(report);
  }

  console.log(JSON.stringify(reports, null, 2));

  if (reports.some((report) => !report.passed)) {
    process.exit(1);
  }
}

const isDirectRun = process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;

if (isDirectRun) {
  main();
}
