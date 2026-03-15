import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@sanity/client";
import { buildSanityArticleId, fileExists, makeSlug } from "./helpers.js";
import { reviewArticle } from "./review-generated-articles.js";

dotenv.config();

const isDryRun = process.argv.includes("--dry-run") || String(process.env.PUBLISH_DRY_RUN || "").trim() === "1";
const latestCountArg = process.argv.find((arg) => arg.startsWith("--latest-count="));
const latestCount = latestCountArg ? Number.parseInt(latestCountArg.split("=")[1], 10) : Number.parseInt(process.env.PUBLISH_COUNT || "1", 10);
const publishMode = String(process.env.SANITY_PUBLISH_MODE || "draft").trim().toLowerCase() === "published" ? "published" : "draft";
const allowPublishWithWarnings = String(process.env.ALLOW_PUBLISH_WITH_WARNINGS || "").trim() === "1";
const forceReuploadImage = String(process.env.FORCE_REUPLOAD_IMAGE || "").trim() === "1";

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: process.env.SANITY_API_VERSION || "2025-02-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

function getLatestOutputFiles(limit = 1) {
  const outputDir = "outputs";
  const files = fs
    .readdirSync(outputDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => ({
      name: file,
      fullPath: path.join(outputDir, file),
      time: fs.statSync(path.join(outputDir, file)).mtimeMs,
    }))
    .sort((a, b) => b.time - a.time);

  if (files.length === 0) {
    throw new Error("No output JSON files found in outputs/");
  }

  return files.slice(0, limit).reverse().map((file) => file.fullPath);
}

function validateArticlePayload(article) {
  const missing = [];

  if (!article.title) missing.push("title");
  if (!article.excerpt) missing.push("excerpt");
  if (!article.seoDescription) missing.push("seoDescription");
  if (!Array.isArray(article.content) || article.content.length === 0) missing.push("content");
  if (!article.category) missing.push("category");
  if (!article.readTime) missing.push("readTime");
  if (!article.coverImagePath) missing.push("coverImagePath");

  if (missing.length > 0) {
    throw new Error(`Latest output is missing required article fields: ${missing.join(", ")}`);
  }
}

function buildSourceReferenceKey(reference, index) {
  const base = makeSlug(`${reference.publisher || "source"}-${reference.title || index}-${index}`);
  return (base || `source-${index}`).slice(0, 96);
}

function normalizeSourceReferences(article) {
  const refs = Array.isArray(article.sourceReferences) ? article.sourceReferences : [];
  const deduped = [];
  const seen = new Set();

  refs.forEach((ref, index) => {
    if (!ref || typeof ref !== "object") return;

    const title = String(ref.title || "").trim();
    const publisher = String(ref.publisher || "").trim();
    const url = String(ref.url || "").trim();
    const publishedAt = String(ref.publishedAt || "").trim();

    if (!title || !publisher || !url) return;

    const fingerprint = `${title.toLowerCase()}|${publisher.toLowerCase()}|${url}`;
    if (seen.has(fingerprint)) return;

    seen.add(fingerprint);
    deduped.push({
      _type: "sourceReference",
      _key: buildSourceReferenceKey({ title, publisher }, index),
      title,
      publisher,
      url,
      publishedAt,
    });
  });

  return deduped;
}

async function getExistingArticleState(documentId, draftId) {
  const results = await client.fetch(
    `*[_id in $ids]{
      _id,
      publishedAt,
      "mainImageRef": mainImage.asset->_id
    }`,
    { ids: [documentId, draftId] }
  );

  const publishedDoc = results.find((item) => item._id === documentId) || null;
  const draftDoc = results.find((item) => item._id === draftId) || null;

  return { publishedDoc, draftDoc };
}

async function main() {
  const requiredEnv = ["SANITY_PROJECT_ID", "SANITY_DATASET", "SANITY_API_TOKEN"];
  const missingEnv = requiredEnv.filter((name) => !process.env[name]);

  if (missingEnv.length > 0) {
    throw new Error(`Missing environment variables: ${missingEnv.join(", ")}`);
  }

  const files = getLatestOutputFiles(Number.isFinite(latestCount) && latestCount > 0 ? latestCount : 1);
  const preparedArticles = [];

  for (const latestFile of files) {
    const raw = fs.readFileSync(latestFile, "utf8");
    const article = JSON.parse(raw);
    const slug = article.slug || makeSlug(article.title);
    const documentId = buildSanityArticleId(slug);
    const draftId = `drafts.${documentId}`;
    validateArticlePayload(article);
    const review = reviewArticle(article, latestFile);

    if (!review.passed && !allowPublishWithWarnings) {
      throw new Error(
        `Quality gate failed for ${path.basename(latestFile)}: ${review.reasons.join("; ")}`
      );
    }

    if (!fileExists(article.coverImagePath)) {
      throw new Error(`Cover image file not found: ${article.coverImagePath}`);
    }

    preparedArticles.push({
      latestFile,
      article,
      slug,
      documentId,
      draftId,
      review,
    });
  }

  const docs = [];
  const uploadedAssetIds = [];

  try {
    for (const item of preparedArticles) {
      const { article, latestFile, slug, documentId, draftId } = item;
      const targetId = publishMode === "published" ? documentId : draftId;
      const { publishedDoc, draftDoc } = isDryRun
        ? { publishedDoc: null, draftDoc: null }
        : await getExistingArticleState(documentId, draftId);

      let imageAssetRef = draftDoc?.mainImageRef || publishedDoc?.mainImageRef || null;

      if (!imageAssetRef || forceReuploadImage) {
        if (!isDryRun) {
          const imageAsset = await client.assets.upload("image", fs.createReadStream(article.coverImagePath), {
            filename: path.basename(article.coverImagePath),
            contentType: "image/png",
          });
          imageAssetRef = imageAsset._id;
          uploadedAssetIds.push(imageAsset._id);
        } else {
          imageAssetRef = "image-asset-dry-run";
        }
      }

      const doc = {
        _id: targetId,
        _type: "article",
        title: article.title,
        slug: {
          _type: "slug",
          current: slug,
        },
        excerpt: article.excerpt,
        seoDescription: article.seoDescription,
        content: article.content,
        category: article.category || "Brand Strategy",
        language: article.language || "id-ID",
        author: article.author || "Jhordi Deamarall",
        status: publishMode === "published" ? "published" : article.status || "readyForReview",
        publishedAt: publishMode === "published"
          ? (publishedDoc?.publishedAt || new Date().toISOString())
          : (article.publishedAt || draftDoc?.publishedAt || new Date().toISOString()),
        readTime: article.readTime || "4 min read",
        practicalTakeaways: article.practicalTakeaways || [],
        contentType: article.contentType || "evergreen",
        sourceReferences: normalizeSourceReferences(article),
        coverImageBrief: article.coverImageBrief || "",
        coverImageAlt: article.coverImageAlt || "",
        featured: Boolean(article.featured),
        mainImage: {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: imageAssetRef,
          },
          alt: article.coverImageAlt || "",
        },
      };

      docs.push({
        latestFile,
        doc,
        draftExists: Boolean(draftDoc),
      });
    }

    if (isDryRun) {
      for (const { latestFile, doc } of docs) {
        console.log(`Dry run payload ready for Sanity ${publishMode} document from ${path.basename(latestFile)}:`);
        console.log(JSON.stringify(doc, null, 2));
      }
      return;
    }

    let transaction = client.transaction();

    for (const { doc, draftExists } of docs) {
      transaction = transaction.createOrReplace(doc);
      if (publishMode === "published" && draftExists) {
        transaction = transaction.delete(`drafts.${buildSanityArticleId(doc.slug.current)}`);
      }
    }

    const results = await transaction.commit();
    const resultList = Array.isArray(results?.results) ? results.results : [];

    for (const { doc } of docs) {
      const syncedId = doc._id;
      const synced = resultList.find((item) => item.id === syncedId);
      console.log(`${publishMode === "published" ? "Published document" : "Draft"} synced to Sanity:`, synced?.id || syncedId);
    }
  } catch (error) {
    if (!isDryRun) {
      await Promise.all(
        uploadedAssetIds.map(async (assetId) => {
          try {
            await client.delete(assetId);
          } catch {
            // Ignore cleanup errors and bubble up the original publish failure.
          }
        })
      );
    }

    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
