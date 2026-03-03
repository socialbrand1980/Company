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
    <section className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Client Logos - Just images, no wrappers */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 lg:gap-12">
          {clients.map((client: Portfolio, index: number) => (
            client.clientLogoUrl && (
              <div
                key={client._id}
                className="transition-all duration-300 hover:scale-110"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <img
                  src={client.clientLogoUrl}
                  alt={client.clientName}
                  className="h-8 sm:h-10 lg:h-12 w-auto object-contain filter grayscale hover:grayscale-0"
                  loading="lazy"
                />
              </div>
            )
          ))}
        </div>
      </div>
    </section>
  )
}
