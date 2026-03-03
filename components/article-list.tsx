"use client"

import React from "react"
import Link from "next/link"
import { Calendar, Clock, ArrowRight, TrendingUp, Users2, Zap } from "lucide-react"
import { sanityFetch, type Article } from '@/lib/sanity'
import { SubscriptionForm } from '@/components/subscription-form'

const ARTICLES_QUERY = `*[_type == "article" && defined(slug.current)] | order(publishedAt desc, featured desc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  category,
  author,
  publishedAt,
  readTime,
  featured,
  "imageUrl": mainImage.asset->url
}`

const projectId = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID : undefined
const dataset = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_SANITY_DATASET || 'production' : undefined

const CATEGORIES = [
  { name: "All", icon: Zap },
  { name: "Brand Strategy", icon: TrendingUp },
  { name: "Social Media", icon: Users2 },
  { name: "Content Marketing", icon: Calendar },
]

export function ArticleList() {
  const [activeCategory, setActiveCategory] = React.useState("All")
  const [articles, setArticles] = React.useState<Article[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [debugInfo, setDebugInfo] = React.useState<string>('')

  React.useEffect(() => {
    async function fetchArticles() {
      try {
        const info = `Project ID: ${projectId}, Dataset: ${dataset}`
        setDebugInfo(info)
        console.log('📰 Fetching articles from Sanity...', info)
        
        const fetched = await sanityFetch<Article[]>({
          query: ARTICLES_QUERY,
        })
        
        console.log('✅ Articles fetched:', fetched?.length || 0, fetched)
        setArticles(fetched || [])
        setError(null)
      } catch (err: any) {
        const errorMsg = err?.message || 'Unknown error'
        console.error('❌ Error fetching articles:', err)
        setError(`Failed to load articles: ${errorMsg}`)
        setArticles([])
      } finally {
        setLoading(false)
      }
    }
    fetchArticles()
  }, [])

  const allArticles = articles

  const filteredArticles = activeCategory === "All"
    ? allArticles
    : allArticles.filter((a: Article) => a.category === activeCategory)

  const featuredArticles = filteredArticles.filter((a: Article) => a.featured)
  const regularArticles = filteredArticles.filter((a: Article) => !a.featured)

  if (loading) {
    return (
      <section className="relative min-h-screen py-16 sm:py-24 lg:py-32 overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading articles...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="relative min-h-screen py-16 sm:py-24 lg:py-32 overflow-hidden flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="glass-card inline-flex items-center justify-center h-16 w-16 rounded-full mb-4">
            <Zap className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load articles</h3>
          <p className="text-muted-foreground mb-4 text-sm">{error}</p>
          {debugInfo && (
            <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded mb-4">{debugInfo}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Check Vercel Environment Variables → Settings → Environment Variables
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="relative min-h-screen py-16 sm:py-24 lg:py-32 overflow-hidden">
      {/* Background neon glow */}
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-[#2D75FF]/15 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/3 left-0 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <p className="text-xs sm:text-sm font-medium tracking-widest uppercase mb-3 sm:mb-4 neon-text">
            Insights & Resources
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance">
            Latest <span className="neon-text">Articles</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground">
            Expert insights on brand strategy, social media marketing, and digital growth.
          </p>
          
          {/* Subscribe CTA */}
          <div className="mt-6 flex justify-center">
            <SubscriptionForm />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12">
          {CATEGORIES.map((category) => (
            <button
              key={category.name}
              type="button"
              onClick={() => setActiveCategory(category.name)}
              className={`
                inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm font-medium transition-all duration-300
                ${activeCategory === category.name
                  ? "neon-btn text-white"
                  : "glass-card text-muted-foreground hover:text-foreground hover:scale-105"
                }
              `}
            >
              <category.icon className="h-4 w-4" />
              {category.name}
            </button>
          ))}
        </div>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {featuredArticles.map((article: Article, index: number) => (
              <Link
                key={article._id}
                href={`/article/${article.slug}`}
                className="group glass-card rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="aspect-video w-full bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
                  {article.imageUrl ? (
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl font-bold text-primary/20 group-hover:scale-110 transition-transform duration-500">
                        {article.title.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">
                      Featured
                    </span>
                  </div>
                </div>
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <span className="text-primary font-medium">{article.category}</span>
                    <span>•</span>
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>•</span>
                    <Clock className="h-3 w-3" />
                    <span>{article.readTime}</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">By {article.author}</span>
                    <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Regular Articles */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {regularArticles.map((article: Article, index: number) => (
            <Link
              key={article._id}
              href={`/article/${article.slug}`}
              className="group glass-card rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="aspect-video w-full bg-gradient-to-br from-secondary/30 to-muted/30 relative overflow-hidden">
                {article.imageUrl ? (
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl font-bold text-muted-foreground/20 group-hover:scale-110 transition-transform duration-500">
                      {article.title.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span className="text-primary font-medium">{article.category}</span>
                  <span>•</span>
                  <Clock className="h-3 w-3" />
                  <span>{article.readTime}</span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {allArticles.length === 0 && !loading && !error && (
          <div className="text-center py-16">
            <div className="glass-card inline-flex items-center justify-center h-16 w-16 rounded-full mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No articles yet</h3>
            <p className="text-muted-foreground">Check back soon for new content!</p>
          </div>
        )}

        {filteredArticles.length === 0 && allArticles.length > 0 && (
          <div className="text-center py-16">
            <div className="glass-card inline-flex items-center justify-center h-16 w-16 rounded-full mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No articles in this category</h3>
            <p className="text-muted-foreground">Try selecting a different category.</p>
          </div>
        )}
      </div>
    </section>
  )
}
