"use client"

import React, { useState, useEffect, useCallback } from "react"
import { 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  ChevronUp,
  ChevronDown,
  X,
  Mail,
  Phone,
  Building2,
  Globe,
  DollarSign,
  Calendar,
  Tag,
  User,
  Briefcase,
  MessageSquare,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Edit2,
  Save,
  Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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
  "New": "bg-blue-500/10 text-blue-500 border-blue-500/30",
  "Contacted": "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  "Discovery Call": "bg-purple-500/10 text-purple-500 border-purple-500/30",
  "Proposal Sent": "bg-orange-500/10 text-orange-500 border-orange-500/30",
  "Negotiation": "bg-pink-500/10 text-pink-500 border-pink-500/30",
  "Closed Won": "bg-green-500/10 text-green-500 border-green-500/30",
  "Closed Lost": "bg-red-500/10 text-red-500 border-red-500/30",
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

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<keyof Lead>("timestamp")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [editingStatus, setEditingStatus] = useState<string | null>(null)
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [tempStatus, setTempStatus] = useState("")
  const [tempNotes, setTempNotes] = useState("")
  const [saving, setSaving] = useState(false)

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
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLeads, 30000)
    return () => clearInterval(interval)
  }, [fetchLeads])

  const updateLeadStatus = async (email: string, newStatus: string) => {
    setSaving(true)
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
        setEditingStatus(null)
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateLeadNotes = async (email: string, newNotes: string) => {
    setSaving(true)
    try {
      const response = await fetch('/api/crm/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          updates: { notes: newNotes }
        }),
      })
      
      if (response.ok) {
        await fetchLeads()
        setEditingNotes(null)
      }
    } catch (error) {
      console.error('Failed to update notes:', error)
    } finally {
      setSaving(false)
    }
  }

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

  // Stats calculations
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.leadstatus === "New").length,
    active: leads.filter(l => ["Contacted", "Discovery Call", "Proposal Sent", "Negotiation"].includes(l.leadstatus)).length,
    won: leads.filter(l => l.leadstatus === "Closed Won").length,
    lost: leads.filter(l => l.leadstatus === "Closed Lost").length,
  }

  const conversionRate = stats.total > 0 ? ((stats.won / stats.total) * 100).toFixed(1) : "0"

  const exportToCSV = () => {
    const headers = ["Timestamp", "Brand", "Email", "Phone", "Industry", "Budget", "Status", "Services", "Notes"]
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
        lead.servicesneeded,
        lead.notes?.replace(/,/g, ";") || ""
      ].join(","))
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading CRM...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">CRM Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage your leads and track conversions</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={fetchLeads} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Link href="/">
                <Button variant="outline" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            icon={Users}
            label="Total Leads"
            value={stats.total.toString()}
            trend={null}
          />
          <StatCard
            icon={Clock}
            label="New"
            value={stats.new.toString()}
            trendColor="blue"
          />
          <StatCard
            icon={MessageSquare}
            label="Active"
            value={stats.active.toString()}
            trendColor="purple"
          />
          <StatCard
            icon={CheckCircle}
            label="Won"
            value={stats.won.toString()}
            trendColor="green"
          />
          <StatCard
            icon={X}
            label="Lost"
            value={stats.lost.toString()}
            trendColor="red"
          />
          <StatCard
            icon={TrendingUp}
            label="Conversion"
            value={`${conversionRate}%`}
            trend={conversionRate !== "0" ? "up" : null}
            trendColor="green"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by brand, email, name, or industry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground text-sm min-w-[200px]"
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
                <tr className="border-b border-border/50">
                  <TableHeader label="Brand" field="brandname" sort={handleSort} currentSort={sortField} />
                  <TableHeader label="Contact" field="fullname" sort={handleSort} currentSort={sortField} />
                  <TableHeader label="Industry" field="industry" sort={handleSort} currentSort={sortField} />
                  <TableHeader label="Budget" field="budget" sort={handleSort} currentSort={sortField} />
                  <TableHeader label="Services" />
                  <TableHeader label="Timeline" field="timeline" sort={handleSort} currentSort={sortField} />
                  <TableHeader label="Status" field="leadstatus" sort={handleSort} currentSort={sortField} />
                  <TableHeader label="Notes" />
                  <TableHeader label="Created" field="timestamp" sort={handleSort} currentSort={sortField} />
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead, index) => (
                  <tr 
                    key={index} 
                    className="border-b border-border/30 hover:bg-white/[0.02] transition-colors"
                    onClick={() => setSelectedLead(selectedLead?.email === lead.email ? null : lead)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{lead.brandname || "N/A"}</p>
                          {lead.website && (
                            <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {lead.website.replace(/^https?:\/\//, '')}
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <User className="h-3 w-3 text-muted-foreground" />
                          {lead.fullname}
                        </div>
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
                        <p className="text-sm text-foreground">{lead.industry}</p>
                        <p className="text-xs text-muted-foreground">{lead.targetmarket}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{lead.budget || "N/A"}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {lead.servicesneeded?.split(",").slice(0, 2).map((service: string, i: number) => (
                          <span key={i} className="text-xs px-2 py-1 rounded bg-white/5 text-muted-foreground truncate">
                            {service.trim()}
                          </span>
                        ))}
                        {lead.servicesneeded?.split(",").length > 2 && (
                          <span className="text-xs px-2 py-1 rounded bg-white/5 text-muted-foreground">
                            +{lead.servicesneeded.split(",").length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{lead.timeline || "N/A"}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {editingStatus === lead.email ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={tempStatus}
                            onChange={(e) => setTempStatus(e.target.value)}
                            className="text-xs px-2 py-1 rounded bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground"
                            autoFocus
                          >
                            {statusOptions.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => updateLeadStatus(lead.email, tempStatus)}
                            disabled={saving}
                            className="p-1 hover:bg-white/10 rounded"
                          >
                            <Save className="h-3 w-3 text-primary" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group">
                          <span className={`text-xs px-3 py-1 rounded-full border ${statusColors[lead.leadstatus] || statusColors["New"]}`}>
                            {lead.leadstatus || "New"}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingStatus(lead.email)
                              setTempStatus(lead.leadstatus || "New")
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-opacity"
                          >
                            <Edit2 className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {editingNotes === lead.email ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={tempNotes}
                            onChange={(e) => setTempNotes(e.target.value)}
                            className="text-xs px-2 py-1 rounded bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground w-40"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                updateLeadNotes(lead.email, tempNotes)
                              }
                            }}
                          />
                          <button
                            onClick={() => updateLeadNotes(lead.email, tempNotes)}
                            disabled={saving}
                            className="p-1 hover:bg-white/10 rounded"
                          >
                            <Save className="h-3 w-3 text-primary" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group">
                          <span className="text-xs text-muted-foreground max-w-[150px] truncate">
                            {lead.notes || "Add note..."}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingNotes(lead.email)
                              setTempNotes(lead.notes || "")
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-opacity"
                          >
                            <Edit2 className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {lead.timestamp ? new Date(lead.timestamp).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : "N/A"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredLeads.length === 0 && (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
      </main>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, trend, trendColor }: any) {
  return (
    <div className="glass-card p-4 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${
            trendColor === "green" ? "text-green-500" : 
            trendColor === "red" ? "text-red-500" : 
            trendColor === "blue" ? "text-blue-500" :
            trendColor === "purple" ? "text-purple-500" :
            "text-muted-foreground"
          }`}>
            {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : 
             trend === "down" ? <ArrowDownRight className="h-3 w-3" /> : 
             <Minus className="h-3 w-3" />}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  )
}

function TableHeader({ label, field, sort, currentSort }: any) {
  return (
    <th 
      className={`p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider ${field ? 'cursor-pointer hover:text-foreground transition-colors' : ''}`}
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
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border/50 bg-background">
          <h2 className="text-xl font-bold text-foreground">Lead Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Brand Info */}
          <section>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Brand Information</h3>
            <div className="space-y-3">
              <InfoRow icon={Building2} label="Brand Name" value={lead.brandname} />
              {lead.website && <InfoRow icon={Globe} label="Website" value={lead.website} isLink />}
              <InfoRow icon={Tag} label="Industry" value={lead.industry} />
              <InfoRow icon={Target} label="Target Market" value={lead.targetmarket} />
              <InfoRow icon={Calendar} label="Founded" value={lead.yearfounded} />
              <InfoRow icon={Users} label="Team Size" value={lead.teamsize} />
            </div>
          </section>

          {/* Contact Info */}
          <section>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Contact Information</h3>
            <div className="space-y-3">
              <InfoRow icon={User} label="Name" value={lead.fullname} />
              <InfoRow icon={Briefcase} label="Role" value={lead.role} />
              <InfoRow icon={Mail} label="Email" value={lead.email} isLink={`mailto:${lead.email}`} />
              <InfoRow icon={Phone} label="Phone" value={lead.phone} isLink={`tel:${lead.phone}`} />
            </div>
          </section>

          {/* Business Goals */}
          <section>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Business Goals</h3>
            <div className="space-y-3">
              <InfoRow icon={Target} label="Primary Goal" value={lead.primarygoal} />
              <InfoRow icon={BarChart3} label="Current Ads" value={lead.runads} />
              <InfoRow icon={DollarSign} label="Budget" value={lead.budget} />
              <InfoRow icon={Clock} label="Timeline" value={lead.timeline} />
            </div>
          </section>

          {/* Services */}
          <section>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Services Needed</h3>
            <div className="flex flex-wrap gap-2">
              {lead.servicesneeded?.split(",").map((service: string, i: number) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                  {service.trim()}
                </span>
              ))}
            </div>
          </section>

          {/* Additional Info */}
          {lead.targetaudience && (
            <section>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Target Audience</h3>
              <p className="text-sm text-foreground">{lead.targetaudience}</p>
            </section>
          )}

          {lead.competitors && (
            <section>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Competitors</h3>
              <p className="text-sm text-foreground">{lead.competitors}</p>
            </section>
          )}

          {lead.channels && (
            <section>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Current Channels</h3>
              <div className="flex flex-wrap gap-2">
                {lead.channels.split(",").map((channel: string, i: number) => (
                  <span key={i} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-muted-foreground">
                    {channel.trim()}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Status */}
          <section className="pt-4 border-t border-border/50">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Current Status</h3>
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
          <a href={typeof isLink === "string" ? isLink : value} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
            {value}
          </a>
        ) : (
          <p className="text-sm text-foreground">{value}</p>
        )}
      </div>
    </div>
  )
}
