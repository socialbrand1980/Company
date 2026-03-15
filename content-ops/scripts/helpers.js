import fs from "fs";
import path from "path";
import slugify from "slugify";

const DEFAULT_TIMEZONE = process.env.CONTENT_OPS_TIMEZONE || "Asia/Jakarta";

export function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

export function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

export function fileExists(filePath) {
  return fs.existsSync(filePath);
}

export function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function makeSlug(text) {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  });
}

export function buildSanityArticleId(slugOrTitle) {
  const slug = makeSlug(slugOrTitle);
  return `article-${slug}`;
}

export function todayStamp(timeZone = DEFAULT_TIMEZONE) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(new Date());
}

export function buildOutputPath(title) {
  const slug = makeSlug(title);
  const basePath = path.join("outputs", `${todayStamp()}-${slug}.json`);

  if (!fs.existsSync(basePath)) {
    return basePath;
  }

  let counter = 2;
  while (true) {
    const nextPath = path.join("outputs", `${todayStamp()}-${slug}-${counter}.json`);
    if (!fs.existsSync(nextPath)) {
      return nextPath;
    }
    counter += 1;
  }
}

export function buildImagePath(title) {
  const slug = makeSlug(title);
  const dirPath = path.join("outputs", "images");
  ensureDir(dirPath);

  const basePath = path.join(dirPath, `${todayStamp()}-${slug}.png`);

  if (!fs.existsSync(basePath)) {
    return basePath;
  }

  let counter = 2;
  while (true) {
    const nextPath = path.join(dirPath, `${todayStamp()}-${slug}-${counter}.png`);
    if (!fs.existsSync(nextPath)) {
      return nextPath;
    }
    counter += 1;
  }
}

export function listJsonFiles(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  return fs
    .readdirSync(dirPath)
    .filter((file) => file.endsWith(".json"))
    .map((file) => ({
      path: path.join(dirPath, file),
      time: fs.statSync(path.join(dirPath, file)).mtimeMs,
    }))
    .sort((a, b) => a.time - b.time)
    .map((entry) => entry.path);
}

export function createSpan(text) {
  return {
    _type: "span",
    _key: `${Math.random().toString(36).slice(2, 10)}`,
    text,
    marks: [],
  };
}

export function createBlock(text, style = "normal") {
  return {
    _type: "block",
    _key: `${Math.random().toString(36).slice(2, 10)}`,
    style,
    markDefs: [],
    children: [createSpan(text)],
  };
}

export function estimateReadTime(blocks) {
  const text = blocks
    .flatMap((block) => block.children || [])
    .map((child) => child.text || "")
    .join(" ");

  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(3, Math.ceil(words / 180));
  return `${minutes} min read`;
}

export function countWordsInBlocks(blocks) {
  return blocks
    .flatMap((block) => block.children || [])
    .map((child) => child.text || "")
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function truncateAtWord(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }

  const sliced = text.slice(0, maxLength + 1);
  const lastSpace = sliced.lastIndexOf(" ");
  return (lastSpace > 0 ? sliced.slice(0, lastSpace) : text.slice(0, maxLength)).trim();
}

export function extractBulletItems(markdown) {
  return markdown
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^-\s+/.test(line))
    .map((line) => line.replace(/^-\s+/, "").trim());
}

export function extractNumberedItems(markdown) {
  return markdown
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^\d+\.\s+/.test(line))
    .map((line) => line.replace(/^\d+\.\s+/, "").trim());
}

export function extractSection(markdown, heading) {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`^##\\s+${escapedHeading}\\s*$`, "m");
  const match = markdown.match(regex);

  if (!match || match.index === undefined) {
    return "";
  }

  const start = match.index + match[0].length;
  const remainder = markdown.slice(start);
  const nextHeadingMatch = remainder.match(/\n##\s+/);
  return remainder.slice(0, nextHeadingMatch ? nextHeadingMatch.index : undefined).trim();
}
