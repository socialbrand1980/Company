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
  // Enable request deduplication
  requestTaggers: ['articles'],
}

export const client = createClient(sanityConfig)

// Image URL helper with optimization
export function imageUrlFor(source: any, options?: { width?: number; height?: number; quality?: number }) {
  if (!source?.asset?._ref) return null
  
  const { width = 800, height, quality = 80 } = options || {}
  const imageId = source.asset._ref.split('-')[1]
  const extension = source.asset._ref.split('-')[3]
  
  let url = `https://cdn.sanity.io/images/${projectId}/${dataset}/${imageId}.${extension}?w=${width}&q=${quality}`
  if (height) url += `&h=${height}`
  url += '&auto=format'
  
  return url
}

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
    })
    throw error
  }
}

export interface Article {
  _id: string
  _createdAt: string
  _updatedAt: string
  title: string
  slug: string
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

export interface Portfolio {
  _id: string
  title: string
  slug: string
  clientName: string
  clientLogoUrl?: string
  projectImageUrl?: string
  gallery?: string[]
  description: string
  services: string[]
  industry: string
  projectUrl?: string
  completedDate: string
  featured: boolean
  results?: Array<{
    metric: string
    value: string
  }>
}
