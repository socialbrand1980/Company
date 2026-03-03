import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArticleDetail } from "@/components/article-detail"
import { client } from "@/lib/sanity"

export async function generateStaticParams() {
  try {
    // Use client directly without revalidation to avoid build-time API issues
    const articles = await client.fetch<{ slug: { current: string } }[]>(
      `*[_type == "article" && defined(slug.current)] { "slug": slug.current }`
    )
    
    if (!articles || articles.length === 0) {
      return []
    }
    
    return articles.map((article) => ({
      slug: String(article.slug.current),
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    // Return empty array if no articles or API error
    return []
  }
}

export default function ArticleSlugPage() {
  return (
    <>
      <Navigation />
      <main>
        <ArticleDetail />
      </main>
      <Footer />
    </>
  )
}
