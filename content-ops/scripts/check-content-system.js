import path from "path";
import dotenv from "dotenv";
import {
  fileExists,
  listJsonFiles,
  readJson,
  readText,
} from "./helpers.js";
import { reviewArticle } from "./review-generated-articles.js";

dotenv.config();

const REQUIRED_DOCS = [
  "AGENTS.md",
  "docs/personal-brand.md",
  "docs/audience.md",
  "docs/content-pillars.md",
  "docs/offers-and-services.md",
  "docs/editorial-rules.md",
  "docs/news-sourcing.md",
  "docs/topic-bank.md",
  "docs/seo-rules.md",
  "docs/publishing-rules.md",
  "docs/visual-style.md",
];

const REQUIRED_ENV = [
  "SANITY_PROJECT_ID",
  "SANITY_DATASET",
  "SANITY_API_TOKEN",
];

function printCheck(label, ok, details) {
  const prefix = ok ? "[ok]" : "[warn]";
  console.log(`${prefix} ${label}${details ? `: ${details}` : ""}`);
}

function checkDocs() {
  REQUIRED_DOCS.forEach((docPath) => {
    printCheck(docPath, fileExists(docPath));
  });
}

function checkEnv() {
  const envPath = ".env";
  printCheck(".env file", fileExists(envPath));

  REQUIRED_ENV.forEach((name) => {
    printCheck(name, Boolean(process.env[name]));
  });
}

function checkSchemaAlignment() {
  const schemaPath = path.join("..", "sanity", "schemaTypes", "article.ts");
  const schemaText = readText(schemaPath);
  const requiredNames = ["seoDescription", "language", "status", "practicalTakeaways"];
  const optionalNames = ["coverImageBrief", "coverImageAlt", "contentType", "sourceReferences"];

  requiredNames.forEach((fieldName) => {
    printCheck(`schema field ${fieldName}`, schemaText.includes(`name: '${fieldName}'`));
  });

  optionalNames.forEach((fieldName) => {
    printCheck(`schema field ${fieldName}`, schemaText.includes(`name: '${fieldName}'`));
  });
}

function checkRecentOutputs() {
  const outputs = listJsonFiles("outputs");
  printCheck("outputs directory", true, `${outputs.length} json file(s) found`);

  const recentTopics = readJson("recent-topics.json", []);
  printCheck("recent-topics.json", Array.isArray(recentTopics), `${recentTopics.length} tracked topic(s)`);

  const latestArticle = outputs.length > 0 ? readJson(outputs[outputs.length - 1], null) : null;
  if (latestArticle) {
    const report = reviewArticle(latestArticle, outputs[outputs.length - 1]);
    printCheck("latest output quality gate", report.passed, `score ${report.score}`);
  }
}

function main() {
  console.log("Checking SocialBrand1980 content ops setup...");
  checkDocs();
  checkEnv();
  checkSchemaAlignment();
  checkRecentOutputs();
}

main();
