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
  // Use CDN: false during build to get fresh data, true for production runtime
  useCdn: false,
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
  return client.fetch<QueryResponse>(query, params, {
    cache: 'force-cache',
    next: { tags },
  })
}

export interface Article {
  _id: string
  _createdAt: string
  _updatedAt: string
  title: string
  slug: {
    current: string
  }
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
