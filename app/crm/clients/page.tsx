"use client"

import React, { useState, useEffect } from "react"
import { Search, Mail, TrendingUp, DollarSign, Users, Briefcase, Download, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatIDR } from "@/lib/format-currency"

interface Client {
  id: string
  brandName: string
  industry: string
  startDate: string
  totalValue: number
  services: string[]
  contactName: string
  email: string
  phone: string
}

function parseClientTimestamp(timestamp: string): Date | null {
  if (!timestamp) return null

  if (timestamp.startsWith('Date(')) {
    const match = timestamp.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/)
    if (match) {
      const [, year, month, day, hour, minute, second] = match
      return new Date(Date.UTC(Number(year), Number(month), Number(day), Number(hour), Number(minute), Number(second)))
    }
  }

  if (timestamp.includes('/') && timestamp.includes(':')) {
    const [datePart] = timestamp.split(' ')
    const [day, month, year] = datePart.split('/')

    if (day && month && year) {
      return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
    }
  }

  if (timestamp.includes('/')) {
    const [day, month, year] = timestamp.split('/')

    if (day && month && year) {
      return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
    }
  }

  const parsedDate = new Date(timestamp)
  return isNaN(parsedDate.getTime()) ? null : parsedDate
}

function formatClientSince(timestamp: string) {
  const parsedDate = parseClientTimestamp(timestamp)

  if (!parsedDate) {
    return 'Tanggal tidak valid'
  }

  return parsedDate.toLocaleDateString('id-ID', {
    month: 'short',
    year: 'numeric'
  })
}

export default function CRMClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function fetchClients() {
      try {
        const response = await fetch('/api/crm/leads')
        const data = await response.json()
        if (data.success) {
          const wonLeads = data.leads.filter((lead: any) => 
            lead.leadstatus === 'Closed Won'
          )
          
          const clientsData: Client[] = wonLeads.map((lead: any, index: number) => ({
            id: lead.email || `client-${index}`,
            brandName: lead.brandname || lead.brandName || 'Unknown',
            industry: lead.industry || 'Unknown',
            startDate: lead.timestamp || new Date().toISOString(),
            totalValue: typeof lead.budget === 'string' 
              ? parseInt(lead.budget.replace(/[^0-9]/g, '') || '0') || 0
              : (lead.budget as number) || 0,
            services: lead.servicesneeded?.split(',').map((s: string) => s.trim()).filter(Boolean) || [],
            contactName: lead.fullname || lead.fullName || 'Unknown',
            email: lead.email || '',
            phone: lead.phone || ''
          }))
          
          setClients(clientsData)
        }
      } catch (error) {
        console.error('Failed to fetch clients:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchClients()
  }, [])

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.industry.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  const stats = {
    total: clients.length,
    wonDeals: clients.length,
    totalValue: clients.reduce((acc, c) => acc + c.totalValue, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading clients...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Clients</h1>
            <p className="text-sm text-muted-foreground mt-1">Daftar client dari deal yang sudah closed won</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2 bg-white/[0.03] border-white/[0.08]">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm" className="gap-2 bg-blue-500 hover:bg-blue-600 text-white">
              <Briefcase className="h-4 w-4" />
              Add Client
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard icon={Users} label="Total Clients" value={stats.total.toString()} trendColor="blue" />
          <StatCard icon={TrendingUp} label="Closed Won" value={stats.wonDeals.toString()} trendColor="green" />
          <StatCard icon={DollarSign} label="Total Value" value={formatIDR(stats.totalValue)} trendColor="green" />
        </div>

        <div className="mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by brand, contact, or industry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] focus:border-blue-500/50 focus:outline-none text-foreground text-sm transition-colors"
            />
          </div>
        </div>

        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                  <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Brand</th>
                  <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact</th>
                  <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Industry</th>
                  <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Services</th>
                  <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Value</th>
                  <th className="p-4 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="p-4 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-blue-400">{client.brandName.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{client.brandName}</p>
                          <p className="text-xs text-muted-foreground">Since {formatClientSince(client.startDate)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <p className="text-sm text-white">{client.contactName}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{client.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-white">{client.industry}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-[250px]">
                        {client.services.slice(0, 2).map((service, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded bg-white/[0.05] text-muted-foreground truncate">
                            {service}
                          </span>
                        ))}
                        {client.services.length > 2 && (
                          <span className="text-xs px-2 py-1 rounded bg-white/[0.05] text-muted-foreground">
                            +{client.services.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-white font-medium">{formatIDR(client.totalValue)}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-xs px-3 py-1.5 rounded-full border inline-block min-w-[100px] bg-green-500/10 text-green-400 border-green-500/20">
                        Client
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            const phoneStr = typeof client.phone === 'number' 
                              ? String(client.phone)
                              : (client.phone || '')
                            const phone = phoneStr.replace(/[^0-9]/g, '')
                            let formattedPhone = phone
                            
                            // Format to international format (+62)
                            if (phone.startsWith('0')) {
                              formattedPhone = '62' + phone.substring(1)
                            } else if (!phone.startsWith('62') && phone.length > 0) {
                              formattedPhone = '62' + phone
                            }
                            
                            const message = encodeURIComponent(`Halo ${client.contactName} dari ${client.brandName}! 👋\n\nSaya dari SocialBrand 1980. Saya ingin mengikuti perkembangan project kita. Ada yang bisa saya bantu?\n\nBest regards,\nSocialBrand 1980 Team`)
                            
                            if (formattedPhone) {
                              window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank')
                            }
                          }}
                          className="p-2 hover:bg-green-500/10 rounded-lg transition-colors"
                          title="Chat on WhatsApp"
                        >
                          <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredClients.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No clients found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, trendColor }: any) {
  return (
    <div className="glass-card p-4 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.08] flex items-center justify-center">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  )
}
