import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArticleList } from "@/components/article-list"

export default function ArticlePage() {
  return (
    <>
      <Navigation />
      <main>
        <ArticleList />
      </main>
      <Footer />
    </>
  )
}
