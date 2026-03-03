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

  // Duplicate clients for seamless loop
  const allClients = [...clients, ...clients, ...clients]

  return (
    <section className="py-10 sm:py-14 overflow-hidden">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-xs sm:text-sm font-medium tracking-widest uppercase mb-2 neon-text">
            Trusted By
          </p>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
            Our Trusted Partners
          </h2>
        </div>

        {/* Running Client Logos - Infinite Loop */}
        <div className="relative w-full">
          {/* Gradient fade on edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 lg:w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 lg:w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
          
          {/* Running logos container */}
          <div className="flex animate-scroll-logos">
            {/* First set */}
            {clients.map((client: Portfolio, index: number) => (
              client.clientLogoUrl && (
                <div
                  key={`${client._id}-1-${index}`}
                  className="flex-shrink-0 mx-6 sm:mx-8 lg:mx-12 transition-all duration-300 hover:scale-110"
                >
                  <img
                    src={client.clientLogoUrl}
                    alt={client.clientName}
                    className="h-14 sm:h-16 lg:h-20 w-auto object-contain filter grayscale hover:grayscale-0"
                    loading="lazy"
                  />
                </div>
              )
            ))}
            
            {/* Second set (duplicate for loop) */}
            {clients.map((client: Portfolio, index: number) => (
              client.clientLogoUrl && (
                <div
                  key={`${client._id}-2-${index}`}
                  className="flex-shrink-0 mx-6 sm:mx-8 lg:mx-12 transition-all duration-300 hover:scale-110"
                >
                  <img
                    src={client.clientLogoUrl}
                    alt={client.clientName}
                    className="h-14 sm:h-16 lg:h-20 w-auto object-contain filter grayscale hover:grayscale-0"
                    loading="lazy"
                  />
                </div>
              )
            ))}
            
            {/* Third set (duplicate for loop) */}
            {clients.map((client: Portfolio, index: number) => (
              client.clientLogoUrl && (
                <div
                  key={`${client._id}-3-${index}`}
                  className="flex-shrink-0 mx-6 sm:mx-8 lg:mx-12 transition-all duration-300 hover:scale-110"
                >
                  <img
                    src={client.clientLogoUrl}
                    alt={client.clientName}
                    className="h-14 sm:h-16 lg:h-20 w-auto object-contain filter grayscale hover:grayscale-0"
                    loading="lazy"
                  />
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
