import { NextRequest, NextResponse } from 'next/server'

import {
  fetchArticleFeedbackSummary,
  type ArticleFeedbackVote,
  upsertArticleFeedback,
} from '@/lib/article-feedback'
import { getSanityWriteClient } from '@/lib/sanity.server'

const ARTICLE_TARGET_QUERY = `*[_type == "article" && slug.current == $slug][0]{
  _id,
  title,
  category,
  contentType,
  "slug": slug.current
}`

function isValidVote(value: unknown): value is ArticleFeedbackVote {
  return value === 'like' || value === 'dislike'
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const sessionId = request.nextUrl.searchParams.get('sessionId') || undefined

  try {
    const summary = await fetchArticleFeedbackSummary(slug, sessionId)
    return NextResponse.json(summary)
  } catch (error) {
    console.error('Failed to fetch article feedback summary', error)
    return NextResponse.json({ error: 'Failed to fetch article feedback summary' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  try {
    const body = await request.json()
    const { vote, reason, sessionId } = body as {
      vote?: ArticleFeedbackVote
      reason?: string | null
      sessionId?: string
    }

    if (!isValidVote(vote) || typeof sessionId !== 'string' || sessionId.trim().length < 10) {
      return NextResponse.json({ error: 'Invalid feedback payload' }, { status: 400 })
    }

    const client = getSanityWriteClient()
    const article = await client.fetch<{
      _id: string
      title: string
      category?: string
      contentType?: string
      slug?: string
    } | null>(ARTICLE_TARGET_QUERY, { slug })

    if (!article?._id || !article.slug) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    await upsertArticleFeedback({
      articleId: article._id,
      articleSlug: article.slug,
      articleTitle: article.title,
      category: article.category || 'Uncategorized',
      contentType: article.contentType || 'evergreen',
      vote,
      reason,
      sessionId,
    })

    const summary = await fetchArticleFeedbackSummary(article.slug, sessionId)
    return NextResponse.json(summary)
  } catch (error) {
    console.error('Failed to save article feedback', error)
    return NextResponse.json({ error: 'Failed to save article feedback' }, { status: 500 })
  }
}
