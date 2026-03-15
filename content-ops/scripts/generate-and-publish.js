import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const RECENT_TOPICS_FILE = path.join("recent-topics.json");
const RECENT_NEWS_FILE = path.join("recent-news.json");

function readOptionalFile(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath) : null;
}

function restoreOptionalFile(filePath, contents) {
  if (contents === null) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return;
  }

  fs.writeFileSync(filePath, contents);
}

function listCurrentArtifacts() {
  const outputDir = "outputs";
  const imageDir = path.join(outputDir, "images");

  return {
    outputs: fs.existsSync(outputDir)
      ? new Set(fs.readdirSync(outputDir).filter((file) => file.endsWith(".json")).map((file) => path.join(outputDir, file)))
      : new Set(),
    images: fs.existsSync(imageDir)
      ? new Set(fs.readdirSync(imageDir).filter((file) => file.endsWith(".png")).map((file) => path.join(imageDir, file)))
      : new Set(),
  };
}

function removeNewArtifacts(beforeSnapshot) {
  const afterSnapshot = listCurrentArtifacts();
  for (const filePath of afterSnapshot.outputs) {
    if (!beforeSnapshot.outputs.has(filePath) && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  for (const filePath of afterSnapshot.images) {
    if (!beforeSnapshot.images.has(filePath) && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

function buildEnv(overrides = {}) {
  return {
    ...process.env,
    ...overrides,
  };
}

function main() {
  const count = Number.parseInt(process.env.ARTICLE_COUNT || "1", 10);
  const safeCount = Number.isFinite(count) && count > 0 ? count : 1;
  const minWords = Number.parseInt(process.env.MIN_WORDS || "800", 10);
  const safeMinWords = Number.isFinite(minWords) && minWords >= 300 ? minWords : 800;
  const shouldSkipReview = String(process.env.SKIP_ARTICLE_REVIEW || "").trim() === "1";
  const maxAttempts = Number.parseInt(process.env.ARTICLE_REVIEW_MAX_ATTEMPTS || "3", 10);
  const safeAttempts = Number.isFinite(maxAttempts) && maxAttempts > 0 ? maxAttempts : 3;
  const topicSnapshot = readOptionalFile(RECENT_TOPICS_FILE);
  const newsSnapshot = readOptionalFile(RECENT_NEWS_FILE);
  const artifactSnapshot = listCurrentArtifacts();
  const newsCount = Number.parseInt(process.env.NEWS_ARTICLE_COUNT || "0", 10);
  const safeNewsCount = Number.isFinite(newsCount) && newsCount >= 0 ? newsCount : 0;
  const shouldAutoRewrite = String(process.env.ARTICLE_AUTO_REWRITE || "1").trim() !== "0";
  let lastReviewError = null;

  for (let attempt = 0; attempt < safeAttempts; attempt += 1) {
    try {
      const env = buildEnv({
        NEWS_POOL_OFFSET: String(attempt * Math.max(1, safeNewsCount || 1)),
      });

      execSync(`node scripts/generate-article.js --count=${safeCount} --min-words=${safeMinWords}`, {
        stdio: "inherit",
        env,
      });

      if (!shouldSkipReview) {
        if (shouldAutoRewrite) {
          execSync(`node scripts/rewrite-generated-articles.js --latest-count=${safeCount}`, {
            stdio: "inherit",
            env,
          });
        }

        execSync(`node scripts/review-generated-articles.js --latest-count=${safeCount}`, {
          stdio: "inherit",
          env,
        });
      }

      execSync(`node scripts/publish-to-sanity.js --latest-count=${safeCount}`, {
        stdio: "inherit",
        env,
      });
      return;
    } catch (error) {
      lastReviewError = error;
      restoreOptionalFile(RECENT_TOPICS_FILE, topicSnapshot);
      restoreOptionalFile(RECENT_NEWS_FILE, newsSnapshot);
      removeNewArtifacts(artifactSnapshot);

      if (attempt === safeAttempts - 1) {
        throw error;
      }

      console.warn(`Batch rewrite/review failed on attempt ${attempt + 1}. Regenerating with a different candidate mix...`);
    }
  }

  throw lastReviewError || new Error("Article generation failed.");
}

main();
