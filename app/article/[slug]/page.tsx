import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArticleDetail } from "@/components/article-detail"
import { client } from "@/lib/sanity"

export async function generateStaticParams() {
  try {
    const articles = await client.fetch<{ slug: { current: string } }[]>(
      `*[_type == "article" && defined(slug.current)] { "slug": slug.current }`
    )

    if (!articles || articles.length === 0) {
      return []
    }

    return articles
      .filter((article) => article.slug && article.slug.current)
      .map((article) => ({
        slug: article.slug.current,
      }))
  } catch (error) {
    console.error('Error generating static params:', error)
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
