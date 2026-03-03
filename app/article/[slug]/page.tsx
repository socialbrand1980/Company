import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import ArticleDetailPage from '@/components/article-detail-page'

// Generate static params for all articles at build time
export async function generateStaticParams() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  
  if (!projectId) {
    return []
  }

  try {
    const query = encodeURIComponent('*[_type == "article" && defined(slug.current)]{ "slug": slug.current }')
    const url = `https://${projectId}.api.sanity.io/v2021-03-25/data/query/${dataset}?query=${query}`
    
    const response = await fetch(url)
    const data = await response.json()
    const articles = data?.result || []

    return articles
      .filter((a: any) => a?.slug?.current)
      .map((a: any) => ({
        slug: a.slug.current,
      }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export default function ArticleSlugPage({ params }: { params: { slug: string } }) {
  return (
    <>
      <Navigation />
      <main>
        <ArticleDetailPage params={params} />
      </main>
      <Footer />
    </>
  )
}
