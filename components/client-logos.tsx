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
    <section className="py-8 sm:py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Running Client Logos - Infinite Loop */}
        <div className="relative">
          {/* Gradient fade on edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-black to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-black to-transparent z-10" />
          
          {/* Running logos container */}
          <div className="flex animate-scroll-logos">
            {/* First set */}
            {clients.map((client: Portfolio, index: number) => (
              client.clientLogoUrl && (
                <div
                  key={`${client._id}-1-${index}`}
                  className="flex-shrink-0 mx-4 sm:mx-6 lg:mx-8 transition-all duration-300 hover:scale-110"
                >
                  <img
                    src={client.clientLogoUrl}
                    alt={client.clientName}
                    className="h-10 sm:h-12 lg:h-14 w-auto object-contain filter grayscale hover:grayscale-0"
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
                  className="flex-shrink-0 mx-4 sm:mx-6 lg:mx-8 transition-all duration-300 hover:scale-110"
                >
                  <img
                    src={client.clientLogoUrl}
                    alt={client.clientName}
                    className="h-10 sm:h-12 lg:h-14 w-auto object-contain filter grayscale hover:grayscale-0"
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
                  className="flex-shrink-0 mx-4 sm:mx-6 lg:mx-8 transition-all duration-300 hover:scale-110"
                >
                  <img
                    src={client.clientLogoUrl}
                    alt={client.clientName}
                    className="h-10 sm:h-12 lg:h-14 w-auto object-contain filter grayscale hover:grayscale-0"
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
