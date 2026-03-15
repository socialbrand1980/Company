import dotenv from "dotenv";

import { FEEDBACK_SIGNALS, writeFeedbackLearning } from "./feedback-learning.js";
import { fetchRecentArticleFeedback } from "./sanity-intelligence.js";

dotenv.config();

function rankKeys(netScores) {
  return Object.entries(netScores)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key);
}

async function main() {
  const windowDays = Number.parseInt(process.env.CONTENT_FEEDBACK_WINDOW_DAYS || "90", 10);
  const feedbackItems = await fetchRecentArticleFeedback(windowDays, 500);
  const likeCount = feedbackItems.filter((item) => item?.vote === "like").length;
  const dislikeCount = feedbackItems.filter((item) => item?.vote === "dislike").length;
  const reasonCounts = new Map();
  const categoryScores = new Map();
  const contentTypeScores = new Map();

  for (const item of feedbackItems) {
    const delta = item?.vote === "like" ? 1 : -1;
    if (item?.reason && item.vote === "dislike") {
      reasonCounts.set(item.reason, (reasonCounts.get(item.reason) || 0) + 1);
    }

    if (item?.category) {
      categoryScores.set(item.category, (categoryScores.get(item.category) || 0) + delta);
    }

    if (item?.contentType) {
      contentTypeScores.set(item.contentType, (contentTypeScores.get(item.contentType) || 0) + delta);
    }
  }

  const activeSignals = [];
  if ((reasonCounts.get("weak_sources") || 0) >= 1) {
    activeSignals.push(FEEDBACK_SIGNALS.increaseSourceDensity);
    activeSignals.push(FEEDBACK_SIGNALS.increaseLocalContext);
  }
  if ((reasonCounts.get("too_generic") || 0) >= 1) {
    activeSignals.push(FEEDBACK_SIGNALS.increaseSpecificity);
  }
  if ((reasonCounts.get("not_insightful") || 0) >= 1) {
    activeSignals.push(FEEDBACK_SIGNALS.increaseBusinessDepth);
  }
  if ((reasonCounts.get("less_relevant") || 0) >= 1) {
    activeSignals.push(FEEDBACK_SIGNALS.tightenTopicRelevance);
  }
  if ((reasonCounts.get("awkward_tone") || 0) >= 1) {
    activeSignals.push(FEEDBACK_SIGNALS.smoothLanguage);
  }

  const preferredCategories = rankKeys(Object.fromEntries(categoryScores)).filter((key) => (categoryScores.get(key) || 0) > 0).slice(0, 3);
  const discouragedCategories = rankKeys(Object.fromEntries(categoryScores)).reverse().filter((key) => (categoryScores.get(key) || 0) < 0).slice(0, 3);
  const preferredContentTypes = rankKeys(Object.fromEntries(contentTypeScores)).filter((key) => (contentTypeScores.get(key) || 0) > 0).slice(0, 2);
  const discouragedContentTypes = rankKeys(Object.fromEntries(contentTypeScores)).reverse().filter((key) => (contentTypeScores.get(key) || 0) < 0).slice(0, 2);

  const payload = {
    generatedAt: new Date().toISOString(),
    windowDays,
    totalFeedback: feedbackItems.length,
    likeCount,
    dislikeCount,
    activeSignals: Array.from(new Set(activeSignals)),
    topReasons: Array.from(reasonCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([reason, count]) => ({ reason, count })),
    preferredCategories,
    discouragedCategories,
    preferredContentTypes,
    discouragedContentTypes,
  };

  writeFeedbackLearning(payload);
  console.log(JSON.stringify(payload, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
