import { createClient } from "@sanity/client";

function createSanityIntelligenceClient() {
  const projectId = process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const token = process.env.SANITY_API_TOKEN;

  if (!projectId || !dataset || !token) {
    return null;
  }

  return createClient({
    projectId,
    dataset,
    apiVersion: process.env.SANITY_API_VERSION || "2024-01-01",
    useCdn: false,
    token,
  });
}

export async function fetchRecentPublishedArticleSignals(limit = 40) {
  const client = createSanityIntelligenceClient();
  if (!client) {
    return {
      topicSeeds: [],
      sourceLinks: [],
    };
  }

  const docs = await client.fetch(
    `*[_type == "article"] | order(publishedAt desc)[0...$limit]{
      title,
      "topicSeed": workflowNotes.topicSeed,
      sourceReferences[]{
        url
      }
    }`,
    { limit }
  );

  const topicSeeds = [];
  const sourceLinks = [];
  for (const doc of docs || []) {
    if (doc?.topicSeed) {
      topicSeeds.push(doc.topicSeed);
    } else if (doc?.title) {
      topicSeeds.push(doc.title);
    }

    for (const ref of doc?.sourceReferences || []) {
      if (ref?.url) {
        sourceLinks.push(ref.url);
      }
    }
  }

  return {
    topicSeeds,
    sourceLinks,
  };
}

export async function fetchRecentArticleFeedback(windowDays = 90, limit = 400) {
  const client = createSanityIntelligenceClient();
  if (!client) {
    return [];
  }

  const sinceDate = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString();
  return client.fetch(
    `*[_type == "articleFeedback" && updatedAt >= $sinceDate] | order(updatedAt desc)[0...$limit]{
      vote,
      reason,
      category,
      contentType,
      articleSlug,
      articleTitle,
      updatedAt
    }`,
    { sinceDate, limit }
  );
}
