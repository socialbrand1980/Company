import dotenv from "dotenv";
import { createClient } from "@sanity/client";
import { buildSanityArticleId, makeSlug } from "./helpers.js";

dotenv.config();

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: process.env.SANITY_API_VERSION || "2025-02-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  perspective: "raw",
});

function stripSystemFields(doc) {
  const { _createdAt, _updatedAt, _rev, ...rest } = doc;
  return rest;
}

function buildNewId(doc) {
  const isDraft = doc._id.startsWith("drafts.");
  const slug = doc.slug?.current || makeSlug(doc.title || doc._id);
  const publicId = buildSanityArticleId(slug);
  return isDraft ? `drafts.${publicId}` : publicId;
}

async function main() {
  const docs = await client.fetch(
    `*[_type == "article" && (_id match "article.*" || _id match "drafts.article.*")]{
      ...,
      slug,
      _id
    } | order(_updatedAt desc)`
  );

  if (docs.length === 0) {
    console.log("No private article IDs found.");
    return;
  }

  for (const doc of docs) {
    const newId = buildNewId(doc);
    if (newId === doc._id) {
      continue;
    }

    const nextDoc = {
      ...stripSystemFields(doc),
      _id: newId,
    };

    await client.createOrReplace(nextDoc);
    await client.delete(doc._id);
    console.log(`Migrated ${doc._id} -> ${newId}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
