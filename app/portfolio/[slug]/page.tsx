import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import PortfolioDetailPage from '@/components/portfolio-detail-page'

// Generate static params for all portfolios
export async function generateStaticParams() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

  if (!projectId) {
    return []
  }

  try {
    const query = encodeURIComponent('*[_type == "portfolio" && defined(slug.current)]{ "slug": slug.current }')
    const url = `https://${projectId}.api.sanity.io/v2021-03-25/data/query/${dataset}?query=${query}`

    const response = await fetch(url)
    const data = await response.json()
    const portfolios = data?.result || []

    return portfolios
      .filter((p: any) => p?.slug?.current)
      .map((p: any) => ({
        slug: p.slug.current,
      }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export default function PortfolioSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <>
      <Navigation />
      <main>
        <PortfolioDetailPage params={params} />
      </main>
      <Footer />
    </>
  )
}
