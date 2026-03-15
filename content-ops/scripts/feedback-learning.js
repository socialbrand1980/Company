import fs from "fs";
import path from "path";

const DEFAULT_FEEDBACK_LEARNING_PATH = path.join("runtime", "feedback-learning.json");

export const FEEDBACK_SIGNALS = {
  increaseSourceDensity: "increase_source_density",
  increaseBusinessDepth: "increase_business_depth",
  increaseLocalContext: "increase_local_context",
  tightenTopicRelevance: "tighten_topic_relevance",
  smoothLanguage: "smooth_language",
  increaseSpecificity: "increase_specificity",
};

export function getFeedbackLearningPath() {
  return process.env.FEEDBACK_LEARNING_FILE || DEFAULT_FEEDBACK_LEARNING_PATH;
}

export function readFeedbackLearning() {
  const filePath = getFeedbackLearningPath();
  if (!fs.existsSync(filePath)) {
    return {
      generatedAt: null,
      windowDays: 0,
      totalFeedback: 0,
      likeCount: 0,
      dislikeCount: 0,
      activeSignals: [],
      topReasons: [],
      preferredCategories: [],
      discouragedCategories: [],
      preferredContentTypes: [],
      discouragedContentTypes: [],
    };
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function writeFeedbackLearning(data) {
  const filePath = getFeedbackLearningPath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

export function hasFeedbackSignal(feedbackLearning, signal) {
  return Array.isArray(feedbackLearning?.activeSignals) && feedbackLearning.activeSignals.includes(signal);
}
