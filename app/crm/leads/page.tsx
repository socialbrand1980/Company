"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Building2,
  DollarSign,
  Calendar,
  Tag,
  X,
  Eye,
  User,
  Globe,
  Target,
  Clock,
  MessageSquare,
  TrendingUp,
  Users as UsersIcon,
  Briefcase,
  FileText,
  CheckCircle2,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatIDR } from "@/lib/format-currency"

// Helper function to format timestamp - simple DD/MM/YYYY format
function formatTimestamp(timestamp: any): string {
  if (!timestamp) return 'N/A'

  try {
    let date: Date

    // If it's already a Date object (from Google Sheets)
    if (timestamp instanceof Date) {
      date = timestamp
    }
    // If it's a string that looks like "Date(2026,2,8,8,39,19)"
    else if (typeof timestamp === 'string' && timestamp.startsWith('Date(')) {
      const match = timestamp.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/)
      if (match) {
        const [, year, month, day, hour, minute, second] = match
        // Google Sheets Date() uses 0-indexed month like JS (0=January, 11=December)
        // So Date(2026,2,8,...) means March 8, 2026 (month 2 = March)
        date = new Date(Date.UTC(Number(year), Number(month), Number(day), Number(hour), Number(minute), Number(second)))
      } else {
        date = new Date(timestamp)
      }
    }
    // If it's a number (Unix timestamp)
    else if (typeof timestamp === 'number') {
      date = new Date(timestamp)
    }
    // If it's a regular string
    else {
      const dateStr = String(timestamp)

      // Handle ISO format (from API submissions)
      if (dateStr.includes('T')) {
        date = new Date(dateStr)
      }
      // Handle Google Sheets format: DD/MM/YYYY HH:MM:SS
      else if (dateStr.includes('/') && dateStr.includes(':')) {
        const parts = dateStr.split(' ')
        const datePart = parts[0] // DD/MM/YYYY
        const [day, month, year] = datePart.split('/')
        date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
      }
      // Handle DD/MM/YYYY
      else if (dateStr.includes('/')) {
        const parts = dateStr.split('/')
        if (parts.length === 3) {
          const [day, month, year] = parts
          date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
        } else {
          date = new Date(dateStr)
        }
      }
      // Try direct parse
      else {
        date = new Date(dateStr)
      }
    }

    if (isNaN(date.getTime())) {
      return 'N/A'
    }

    // Use UTC methods to avoid timezone issues
    const day = String(date.getUTCDate()).padStart(2, '0')
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const year = date.getUTCFullYear()

    return `${day}/${month}/${year}`
  } catch {
    return 'N/A'
  }
}

interface Lead {
  timestamp: string
  brandname: string
  website: string
  industry: string
  targetmarket: string
  yearfounded: string
  teamsize: string
  primarygoal: string
  runads: string
  channels: string
  budget: string
  targetaudience: string
  competitors: string
  timeline: string
  servicesneeded: string
  fullname: string
  email: string
  phone: string
  role: string
  leadstatus: string
  notes: string
}

const statusColors: Record<string, string> = {
  "New": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Contacted": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Discovery Call": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Proposal Sent": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Negotiation": "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "Closed Won": "bg-green-500/10 text-green-400 border-green-500/20",
  "Closed Lost": "bg-red-500/10 text-red-400 border-red-500/20",
}

const statusOptions = [
  "New",
  "Contacted",
  "Discovery Call",
  "Proposal Sent",
  "Negotiation",
  "Closed Won",
  "Closed Lost"
]

export default function CRMLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<keyof Lead>("timestamp")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showStatusDropdown, setShowStatusDropdown] = useState<string | null>(null)
  const [updatingEmail, setUpdatingEmail] = useState<string | null>(null)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [showAddLead, setShowAddLead] = useState(false)

  const fetchLeads = useCallback(async () => {
    try {
      const response = await fetch('/api/crm/leads')
      const data = await response.json()
      if (data.success) {
        setLeads(data.leads || [])
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeads()
    const interval = setInterval(fetchLeads, 30000)
    return () => clearInterval(interval)
  }, [fetchLeads])

  const handleSort = (field: keyof Lead) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const filteredLeads = leads
    .filter(lead => {
      const matchesSearch = 
        lead.brandname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.industry?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || lead.leadstatus === statusFilter
      
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      const aVal = a[sortField]?.toLowerCase() || ""
      const bVal = b[sortField]?.toLowerCase() || ""
      if (sortDirection === "asc") {
        return aVal.localeCompare(bVal)
      } else {
        return bVal.localeCompare(aVal)
      }
    })

  const updateLeadStatus = async (email: string, newStatus: string) => {
    setUpdatingEmail(email)
    try {
      const response = await fetch('/api/crm/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          updates: { leadStatus: newStatus }
        }),
      })
      
      if (response.ok) {
        await fetchLeads()
      } else {
        alert('Failed to update status')
      }
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Failed to update status')
    } finally {
      setUpdatingEmail(null)
      setShowStatusDropdown(null)
    }
  }

  const updateLead = async (email: string, updates: Partial<Lead>) => {
    setUpdatingEmail(email)
    try {
      const response = await fetch('/api/crm/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          updates,
        }),
      })
      
      if (response.ok) {
        await fetchLeads()
        setEditingLead(null)
      } else {
        alert('Failed to update lead')
      }
    } catch (error) {
      console.error('Failed to update lead:', error)
      alert('Failed to update lead')
    } finally {
      setUpdatingEmail(null)
    }
  }

  const exportToCSV = () => {
    const headers = ["Timestamp", "Brand", "Email", "Phone", "Industry", "Budget", "Status", "Services"]
    const csv = [
      headers.join(","),
      ...filteredLeads.map(lead => [
        lead.timestamp,
        lead.brandname,
        lead.email,
        lead.phone,
        lead.industry,
        lead.budget,
        lead.leadstatus,
        lead.servicesneeded?.replace(/,/g, ";") || ""
      ].join(","))
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and track all your leads</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchLeads} className="gap-2 bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2 bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={() => {
            console.log('Add Lead button clicked')
            setShowAddLead(true)
          }} className="gap-2 bg-blue-500 hover:bg-blue-600 text-white">
            <Plus className="h-4 w-4" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by brand, email, name, or industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] focus:border-blue-500/50 focus:outline-none text-foreground text-sm transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] focus:border-blue-500/50 focus:outline-none text-foreground text-sm min-w-[200px]"
          >
            <option value="all">All Status</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                <TableHeader label="Brand" field="brandname" sort={handleSort} currentSort={sortField} />
                <TableHeader label="Contact" field="fullname" sort={handleSort} currentSort={sortField} />
                <TableHeader label="Industry" field="industry" sort={handleSort} currentSort={sortField} />
                <TableHeader label="Primary Goal" field="primarygoal" sort={handleSort} currentSort={sortField} />
                <TableHeader label="Budget" field="budget" sort={handleSort} currentSort={sortField} />
                <TableHeader label="Services" />
                <TableHeader label="Timeline" field="timeline" sort={handleSort} currentSort={sortField} />
                <TableHeader label="Status" field="leadstatus" sort={handleSort} currentSort={sortField} />
                <th className="p-4 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead, index) => (
                <tr 
                  key={index} 
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{lead.brandname || "N/A"}</p>
                        {lead.website && (
                          <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                            {lead.website.replace(/^https?:\/\//, '')}
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <p className="text-sm text-white">{lead.fullname}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {lead.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {lead.phone}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <p className="text-sm text-white">{lead.industry}</p>
                      <p className="text-xs text-muted-foreground">{lead.targetmarket}</p>
                    </div>
                  </td>
                  <td className="p-4 max-w-[200px]">
                    <p className="text-sm text-white line-clamp-2" title={lead.primarygoal}>
                      {lead.primarygoal || "N/A"}
                    </p>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-white font-medium">
                      {lead.budget ? formatIDR(lead.budget) : "N/A"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1 max-w-[250px]">
                      {lead.servicesneeded?.split(",").slice(0, 2).map((service: string, i: number) => (
                        <span key={i} className="text-xs px-2 py-1 rounded bg-white/[0.05] text-muted-foreground truncate">
                          {service.trim()}
                        </span>
                      ))}
                      {lead.servicesneeded?.split(",").length > 2 && (
                        <span className="text-xs px-2 py-1 rounded bg-white/[0.05] text-muted-foreground">
                          +{lead.servicesneeded.split(",").length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-white">{lead.timeline || "N/A"}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="relative">
                      <button
                        onClick={() => setShowStatusDropdown(showStatusDropdown === lead.email ? null : lead.email)}
                        disabled={updatingEmail === lead.email}
                        className={`text-xs px-3 py-1.5 rounded-full border ${statusColors[lead.leadstatus] || statusColors["New"]} flex items-center gap-2 hover:opacity-80 transition-opacity disabled:opacity-50`}
                      >
                        {updatingEmail === lead.email ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            {lead.leadstatus || "New"}
                            <ChevronDown className="h-3 w-3" />
                          </>
                        )}
                      </button>
                      
                      {showStatusDropdown === lead.email && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setShowStatusDropdown(null)} />
                          <div className="absolute top-full left-0 mt-1 w-48 rounded-lg bg-[#0d0d12] border border-white/[0.08] shadow-xl z-20 overflow-hidden">
                            {statusOptions.map(status => (
                              <button
                                key={status}
                                onClick={() => updateLeadStatus(lead.email, status)}
                                disabled={updatingEmail === lead.email}
                                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/[0.05] transition-colors disabled:opacity-50 ${
                                  lead.leadstatus === status ? 'text-blue-400 bg-blue-500/10' : 'text-foreground'
                                }`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4 text-blue-400" />
                      </button>
                      <button
                        onClick={() => setEditingLead(lead)}
                        className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors"
                        title="Edit Lead"
                      >
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Convert phone to string and clean
                          let phone = String(lead.phone || '').replace(/[^0-9]/g, '')

                          // Format to international format (+62)
                          if (phone.startsWith('0')) {
                            phone = '62' + phone.substring(1)
                          } else if (phone.startsWith('62')) {
                            // Already has 62, keep it
                          } else if (phone.length <= 13) {
                            // Assume it's a local number without country code
                            phone = '62' + phone
                          }

                          // Fallback if still empty
                          phone = phone || '62811198093'

                          const brandName = lead.brandname || lead.fullname || 'Customer'
                          const industry = lead.industry || 'their industry'
                          const goal = lead.primarygoal ? ` dengan tujuan: ${String(lead.primarygoal).substring(0, 100)}${String(lead.primarygoal).length > 100 ? '...' : ''}` : ''

                          const message = `Halo ${lead.fullname || 'Bapak/Ibu'} dari ${brandName}! 👋

Saya dari SocialBrand 1980. Terima kasih telah tertarik dengan layanan kami.

Saya lihat ${brandName} bergerak di bidang ${industry}${goal}.

Saya ingin membantu ${brandName} untuk tumbuh lebih pesat. Apakah ada waktu untuk diskusi singkat minggu ini?

Best regards,
SocialBrand 1980 Team`

                          const encodedMessage = encodeURIComponent(message)
                          const waUrl = `https://wa.me/${phone}?text=${encodedMessage}`

                          // Open WhatsApp
                          window.open(waUrl, '_blank')
                        }}
                        className="p-2 hover:bg-green-500/10 rounded-lg transition-colors"
                        title="Chat on WhatsApp"
                      >
                        <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const subject = encodeURIComponent(`Regarding Your Interest in SocialBrand 1980 - ${lead.brandname || lead.fullname}`)
                          const body = encodeURIComponent(`Hi ${lead.fullname || lead.brandname},

Thank you for your interest in SocialBrand 1980 services.

Brand: ${lead.brandname || 'N/A'}
Industry: ${lead.industry || 'N/A'}
Goal: ${lead.primarygoal || 'N/A'}

We'd love to help you grow your brand. Let's schedule a call to discuss how we can work together.

Best regards,
SocialBrand 1980 Team
${lead.email ? `\n\nSent from: ${lead.email}` : ''}`)
                          window.open(`mailto:${lead.email}?subject=${subject}&body=${body}`, '_blank')
                        }}
                        className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Send Email"
                      >
                        <Mail className="h-4 w-4 text-blue-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredLeads.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No leads found</p>
          </div>
        )}
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}

      {/* Edit Lead Modal */}
      {editingLead && (
        <EditLeadModal
          lead={editingLead}
          onClose={() => setEditingLead(null)}
          onSave={updateLead}
          saving={updatingEmail === editingLead.email}
        />
      )}

      {/* Add Lead Modal */}
      {showAddLead && (
        <AddLeadModal
          onClose={() => {
            console.log('Closing modal')
            setShowAddLead(false)
          }}
          onAdd={async (newLead) => {
            console.log('Adding new lead:', newLead)
            try {
              // Use /api/leads endpoint instead of /api/crm/leads
              const response = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLead),
              })
              console.log('Response status:', response.status)
              const result = await response.json()
              console.log('Response result:', result)
              if (response.ok) {
                console.log('Lead added successfully')
                await fetchLeads()
                setShowAddLead(false)
              } else {
                console.error('Failed to add lead:', result)
                alert('Failed to add lead: ' + (result.error || 'Unknown error'))
              }
            } catch (error) {
              console.error('Error adding lead:', error)
              alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
            }
          }}
        />
      )}
    </div>
  )
}

function TableHeader({ label, field, sort, currentSort }: any) {
  return (
    <th
      className={`p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider ${field ? 'cursor-pointer hover:text-white transition-colors' : ''}`}
      onClick={() => field && sort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        {field && currentSort === field && (
          <ChevronUp className="h-3 w-3" />
        )}
      </div>
    </th>
  )
}

function EditLeadModal({ lead, onClose, onSave, saving }: { 
  lead: Lead, 
  onClose: () => void, 
  onSave: (email: string, updates: Partial<Lead>) => void,
  saving: boolean
}) {
  const [formData, setFormData] = useState({
    brandname: lead.brandname || '',
    industry: lead.industry || '',
    budget: lead.budget || '',
    fullname: lead.fullname || '',
    email: lead.email || '',
    phone: lead.phone || '',
    leadstatus: lead.leadstatus || 'New',
    notes: lead.notes || '',
    timeline: lead.timeline || '',
    servicesneeded: lead.servicesneeded || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(lead.email, formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl glass-card rounded-xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between p-6 border-b border-white/[0.05]">
          <h2 className="text-xl font-bold text-white">Edit Lead</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Brand Name</label>
              <input
                type="text"
                value={formData.brandname}
                onChange={(e) => setFormData({...formData, brandname: e.target.value})}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] focus:border-blue-500/50 focus:outline-none text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Industry</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({...formData, industry: e.target.value})}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] focus:border-blue-500/50 focus:outline-none text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Budget</label>
              <input
                type="text"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] focus:border-blue-500/50 focus:outline-none text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Timeline</label>
              <input
                type="text"
                value={formData.timeline}
                onChange={(e) => setFormData({...formData, timeline: e.target.value})}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] focus:border-blue-500/50 focus:outline-none text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Full Name</label>
              <input
                type="text"
                value={formData.fullname}
                onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] focus:border-blue-500/50 focus:outline-none text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] focus:border-blue-500/50 focus:outline-none text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] focus:border-blue-500/50 focus:outline-none text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Status</label>
              <select
                value={formData.leadstatus}
                onChange={(e) => setFormData({...formData, leadstatus: e.target.value})}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] focus:border-blue-500/50 focus:outline-none text-white text-sm"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Services Needed</label>
            <input
              type="text"
              value={formData.servicesneeded}
              onChange={(e) => setFormData({...formData, servicesneeded: e.target.value})}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] focus:border-blue-500/50 focus:outline-none text-white text-sm"
              placeholder="Comma separated"
            />
          </div>
          
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={4}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] focus:border-blue-500/50 focus:outline-none text-white text-sm resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.05]">
            <Button type="button" variant="outline" onClick={onClose} className="bg-white/[0.03] border-white/[0.08]">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-blue-500 hover:bg-blue-600 text-white">
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Lead Detail Modal - Shows ALL data from spreadsheet
function LeadDetailModal({ lead, onClose }: { lead: Lead, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl glass-card rounded-xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/[0.05] sticky top-0 bg-[#0a0a0f]">
          <div>
            <h2 className="text-2xl font-bold text-white">Lead Details</h2>
            <p className="text-sm text-muted-foreground mt-1">{lead.brandname} - {lead.email}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Brand Information */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-400" />
              Brand Information
            </h3>
            <div className="space-y-3 pl-6">
              <DetailRow icon={Building2} label="Brand Name" value={lead.brandname} />
              {lead.website && <DetailRow icon={Globe} label="Website" value={lead.website} isLink />}
              <DetailRow icon={Tag} label="Industry" value={lead.industry} />
              <DetailRow icon={Target} label="Target Market" value={lead.targetmarket} />
              <DetailRow icon={Clock} label="Year Founded" value={lead.yearfounded} />
              <DetailRow icon={UsersIcon} label="Team Size" value={lead.teamsize} />
            </div>
          </section>

          {/* Contact Information */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <User className="h-4 w-4 text-green-400" />
              Contact Information
            </h3>
            <div className="space-y-3 pl-6">
              <DetailRow icon={User} label="Full Name" value={lead.fullname} />
              <DetailRow icon={Briefcase} label="Role" value={lead.role} />
              <DetailRow icon={Mail} label="Email" value={lead.email} isLink={`mailto:${lead.email}`} />
              <DetailRow icon={Phone} label="Phone" value={lead.phone} isLink={`tel:${lead.phone}`} />
            </div>
          </section>

          {/* Business Goals */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-400" />
              Business Goals
            </h3>
            <div className="space-y-3 pl-6">
              <DetailRow icon={Target} label="Primary Goal" value={lead.primarygoal} />
              <DetailRow icon={MessageSquare} label="Run Ads" value={lead.runads === 'Yes' ? 'Yes' : 'No'} />
              <DetailRow icon={DollarSign} label="Budget" value={lead.budget ? formatIDR(lead.budget) : 'N/A'} />
              <DetailRow icon={Clock} label="Timeline" value={lead.timeline} />
            </div>
          </section>

          {/* Marketing Channels */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <UsersIcon className="h-4 w-4 text-orange-400" />
              Marketing Channels
            </h3>
            <div className="space-y-3 pl-6">
              <DetailRow icon={Tag} label="Channels" value={lead.channels} />
              <DetailRow icon={FileText} label="Services Needed" value={lead.servicesneeded} />
            </div>
          </section>

          {/* Additional Info */}
          {(lead.targetaudience || lead.competitors) && (
            <section className="space-y-4 md:col-span-2">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-cyan-400" />
                Additional Information
              </h3>
              <div className="space-y-3 pl-6">
                {lead.targetaudience && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Target Audience</p>
                    <p className="text-sm text-white">{lead.targetaudience}</p>
                  </div>
                )}
                {lead.competitors && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Competitors</p>
                    <p className="text-sm text-white">{lead.competitors}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Status & Notes */}
          <section className="space-y-4 md:col-span-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              Status & Notes
            </h3>
            <div className="space-y-3 pl-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Status</p>
                <span className={`text-sm px-3 py-1.5 rounded-full border ${statusColors[lead.leadstatus] || statusColors["New"]}`}>
                  {lead.leadstatus || "New"}
                </span>
              </div>
              {lead.notes && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm text-white">{lead.notes}</p>
                </div>
              )}
              {lead.timestamp && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Submitted At</p>
                  <p className="text-sm text-white">{formatTimestamp(lead.timestamp)}</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

// Helper component for detail rows
function DetailRow({ icon: Icon, label, value, isLink }: { icon: any, label: string, value: string, isLink?: boolean | string }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      {isLink ? (
        <a href={typeof isLink === "string" ? isLink : '#'} className="text-sm text-blue-400 hover:underline block">
          {value}
        </a>
      ) : (
        <p className="text-sm text-white">{value}</p>
      )}
    </div>
  )
}

// Add Lead Modal - Same fields as Work With Us form
function AddLeadModal({ onClose, onAdd }: { onClose: () => void, onAdd: (lead: any) => Promise<void> }) {
  const [formData, setFormData] = useState({
    brandName: '',
    website: '',
    industry: '',
    targetMarket: '',
    yearFounded: '',
    teamSize: '',
    primaryGoal: '',
    runAds: '',
    channels: [] as string[],
    budget: '',
    targetAudience: '',
    competitors: '',
    timeline: '',
    servicesNeeded: '',
    fullName: '',
    email: '',
    phone: '',
    role: '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted')
    setSaving(true)
    try {
      // Map form data to spreadsheet column names
      const leadData = {
        brandname: formData.brandName,
        website: formData.website,
        industry: formData.industry,
        targetmarket: formData.targetMarket,
        yearfounded: formData.yearFounded,
        teamsize: formData.teamSize,
        primarygoal: formData.primaryGoal,
        runads: formData.runAds,
        channels: formData.channels.join(', '),
        budget: formData.budget,
        targetaudience: formData.targetAudience,
        competitors: formData.competitors,
        timeline: formData.timeline,
        servicesneeded: formData.servicesNeeded,
        fullname: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        leadstatus: 'New',
        notes: '',
      }
      console.log('Lead data to save:', leadData)
      await onAdd(leadData)
    } catch (error) {
      console.error('Failed to add lead:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCheckboxChange = (field: string, value: string) => {
    setFormData(prev => {
      const current = prev[field as keyof typeof prev] as string[]
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value]
      return { ...prev, [field]: updated }
    })
  }

  const industryOptions = [
    "Beauty & Skincare",
    "Fashion",
    "Food & Beverage",
    "Technology",
    "E-commerce",
    "Education",
    "Health & Beauty",
    "Entertainment",
    "Real Estate",
    "Other"
  ]

  const teamSizeOptions = [
    "1-5",
    "6-20",
    "21-50",
    "51-200",
    "200+"
  ]

  const channelOptions = [
    "Meta Ads",
    "Google Ads",
    "TikTok Ads",
    "SEO",
    "Email Marketing",
    "Organic Social Media",
    "None"
  ]

  const timelineOptions = [
    "Immediately",
    "Within 1 month",
    "1 – 3 months",
    "Just exploring"
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl glass-card rounded-xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/[0.05] sticky top-0 bg-[#0a0a0f]">
          <div>
            <h2 className="text-2xl font-bold text-white">Add New Lead</h2>
            <p className="text-sm text-muted-foreground mt-1">Manually add a lead to your pipeline</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Brand Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-400" />
              Brand Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Brand Name *</label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => handleInputChange('brandName', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground transition-colors"
                  placeholder="Your brand name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Website / URL</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground transition-colors"
                  placeholder="https://yourbrand.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Industry *</label>
                <select
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground transition-colors"
                  required
                >
                  <option value="">Select industry</option>
                  {industryOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Target Market *</label>
                <input
                  type="text"
                  value={formData.targetMarket}
                  onChange={(e) => handleInputChange('targetMarket', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground transition-colors"
                  placeholder="e.g., Indonesia, Southeast Asia"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Year Founded</label>
                <input
                  type="text"
                  value={formData.yearFounded}
                  onChange={(e) => handleInputChange('yearFounded', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground transition-colors"
                  placeholder="e.g., 2020"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Team Size</label>
                <select
                  value={formData.teamSize}
                  onChange={(e) => handleInputChange('teamSize', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground transition-colors"
                >
                  <option value="">Select team size</option>
                  {teamSizeOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Business Goals */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-400" />
              Business Goals
            </h3>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Apa tujuan utama marketing Anda? *</label>
              <textarea
                value={formData.primaryGoal}
                onChange={(e) => handleInputChange('primaryGoal', e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground transition-colors resize-none"
                rows={3}
                placeholder="Contoh: Meningkatkan brand awareness, generate 100 leads per bulan, launch produk baru, dll."
                required
              />
              <p className="text-xs text-muted-foreground mt-2">Jelaskan secara detail tujuan marketing Anda</p>
            </div>
          </div>

          {/* Current Marketing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-400" />
              Current Marketing Activity
            </h3>
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">Apakah brand Anda saat ini menjalankan digital advertising?</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-3 p-4 rounded-lg border border-border/50 hover:border-primary/30 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="runAds"
                    value="Yes"
                    checked={formData.runAds === 'Yes'}
                    onChange={(e) => handleInputChange('runAds', e.target.value)}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm text-foreground">Yes</span>
                </label>
                <label className="flex items-center gap-3 p-4 rounded-lg border border-border/50 hover:border-primary/30 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="runAds"
                    value="No"
                    checked={formData.runAds === 'No'}
                    onChange={(e) => handleInputChange('runAds', e.target.value)}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm text-foreground">No</span>
                </label>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">Current Marketing Channels</label>
              <div className="grid grid-cols-2 gap-3">
                {channelOptions.map(option => (
                  <label
                    key={option}
                    className="flex items-center gap-3 p-4 rounded-lg border border-border/50 hover:border-primary/30 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.channels.includes(option)}
                      onChange={(e) => handleCheckboxChange('channels', option)}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-sm text-foreground">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Budget & Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-400" />
              Budget & Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Monthly Budget (Rp) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                  <input
                    type="text"
                    value={formData.budget ? formData.budget.replace(/[^0-9]/g, '') : ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '')
                      handleInputChange('budget', value)
                    }}
                    className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground transition-colors"
                    placeholder="5.000.000"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Masukkan budget marketing bulanan Anda</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Project Timeline *</label>
                <select
                  value={formData.timeline}
                  onChange={(e) => handleInputChange('timeline', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground transition-colors"
                  required
                >
                  <option value="">Select timeline</option>
                  {timelineOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Target Audience</label>
                <textarea
                  value={formData.targetAudience}
                  onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground transition-colors resize-none"
                  rows={3}
                  placeholder="Describe your target audience..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Competitors</label>
                <textarea
                  value={formData.competitors}
                  onChange={(e) => handleInputChange('competitors', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground transition-colors resize-none"
                  rows={3}
                  placeholder="Who are your main competitors?"
                />
              </div>
            </div>
          </div>

          {/* Services Needed */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-cyan-400" />
              Services Needed
            </h3>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Layanan yang Anda Butuhkan *</label>
              <textarea
                value={formData.servicesNeeded}
                onChange={(e) => handleInputChange('servicesNeeded', e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground transition-colors resize-none"
                rows={4}
                placeholder={`Contoh:
• Social Media Management untuk Instagram & TikTok
• Content Production (4 reels + 8 feed posts per bulan)
• Paid Ads di Meta & Google
• Influencer Marketing campaign`}
                required
              />
              <p className="text-xs text-muted-foreground mt-2">Sebutkan semua layanan yang Anda butuhkan (gunakan bullet points untuk lebih jelas)</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <User className="h-5 w-5 text-pink-400" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Full Name *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground transition-colors"
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Company Role *</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground transition-colors"
                  placeholder="e.g., Founder, Marketing Manager"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground transition-colors"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Phone / WhatsApp *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground transition-colors"
                  placeholder="08123456789"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.05]">
            <Button type="button" variant="outline" onClick={onClose} className="bg-white/[0.03] border-white/[0.08]">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-blue-500 hover:bg-blue-600 text-white">
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Add Lead
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
