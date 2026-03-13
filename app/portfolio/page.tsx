import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"

import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { sanityFetch, type Portfolio } from "@/lib/sanity"

const PORTFOLIOS_QUERY = `*[_type == "portfolio" && defined(slug.current)] | order(featured desc, completedDate desc) {
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
  "clientLogoAlt": coalesce(clientLogo.alt, clientName),
  "projectImageUrl": projectImage.asset->url,
  "projectImageAlt": coalesce(projectImage.alt, title),
  "gallery": gallery[] {
    "url": asset->url,
    "alt": alt
  },
  results[] {
    metric,
    value
  }
}`

interface PortfolioCredential extends Portfolio {
  clientLogoAlt?: string
  projectImageAlt?: string
}

type PortfolioPanel =
  | {
      type: "image"
      title: string
      subtitle?: string
      imageUrl: string
      imageAlt: string
    }
  | {
      type: "text"
      title: string
      subtitle?: string
    }

function formatMonthYear(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })
}

function formatServices(services: string[] = []) {
  if (services.length === 0) return "Not specified"
  if (services.length <= 2) return services.join(", ")
  return `${services.slice(0, 2).join(", ")} +${services.length - 2}`
}

function buildPanels(portfolio: PortfolioCredential): PortfolioPanel[] {
  const galleryPanels: PortfolioPanel[] =
    portfolio.gallery
      ?.filter((item) => item.url)
      .map((item, index) => ({
        type: "image" as const,
        title: `Frame ${String(index + 1).padStart(2, "0")}`,
        subtitle: item.alt || portfolio.clientName,
        imageUrl: item.url as string,
        imageAlt: item.alt || `${portfolio.title} image ${index + 1}`,
      })) || []

  if (galleryPanels.length > 0) {
    return galleryPanels
  }

  const servicePanels: PortfolioPanel[] = (portfolio.services || []).slice(0, 4).map((service) => ({
    type: "text" as const,
    title: service,
    subtitle: "Service scope",
  }))

  const fallbackPanels: PortfolioPanel[] = [
    {
      type: "text",
      title: portfolio.clientName,
      subtitle: "Client",
    },
    {
      type: "text",
      title: portfolio.industry,
      subtitle: "Industry",
    },
    {
      type: "text",
      title: portfolio.featured ? "Featured" : "Published",
      subtitle: "Status",
    },
    {
      type: "text",
      title: formatMonthYear(portfolio.completedDate),
      subtitle: "Completed",
    },
  ]

  return [...servicePanels, ...fallbackPanels].slice(0, 4)
}

async function getPortfolios() {
  try {
    const portfolios = await sanityFetch<PortfolioCredential[]>({
      query: PORTFOLIOS_QUERY,
      tags: ["portfolio"],
    })

    return portfolios || []
  } catch (error) {
    console.error("Error fetching portfolios:", error)
    return []
  }
}

export default async function PortfolioPage() {
  const portfolios = await getPortfolios()

  return (
    <>
      <Navigation />
      <main id="portfolio" className="bg-background">
        <section className="border-b border-border/30 pt-28 sm:pt-32 lg:pt-36 pb-8 sm:pb-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
                Portfolio
              </p>
              <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.72fr)] lg:items-end">
                <div>
                  <h1 className="text-2xl sm:text-[2rem] font-medium tracking-tight text-foreground">
                    Strategic work presented with more context, clarity, and momentum.
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm sm:text-[15px] leading-7 text-muted-foreground">
                    Scroll through each case study to see the visual output, project scope, and measurable result in
                    one continuous flow.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-border/70 bg-card/20 p-4 sm:p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                  <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                    What You Will See
                  </p>
                  <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                    <p>Visual direction and hero asset</p>
                    <p>Project background and service scope</p>
                    <p>Results, supporting frames, and next-step CTA</p>
                  </div>
                </div>
              </div>

              {portfolios.length > 0 ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  {portfolios.map((portfolio, index) => (
                    <a
                      key={portfolio._id}
                      href={`#${portfolio.slug}`}
                      className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-card/20 px-3 py-2 text-xs text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-foreground"
                    >
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <span>{portfolio.clientName}</span>
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="py-6 sm:py-8 lg:py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {portfolios.length === 0 ? (
              <div className="rounded-[2rem] border border-border/40 bg-card/30 px-6 py-14 text-center">
                <p className="text-sm text-muted-foreground">
                  Portfolio entries will appear here automatically once they are published in Sanity.
                </p>
              </div>
            ) : (
              <div className="space-y-10 sm:space-y-12 lg:space-y-16">
                {portfolios.map((portfolio, index) => {
                  const panels = buildPanels(portfolio)
                  const projectResults = portfolio.results?.filter((item) => item.metric && item.value) || []

                  return (
                    <article key={portfolio._id} id={portfolio.slug} className="scroll-mt-28 sm:scroll-mt-32">
                      <div className="mb-5 flex items-center gap-4">
                        <span className="shrink-0 text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
                          Portfolio {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-r from-border via-border/70 to-transparent" />
                        {portfolio.featured ? (
                          <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
                            Featured
                          </span>
                        ) : null}
                      </div>

                      <div className="rounded-[2rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.16),inset_0_0_0_1px_rgba(255,255,255,0.04)] transition-shadow hover:shadow-[0_24px_100px_rgba(45,117,255,0.12)] sm:p-6 lg:p-8">
                        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(300px,0.88fr)] lg:gap-8">
                          <div className="flex flex-col gap-4 sm:gap-5">
                            <div className="group overflow-hidden rounded-[1.75rem] border border-border/60 bg-card/20 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
                              <div className="aspect-[4/3] sm:aspect-[16/11] w-full bg-muted/20">
                                {portfolio.projectImageUrl ? (
                                  <img
                                    src={portfolio.projectImageUrl}
                                    alt={portfolio.projectImageAlt || portfolio.title}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                    loading={index === 0 ? "eager" : "lazy"}
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center bg-muted/30 px-6 text-center">
                                    <div>
                                      <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                                        Main Visual
                                      </p>
                                      <p className="mt-3 text-base font-medium text-foreground">{portfolio.title}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="rounded-[1.5rem] border border-border/60 bg-card/10 p-4 sm:p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
                              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                                Overview
                              </p>
                              <p className="mt-3 max-w-[64ch] text-sm sm:text-[15px] leading-6 text-muted-foreground">
                                {portfolio.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-6">
                            <div className="flex flex-col rounded-[1.5rem] border border-border/60 bg-card/20 p-5 sm:p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                                    {portfolio.clientName}
                                  </p>
                                  <h2 className="mt-3 text-xl sm:text-2xl font-medium tracking-tight text-foreground">
                                    {portfolio.title}
                                  </h2>
                                </div>
                                {portfolio.clientLogoUrl ? (
                                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/30 bg-background/40 p-2">
                                    <img
                                      src={portfolio.clientLogoUrl}
                                      alt={portfolio.clientLogoAlt || portfolio.clientName}
                                      className="max-h-full w-auto object-contain"
                                      loading="lazy"
                                    />
                                  </div>
                                ) : null}
                              </div>

                              <p className="mt-4 text-sm sm:text-[15px] leading-7 text-muted-foreground">
                                A compact summary of the brief, execution, and outcome so the project reads clearly at a
                                glance before you continue scrolling.
                              </p>

                              <div className="mt-6 rounded-[1.25rem] border border-border/60 bg-background/30 px-4 py-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
                                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                                  Project Snapshot
                                </p>
                                <div className="mt-4 space-y-3 text-sm">
                                  <div className="flex items-start justify-between gap-4 border-t border-border/30 pt-3">
                                    <span className="text-muted-foreground">Client</span>
                                    <span className="max-w-[60%] text-right text-foreground">{portfolio.clientName}</span>
                                  </div>
                                  <div className="flex items-start justify-between gap-4 border-t border-border/30 pt-3">
                                    <span className="text-muted-foreground">Industry</span>
                                    <span className="max-w-[60%] text-right text-foreground">{portfolio.industry}</span>
                                  </div>
                                  <div className="flex items-start justify-between gap-4 border-t border-border/30 pt-3">
                                    <span className="text-muted-foreground">Completed</span>
                                    <span className="max-w-[60%] text-right text-foreground">
                                      {formatMonthYear(portfolio.completedDate)}
                                    </span>
                                  </div>
                                  <div className="flex items-start justify-between gap-4 border-t border-border/30 pt-3">
                                    <span className="text-muted-foreground">Scope</span>
                                    <span className="max-w-[60%] text-right text-foreground">
                                      {formatServices(portfolio.services)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                <Button asChild className="neon-btn text-white font-medium">
                                  <Link href="/work-with-us">
                                    Discuss Similar Scope
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  </Link>
                                </Button>
                                {portfolio.projectUrl ? (
                                  <Button asChild variant="outline" className="border-border/40 bg-background/20">
                                    <a href={portfolio.projectUrl} target="_blank" rel="noopener noreferrer">
                                      Visit Project
                                      <ArrowUpRight className="ml-2 h-4 w-4" />
                                    </a>
                                  </Button>
                                ) : null}
                              </div>
                            </div>

                            <div className="rounded-[1.5rem] border border-border/60 bg-card/10 p-4 sm:p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
                              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                                Service Focus
                              </p>
                              <div className="mt-4 flex flex-wrap gap-2">
                                {(portfolio.services || []).map((service) => (
                                  <span
                                    key={`${portfolio._id}-${service}`}
                                    className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs text-primary transition-colors hover:border-primary/40 hover:bg-primary/15"
                                  >
                                    {service}
                                  </span>
                                ))}
                              </div>
                              <div className="mt-5 rounded-[1.25rem] border border-border/60 bg-background/30 px-4 py-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
                                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                                  Why It Matters
                                </p>
                                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                                  This section clarifies the working scope so readers can immediately connect the creative
                                  output with the strategic services behind it.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {projectResults.length > 0 ? (
                          <div className="mt-6 rounded-[1.5rem] border border-border/60 bg-card/10 p-4 sm:p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                                  Project Result
                                </p>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                  Key outcomes placed ahead of the supporting frames so the impact lands clearly.
                                </p>
                              </div>
                              <span className="hidden sm:inline text-[11px] uppercase tracking-[0.18em] text-primary">
                                {projectResults.length} highlights
                              </span>
                            </div>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                              {projectResults.map((result, resultIndex) => (
                                <div
                                  key={`${portfolio._id}-result-${resultIndex}`}
                                  className="rounded-[1.25rem] border border-border/60 bg-card/20 px-4 py-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] transition-all hover:-translate-y-0.5 hover:border-primary/55 hover:bg-primary/8"
                                >
                                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                                    {result.metric}
                                  </p>
                                  <p className="mt-2 text-sm sm:text-base font-medium leading-6 text-foreground">
                                    {result.value}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        <div className="mt-6 rounded-[1.5rem] border border-border/60 bg-card/10 p-4 sm:p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                                Supporting Frames
                              </p>
                              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Additional visuals and project markers that reinforce the case study.
                              </p>
                            </div>
                            <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                              {panels.length} panels
                            </span>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                            {panels.map((panel, panelIndex) => (
                              <div
                                key={`${portfolio._id}-panel-${panelIndex}`}
                                className="group overflow-hidden rounded-[1.25rem] border border-border/60 bg-card/20 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] transition-all hover:-translate-y-0.5 hover:border-primary/55"
                              >
                                {panel.type === "image" ? (
                                  <>
                                    <div className="aspect-[4/5] overflow-hidden bg-muted/20">
                                      <img
                                        src={panel.imageUrl}
                                        alt={panel.imageAlt}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                                        loading="lazy"
                                      />
                                    </div>
                                    <div className="border-t border-border/20 px-3 py-3">
                                      <p className="text-xs font-medium text-foreground">{panel.title}</p>
                                      {panel.subtitle ? (
                                        <p className="mt-1 text-[11px] text-muted-foreground">{panel.subtitle}</p>
                                      ) : null}
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex aspect-[4/5] flex-col justify-start px-3 py-4 sm:px-4">
                                    {panel.subtitle ? (
                                      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                                        {panel.subtitle}
                                      </p>
                                    ) : null}
                                    <p className="mt-2 text-sm sm:text-base font-medium leading-6 text-foreground">
                                      {panel.title}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        <section className="border-t border-border/30 py-8 sm:py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-[1.75rem] border border-border/70 bg-card/20 px-5 py-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] sm:px-6 sm:py-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                    Next Step
                  </p>
                  <p className="mt-2 text-sm sm:text-[15px] leading-7 text-muted-foreground">
                    If you want a portfolio-worthy outcome for your brand, we can build the scope from strategy to
                    execution.
                  </p>
                </div>
                <Button asChild className="neon-btn text-white font-medium">
                  <Link href="/work-with-us">
                    Start a Project
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
