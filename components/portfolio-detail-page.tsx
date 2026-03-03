"use client"

import React from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, Globe, ExternalLink, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { sanityFetch, type Portfolio, imageUrlFor } from '@/lib/sanity'

const PORTFOLIO_QUERY = `*[_type == "portfolio" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  clientName,
  description,
  industry,
  services,
  completedDate,
  featured,
  projectUrl,
  "clientLogoUrl": clientLogo.asset->url,
  "projectImageUrl": projectImage.asset->url,
  "gallery": gallery[].asset->url,
  results[] {
    metric,
    value
  }
}`

interface PortfolioDetailPageProps {
  params: Promise<{ slug: string }>
}

export default function PortfolioDetailPage({ params }: PortfolioDetailPageProps) {
  const [slug, setSlug] = React.useState<string>('')
  const [portfolio, setPortfolio] = React.useState<Portfolio | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    params.then(p => {
      setSlug(p.slug)
    })
  }, [params])

  React.useEffect(() => {
    if (!slug) return

    async function fetchPortfolio() {
      try {
        const fetched = await sanityFetch<Portfolio | null>({
          query: PORTFOLIO_QUERY,
          params: { slug },
        })
        setPortfolio(fetched)
      } catch (err) {
        console.error('Error fetching portfolio:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPortfolio()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
          <p className="text-muted-foreground mb-6">Project not found</p>
          <Button asChild className="neon-btn text-white">
            <Link href="/portfolio">Back to Portfolio</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <article className="relative min-h-screen pt-32 pb-16 sm:pt-40 lg:pt-48">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Portfolio
        </Link>

        {/* Project Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            {portfolio.clientLogoUrl && (
              <img
                src={portfolio.clientLogoUrl}
                alt={portfolio.clientName}
                className="h-12 object-contain"
              />
            )}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2">
                {portfolio.title}
              </h1>
              <p className="text-lg text-muted-foreground">{portfolio.clientName}</p>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 pb-6 border-b border-border/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(portfolio.completedDate).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>{portfolio.industry}</span>
            </div>
            {portfolio.projectUrl && (
              <a
                href={portfolio.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Globe className="h-4 w-4" />
                <ExternalLink className="h-3 w-3" />
                Visit Project
              </a>
            )}
          </div>
        </div>

        {/* Project Image */}
        {portfolio.projectImageUrl && (
          <div className="aspect-video w-full rounded-2xl mb-12 overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
            <img
              src={imageUrlFor({ asset: { _ref: portfolio.projectImageUrl } }, { width: 1200, quality: 85 }) || portfolio.projectImageUrl}
              alt={portfolio.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Description */}
        <div className="prose prose-lg prose-invert max-w-none mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">About the Project</h2>
          <p className="text-muted-foreground leading-relaxed">{portfolio.description}</p>
        </div>

        {/* Services */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Services Provided</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolio.services?.map((service: string) => (
              <div
                key={service}
                className="glass-card rounded-xl p-4 flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-foreground">{service}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        {portfolio.results && portfolio.results.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Results Achieved</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolio.results.map((result: any, index: number) => (
                <div
                  key={index}
                  className="glass-card rounded-xl p-6 text-center"
                >
                  <p className="text-3xl font-bold text-primary mb-2">{result.value}</p>
                  <p className="text-sm text-muted-foreground">{result.metric}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery */}
        {portfolio.gallery && portfolio.gallery.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Project Gallery</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolio.gallery.map((imageUrl: string, index: number) => (
                <div
                  key={index}
                  className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20"
                >
                  <img
                    src={imageUrl}
                    alt={`${portfolio.title} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
