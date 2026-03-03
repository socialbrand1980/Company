"use client"

import React from "react"
import { sanityFetch, type Portfolio } from '@/lib/sanity'

const CLIENTS_QUERY = `*[_type == "portfolio" && defined(clientLogo.asset->url)] | order(completedDate desc) {
  _id,
  clientName,
  "clientLogoUrl": clientLogo.asset->url,
}`

export function ClientLogos() {
  const [clients, setClients] = React.useState<Portfolio[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchClients() {
      try {
        const fetched = await sanityFetch<Portfolio[]>({
          query: CLIENTS_QUERY,
        })
        // Get unique clients (no duplicates)
        const uniqueClients = fetched?.filter(
          (client, index, self) =>
            index === self.findIndex((c) => c.clientName === client.clientName)
        ) || []
        setClients(uniqueClients.slice(0, 10)) // Show max 10 clients
      } catch (error) {
        console.error('Error fetching clients:', error)
        setClients([])
      } finally {
        setLoading(false)
      }
    }
    fetchClients()
  }, [])

  if (loading || clients.length === 0) {
    return null // Don't show section if no clients or loading
  }

  return (
    <section className="py-12 sm:py-16 border-y border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-xs sm:text-sm font-medium tracking-widest uppercase mb-2 neon-text">
            Trusted By
          </p>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
            Our Amazing Clients
          </h2>
        </div>

        {/* Client Logos Grid - Tight fit */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {clients.map((client: Portfolio, index: number) => (
            <div
              key={client._id}
              className="flex items-center justify-center p-3 sm:p-4 glass-card rounded-xl transition-all duration-300 hover:scale-105 hover:bg-primary/5"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {client.clientLogoUrl ? (
                <img
                  src={client.clientLogoUrl}
                  alt={client.clientName}
                  className="max-h-10 sm:max-h-12 w-auto object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                  loading="lazy"
                />
              ) : (
                <span className="text-xs sm:text-sm font-medium text-muted-foreground text-center">
                  {client.clientName}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
