import { spawnSync } from "child_process";
import dotenv from "dotenv";

dotenv.config();

function runNodeScript(scriptPath, extraEnv = {}) {
  const result = spawnSync("node", [scriptPath], {
    env: {
      ...process.env,
      ...extraEnv,
    },
    encoding: "utf8",
  });

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  return result;
}

function getMode() {
  const arg = process.argv.find((entry) => entry.startsWith("--mode="));
  const raw = (arg ? arg.split("=")[1] : process.env.AUTOMATION_MODE || "news").trim().toLowerCase();
  return raw === "evergreen" || raw === "mixed" ? raw : "news";
}

function main() {
  const mode = getMode();
  const maxNewsPerRun = Number.parseInt(process.env.AUTOMATION_MAX_NEWS_PER_RUN || "3", 10);

  const feedbackResult = runNodeScript("scripts/build-feedback-brief.js");
  if (feedbackResult.status !== 0) {
    process.exit(feedbackResult.status || 1);
  }

  if (mode === "evergreen") {
    const evergreenResult = runNodeScript("scripts/generate-and-publish.js", {
      ARTICLE_MODE: "evergreen",
      ARTICLE_COUNT: "1",
      NEWS_ARTICLE_COUNT: "0",
      SANITY_PUBLISH_MODE: "published",
    });
    process.exit(evergreenResult.status || 0);
  }

  let publishedNews = 0;
  const maxCycles = Number.isFinite(maxNewsPerRun) && maxNewsPerRun > 0 ? maxNewsPerRun : 3;

  for (let index = 0; index < maxCycles; index += 1) {
    const result = runNodeScript("scripts/generate-and-publish.js", {
      ARTICLE_MODE: "news",
      ARTICLE_COUNT: "1",
      NEWS_ARTICLE_COUNT: "1",
      REQUIRE_FRESH_NEWS: "1",
      SANITY_PUBLISH_MODE: "published",
    });

    const combinedOutput = `${result.stdout || ""}\n${result.stderr || ""}`;
    if (combinedOutput.includes("NO_FRESH_NEWS")) {
      console.log("No fresh news candidates were found. Automation run finished cleanly.");
      break;
    }

    if (result.status !== 0) {
      process.exit(result.status || 1);
    }

    publishedNews += 1;
  }

  if (mode === "mixed") {
    const evergreenResult = runNodeScript("scripts/generate-and-publish.js", {
      ARTICLE_MODE: "evergreen",
      ARTICLE_COUNT: "1",
      NEWS_ARTICLE_COUNT: "0",
      SANITY_PUBLISH_MODE: "published",
    });
    if (evergreenResult.status !== 0) {
      process.exit(evergreenResult.status || 1);
    }
  }

  console.log(`Automation run finished. Published news articles: ${publishedNews}.`);
}

main();
