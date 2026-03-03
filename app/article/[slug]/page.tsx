import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArticleDetail } from "@/components/article-detail"

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
