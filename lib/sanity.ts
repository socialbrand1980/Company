import { createClient, type QueryParams } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'

if (!projectId) {
  throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID is not set in environment variables')
}

export const sanityConfig = {
  projectId,
  dataset,
  apiVersion,
  // Use CDN: false to always get fresh data from Sanity
  useCdn: false,
  // Add token for preview mode (optional, for draft content)
  // token: process.env.SANITY_API_READ_TOKEN,
}

export const client = createClient(sanityConfig)

export async function sanityFetch<QueryResponse>({
  query,
  params = {},
  tags = [],
}: {
  query: string
  params?: QueryParams
  tags?: string[]
}): Promise<QueryResponse> {
  try {
    const result = await client.fetch<QueryResponse>(query, params, {
      cache: 'no-store', // Always fetch fresh data
      next: { tags },
    })
    return result
  } catch (error) {
    console.error('Sanity fetch error:', {
      query: query.substring(0, 100) + '...',
      params,
      error,
      projectId,
      dataset,
    })
    throw error
  }
}

export interface Article {
  _id: string
  _createdAt: string
  _updatedAt: string
  title: string
  slug: string  // Changed from { current: string } to string
  excerpt: string
  content: any[]
  category: string
  author: string
  publishedAt: string
  readTime: string
  featured: boolean
  imageUrl?: string
  mainImage?: {
    asset?: {
      _ref: string
      url: string
    }
    alt?: string
  }
  relatedArticles?: any[]
}
