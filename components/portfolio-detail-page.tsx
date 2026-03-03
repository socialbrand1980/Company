"use client"

import React from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, Globe, ExternalLink, TrendingUp, CheckCircle2, Target, Lightbulb, Rocket } from "lucide-react"
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
  projectImage {
    asset {
      _ref,
      _type,
      url
    }
  },
  "gallery": gallery[] {
    "url": asset->url,
    "alt": alt
  },
  results[] {
    metric,
    value
  }
}`

interface PortfolioDetailPageProps {
  params: Promise<{ slug: string }>
}

// Service icons mapping
const serviceIcons: Record<string, any> = {
  "Brand Strategy": Target,
  "Social Media Management": Rocket,
  "Content Creation": Lightbulb,
  "Web Development": Globe,
  "Digital Marketing": TrendingUp,
  "SEO": CheckCircle2,
  "Paid Advertising": Target,
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

  // Get image URL with fallback
  const imageUrl = portfolio.projectImageUrl ||
                  (portfolio.projectImage?.asset && imageUrlFor(portfolio.projectImage, { width: 1200, quality: 85 }))

  return (
    <article className="relative min-h-screen pb-16 sm:pb-24 lg:pb-32">
      {/* Hero Section with Background Image */}
      <div className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] w-full overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={portfolio.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        
        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Portfolio
            </Link>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 max-w-4xl">
              {portfolio.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  {new Date(portfolio.completedDate).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">{portfolio.industry}</span>
              </div>
              {portfolio.projectUrl && (
                <a
                  href={portfolio.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  <ExternalLink className="h-3 w-3" />
                  Visit Project
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12 lg:mt-16 relative z-10">
        
        {/* Description */}
        <section className="glass-card rounded-2xl p-8 sm:p-10 lg:p-12 mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">About the Project</h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {portfolio.description}
          </p>
        </section>

        {/* Services */}
        {portfolio.services && portfolio.services.length > 0 && (
          <section className="glass-card rounded-2xl p-8 sm:p-10 lg:p-12 mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-8">Services Provided</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolio.services.map((service: string, index: number) => {
                const IconComponent = serviceIcons[service] || CheckCircle2
                return (
                  <div
                    key={index}
                    className="group p-5 rounded-xl bg-white/5 border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-foreground font-medium">{service}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Results - Minimalist */}
        {portfolio.results && portfolio.results.length > 0 && portfolio.results.some((r: any) => r.value && r.metric) && (
          <section className="glass-card rounded-2xl p-8 sm:p-10 lg:p-12 mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-8">Results Achieved</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {portfolio.results.map((result: any, index: number) => (
                result.value && result.metric && (
                  <div
                    key={index}
                    className="text-center"
                  >
                    <p className="text-3xl sm:text-4xl font-bold text-primary mb-1">
                      {result.value}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {result.metric}
                    </p>
                  </div>
                )
              ))}
            </div>
          </section>
        )}

        {/* Gallery */}
        {portfolio.gallery && portfolio.gallery.length > 0 && portfolio.gallery.some((img: any) => img.url) && (
          <section className="glass-card rounded-2xl p-8 sm:p-10 lg:p-12">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-8">Project Gallery</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolio.gallery.map((image: { url?: string; alt?: string }, index: number) => (
                image.url && (
                  <div
                    key={index}
                    className="group aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20"
                  >
                    <img
                      src={image.url}
                      alt={image.alt || `${portfolio.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                )
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  )
}
