import { createHash } from 'crypto'

import { getSanityWriteClient } from '@/lib/sanity.server'

export const ARTICLE_FEEDBACK_REASONS = [
  'too_generic',
  'not_insightful',
  'weak_sources',
  'less_relevant',
  'awkward_tone',
] as const

export type ArticleFeedbackReason = (typeof ARTICLE_FEEDBACK_REASONS)[number]
export type ArticleFeedbackVote = 'like' | 'dislike'

export interface ArticleFeedbackSummary {
  likeCount: number
  dislikeCount: number
  reasonBreakdown: Record<string, number>
  userFeedback: {
    vote: ArticleFeedbackVote
    reason: ArticleFeedbackReason | null
  } | null
}

export function hashFeedbackSession(sessionId: string) {
  return createHash('sha256').update(sessionId).digest('hex').slice(0, 24)
}

function normalizeReason(reason: unknown): ArticleFeedbackReason | null {
  if (typeof reason !== 'string') {
    return null
  }

  return ARTICLE_FEEDBACK_REASONS.includes(reason as ArticleFeedbackReason)
    ? (reason as ArticleFeedbackReason)
    : null
}

function buildFeedbackDocumentId(articleId: string, sessionHash: string) {
  return `articleFeedback-${articleId.replace(/[^a-zA-Z0-9_-]/g, '-')}-${sessionHash}`
}

export async function fetchArticleFeedbackSummary(articleSlug: string, sessionId?: string): Promise<ArticleFeedbackSummary> {
  const client = getSanityWriteClient()
  const docs = await client.fetch<
    Array<{ vote?: ArticleFeedbackVote; reason?: string | null; sessionHash?: string }>
  >(
    `*[_type == "articleFeedback" && articleSlug == $articleSlug]{
      vote,
      reason,
      sessionHash
    }`,
    { articleSlug }
  )

  const sessionHash = sessionId ? hashFeedbackSession(sessionId) : null
  const summary: ArticleFeedbackSummary = {
    likeCount: 0,
    dislikeCount: 0,
    reasonBreakdown: {},
    userFeedback: null,
  }

  for (const doc of docs) {
    if (doc.vote === 'like') {
      summary.likeCount += 1
    }

    if (doc.vote === 'dislike') {
      summary.dislikeCount += 1
    }

    if (doc.reason) {
      summary.reasonBreakdown[doc.reason] = (summary.reasonBreakdown[doc.reason] || 0) + 1
    }

    if (sessionHash && doc.sessionHash === sessionHash && (doc.vote === 'like' || doc.vote === 'dislike')) {
      summary.userFeedback = {
        vote: doc.vote,
        reason: normalizeReason(doc.reason),
      }
    }
  }

  return summary
}

export async function upsertArticleFeedback(input: {
  articleId: string
  articleSlug: string
  articleTitle: string
  category: string
  contentType: string
  vote: ArticleFeedbackVote
  reason?: string | null
  sessionId: string
}) {
  const client = getSanityWriteClient()
  const sessionHash = hashFeedbackSession(input.sessionId)
  const documentId = buildFeedbackDocumentId(input.articleId, sessionHash)
  const existing = await client.getDocument(documentId)
  const now = new Date().toISOString()
  const reason = normalizeReason(input.reason)

  const doc = {
    _id: documentId,
    _type: 'articleFeedback',
    articleId: input.articleId,
    articleSlug: input.articleSlug,
    articleTitle: input.articleTitle,
    category: input.category,
    contentType: input.contentType,
    vote: input.vote,
    reason,
    sessionHash,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  }

  await client.createOrReplace(doc)
  return doc
}
