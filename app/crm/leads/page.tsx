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
  Eye,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Building2,
  DollarSign,
  Calendar,
  Tag,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatIDR } from "@/lib/format-currency"

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
                <th className="p-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
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
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-white font-medium">{lead.budget ? formatIDR(String(lead.budget)) : "N/A"}</span>
                    </div>
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
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                          const phone = lead.phone?.replace(/[^0-9]/g, '') || '62811198093'
                          const brandName = lead.brandname || lead.fullname || 'Customer'
                          const industry = lead.industry || 'their industry'
                          const goal = lead.primarygoal ? ` dengan tujuan: ${lead.primarygoal.substring(0, 100)}${lead.primarygoal.length > 100 ? '...' : ''}` : ''
                          
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

      {/* Lead Detail Panel */}
      {selectedLead && (
        <LeadDetailPanel 
          lead={selectedLead} 
          onClose={() => setSelectedLead(null)} 
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

function LeadDetailPanel({ lead, onClose }: { lead: Lead, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass-card overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-white/[0.05] bg-[#0a0a0f]">
          <h2 className="text-xl font-bold text-white">Lead Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Brand Info */}
          <section>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Brand Information</h3>
            <div className="space-y-3">
              <InfoRow icon={Building2} label="Brand Name" value={lead.brandname} />
              {lead.website && <InfoRow icon={Tag} label="Website" value={lead.website} isLink />}
              <InfoRow icon={Tag} label="Industry" value={lead.industry} />
              <InfoRow icon={Tag} label="Target Market" value={lead.targetmarket} />
            </div>
          </section>

          {/* Contact Info */}
          <section>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Contact Information</h3>
            <div className="space-y-3">
              <InfoRow icon={Tag} label="Name" value={lead.fullname} />
              <InfoRow icon={Tag} label="Email" value={lead.email} isLink={`mailto:${lead.email}`} />
              <InfoRow icon={Tag} label="Phone" value={lead.phone} isLink={`tel:${lead.phone}`} />
              <InfoRow icon={Tag} label="Role" value={lead.role} />
            </div>
          </section>

          {/* Business */}
          <section>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Business</h3>
            <div className="space-y-3">
              <InfoRow icon={Tag} label="Budget" value={lead.budget} />
              <InfoRow icon={Tag} label="Timeline" value={lead.timeline} />
            </div>
          </section>

          {/* Status */}
          <section className="pt-4 border-t border-white/[0.05]">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Status</h3>
            <span className={`text-sm px-3 py-1.5 rounded-lg border ${statusColors[lead.leadstatus] || statusColors["New"]}`}>
              {lead.leadstatus || "New"}
            </span>
          </section>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, isLink }: any) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        {isLink ? (
          <a href={typeof isLink === "string" ? isLink : value} className="text-sm text-blue-400 hover:underline">
            {value}
          </a>
        ) : (
          <p className="text-sm text-white">{value}</p>
        )}
      </div>
    </div>
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
