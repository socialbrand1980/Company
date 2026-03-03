"use client"

import React from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, Share2, Bookmark, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PortableText } from '@portabletext/react'
import { sanityFetch, type Article } from '@/lib/sanity'
import imageUrlBuilder from '@sanity/image-url'
import { client } from '@/lib/sanity'
import { SubscriptionForm } from '@/components/subscription-form'

const builder = imageUrlBuilder(client)

function urlFor(source: any) {
  return builder.image(source)
}

const ARTICLE_QUERY = `*[_type == "article" && slug.current == $slug][0] {
  _id,
  title,
  excerpt,
  content,
  category,
  author,
  publishedAt,
  readTime,
  featured,
  "slug": slug.current,
  "imageUrl": mainImage.asset->url,
  "relatedArticles": relatedArticles[]->{
    _id,
    title,
    "slug": slug.current,
    category
  }
}`

interface ArticleDetailPageProps {
  slug: string
}

export default function ArticleDetailPage({ slug }: ArticleDetailPageProps) {
  const [article, setArticle] = React.useState<Article | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [isSaved, setIsSaved] = React.useState(false)
  const [showSaveToast, setShowSaveToast] = React.useState(false)

  React.useEffect(() => {
    if (!slug) {
      setError('No article specified')
      setLoading(false)
      return
    }

    async function fetchArticle() {
      try {
        console.log('Fetching article with slug:', slug)
        const fetched = await sanityFetch<Article | null>({
          query: ARTICLE_QUERY,
          params: { slug },
        })

        console.log('Article fetched:', fetched ? fetched.title : 'null')

        if (!fetched) {
          setError('Article not found')
        }
        setArticle(fetched)
        
        // Check if article is saved
        if (fetched) {
          const savedArticles = JSON.parse(localStorage.getItem('savedArticles') || '[]')
          setIsSaved(savedArticles.includes(fetched._id))
        }
      } catch (err) {
        console.error('Error fetching article:', err)
        setError('Failed to load article')
      } finally {
        setLoading(false)
      }
    }
    fetchArticle()
  }, [slug])

  // Share function - basic native share
  const handleShare = async () => {
    if (!article) return
    
    const shareData = {
      title: article.title,
      text: article.excerpt,
      url: window.location.href,
    }

    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log('Share canceled')
      }
    } else {
      // Fallback: copy to clipboard (desktop)
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  // Save function
  const handleSave = () => {
    if (!article) return
    
    const savedArticles = JSON.parse(localStorage.getItem('savedArticles') || '[]')
    
    if (isSaved) {
      // Remove from saved
      const updated = savedArticles.filter((id: string) => id !== article._id)
      localStorage.setItem('savedArticles', JSON.stringify(updated))
      setIsSaved(false)
    } else {
      // Add to saved
      savedArticles.push(article._id)
      localStorage.setItem('savedArticles', JSON.stringify(savedArticles))
      setIsSaved(true)
      setShowSaveToast(true)
      setTimeout(() => setShowSaveToast(false), 3000)
    }
  }

  // Discuss function (WhatsApp)
  const handleDiscuss = () => {
    if (!article) return
    
    const message = encodeURIComponent(
      `Hi! I'd like to discuss this article:\n\n` +
      `"${article.title}"\n\n` +
      `${window.location.href}\n\n` +
      `Let's talk about it!`
    )
    
    const waUrl = `https://wa.me/62811198093?text=${message}`
    window.open(waUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading article...</p>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
          <p className="text-muted-foreground mb-6">{error || 'Article not found'}</p>
          <Button asChild className="neon-btn text-white">
            <Link href="/article">Back to Articles</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <article className="relative min-h-screen pt-32 sm:pt-40 lg:pt-48 pb-16 sm:pb-24 lg:pb-32 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2D75FF]/15 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/15 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/article"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Articles
        </Link>

        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">
              {article.category}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
            {article.title}
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            {article.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pb-6 border-b border-border/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{article.readTime}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-xs">
                {article.author.charAt(0)}
              </span>
              <span>{article.author}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-6 flex-wrap">
            <SubscriptionForm articleTitle={article.title} articleSlug={article.slug} />
            <Button 
              variant="outline" 
              size="sm" 
              className="neon-border bg-transparent"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className={`neon-border bg-transparent ${isSaved ? 'bg-primary/20 border-primary' : ''}`}
              onClick={handleSave}
            >
              <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? 'fill-primary text-primary' : ''}`} />
              {isSaved ? 'Saved' : 'Save'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="neon-border bg-transparent"
              onClick={handleDiscuss}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Discuss
            </Button>
          </div>
        </div>

        {article.imageUrl && (
          <div className="aspect-video w-full rounded-2xl mb-8 sm:mb-12 overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="prose prose-lg prose-invert max-w-none">
          <div className="text-muted-foreground leading-relaxed space-y-6 article-content">
            {article.content && (
              <PortableText
                value={article.content}
                components={{
                  block: {
                    normal: ({children}) => <p className="mb-6">{children}</p>,
                    h2: ({children}) => <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">{children}</h2>,
                    h3: ({children}) => <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">{children}</h3>,
                  },
                  marks: {
                    strong: ({children}) => <strong className="font-semibold text-foreground">{children}</strong>,
                    em: ({children}) => <em className="italic">{children}</em>,
                  },
                  list: {
                    bullet: ({children}) => <ul className="list-disc list-inside space-y-2 my-4 ml-4">{children}</ul>,
                    number: ({children}) => <ol className="list-decimal list-inside space-y-2 my-4 ml-4">{children}</ol>,
                  },
                  listItem: {
                    bullet: ({children}) => <li className="text-muted-foreground">{children}</li>,
                    number: ({children}) => <li className="text-muted-foreground">{children}</li>,
                  },
                }}
              />
            )}
          </div>
        </div>

        {article.relatedArticles && article.relatedArticles.length > 0 && (
          <div className="mt-16 pt-12 border-t border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-6">Related Articles</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {article.relatedArticles.map((relatedArticle: any) => {
                if (!relatedArticle) return null
                return (
                  <Link
                    key={relatedArticle._id}
                    href={`/article/${relatedArticle.slug}`}
                    className="glass-card p-4 rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    <span className="text-xs text-primary font-medium">{relatedArticle.category}</span>
                    <h3 className="text-sm font-semibold text-foreground mt-1 line-clamp-2">
                      {relatedArticle.title}
                    </h3>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Save Toast Notification */}
      {showSaveToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="glass-card rounded-xl px-6 py-4 flex items-center gap-3 border border-primary/50">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Bookmark className="h-4 w-4 fill-primary text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Article Saved!</p>
              <p className="text-xs text-muted-foreground">Find it in your saved articles</p>
            </div>
            <button
              onClick={() => setShowSaveToast(false)}
              className="ml-4 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </article>
  )
}
