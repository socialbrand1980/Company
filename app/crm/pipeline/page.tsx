"use client"

import React, { useState, useEffect, useCallback } from "react"
import { 
  Plus, 
  MoreHorizontal, 
  Calendar, 
  DollarSign, 
  User,
  Building2,
  RefreshCw,
  Search
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface Lead {
  timestamp: string
  brandname: string
  website: string
  industry: string
  budget: string
  servicesneeded: string
  fullname: string
  email: string
  phone: string
  leadstatus: string
}

const pipelineStages = [
  { id: "New", color: "bg-blue-500", borderColor: "border-blue-500/20" },
  { id: "Contacted", color: "bg-yellow-500", borderColor: "border-yellow-500/20" },
  { id: "Discovery Call", color: "bg-purple-500", borderColor: "border-purple-500/20" },
  { id: "Proposal Sent", color: "bg-orange-500", borderColor: "border-orange-500/20" },
  { id: "Negotiation", color: "bg-pink-500", borderColor: "border-pink-500/20" },
  { id: "Closed Won", color: "bg-green-500", borderColor: "border-green-500/20" },
  { id: "Closed Lost", color: "bg-red-500", borderColor: "border-red-500/20" },
]

export default function CRMPipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [draggedLead, setDraggedLead] = useState<string | null>(null)

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
  }, [fetchLeads])

  const filteredLeads = leads.filter(lead =>
    lead.brandname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.fullname?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getLeadsByStatus = (status: string) => 
    filteredLeads.filter(lead => lead.leadstatus === status)

  const handleDragStart = (e: React.DragEvent, email: string) => {
    e.dataTransfer.setData('email', email)
    setDraggedLead(email)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    const email = e.dataTransfer.getData('email')
    // Update lead status logic here
    setDraggedLead(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-1">Track deals through your sales funnel</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchLeads} className="gap-2 bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white gap-2">
            <Plus className="h-4 w-4" />
            Add Deal
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search deals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] focus:border-blue-500/50 focus:outline-none text-foreground text-sm transition-colors"
        />
      </div>

      {/* Pipeline Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {pipelineStages.map((stage) => {
          const stageLeads = getLeadsByStatus(stage.id)
          const totalValue = stageLeads.reduce((acc, lead) => {
            const budget = lead.budget?.replace(/[^0-9]/g, '')
            return acc + (budget ? parseInt(budget) : 50000000)
          }, 0)

          return (
            <div
              key={stage.id}
              className={`flex-shrink-0 w-80 rounded-xl bg-white/[0.02] border ${stage.borderColor} overflow-hidden`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* Stage Header */}
              <div className="p-4 border-b border-white/[0.05]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                    <h3 className="font-semibold text-white text-sm">{stage.id}</h3>
                  </div>
                  <span className="text-xs text-muted-foreground bg-white/[0.05] px-2 py-1 rounded-full">
                    {stageLeads.length}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Rp {(totalValue / 1000000).toFixed(1)}M
                </p>
              </div>

              {/* Cards */}
              <div className="p-3 space-y-3 min-h-[200px]">
                {stageLeads.map((lead) => (
                  <div
                    key={lead.email}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.email)}
                    className={`glass-card p-4 rounded-lg cursor-move hover:bg-white/[0.05] transition-all ${
                      draggedLead === lead.email ? 'opacity-50 scale-95' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/[0.08] flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{lead.brandname}</p>
                          <p className="text-xs text-muted-foreground">{lead.industry}</p>
                        </div>
                      </div>
                      <button className="p-1 hover:bg-white/5 rounded transition-colors">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        <span className="text-white font-medium">{lead.budget || "N/A"}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{lead.fullname}</span>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-2">
                        {lead.servicesneeded?.split(",").slice(0, 2).map((service: string, i: number) => (
                          <span key={i} className="text-xs px-2 py-1 rounded bg-white/[0.05] text-muted-foreground truncate">
                            {service.trim()}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-white/[0.05]">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(lead.timestamp).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {stageLeads.length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-xs text-muted-foreground">No deals</p>
                  </div>
                )}
              </div>

              {/* Add Card Button */}
              <div className="p-3 border-t border-white/[0.05]">
                <button className="w-full py-2 text-xs text-muted-foreground hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Plus className="h-3 w-3" />
                  Add Deal
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
