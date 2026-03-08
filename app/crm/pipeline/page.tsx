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
  Search,
  GripVertical,
  Edit2,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCompactIDR, formatIDR } from "@/lib/format-currency"

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
      // Extract: year, month, day, hour, minute, second
      const match = timestamp.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/)
      if (match) {
        const [, year, month, day, hour, minute, second] = match
        // Google Sheets Date() uses 0-indexed month like JS (0=January, 11=December)
        // So Date(2026,2,8,...) means March 8, 2026 (month 2 = March)
        // We use the month value directly in Date.UTC
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
      
      // Handle ISO format (from API submissions) - CHECK FIRST
      if (dateStr.includes('T') && dateStr.includes('Z')) {
        date = new Date(dateStr)
      }
      // Handle ISO format without Z
      else if (dateStr.includes('T')) {
        date = new Date(dateStr)
      }
      // Handle Google Sheets format: DD/MM/YYYY HH:MM:SS
      else if (dateStr.includes('/') && dateStr.includes(':')) {
        const parts = dateStr.split(' ')
        const datePart = parts[0] // DD/MM/YYYY
        const [day, month, year] = datePart.split('/')
        // Create date with explicit month (1-indexed in Google Sheets)
        // Use UTC to avoid timezone issues
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
      // Handle YYYY-MM-DD or DD-MM-YYYY
      else if (dateStr.includes('-')) {
        const parts = dateStr.split('-')
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            date = new Date(dateStr)
          } else {
            date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
          }
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
  budget: string
  servicesneeded: string
  fullname: string
  email: string
  phone: string
  leadstatus: string
  notes: string
  targetaudience: string
  competitors: string
  timeline: string
  teamsize: string
  yearfounded: string
  targetmarket: string
  primarygoal: string
  runads: string
  channels: string
}

const pipelineStages = [
  { id: "New", color: "bg-blue-500", borderColor: "border-blue-500/20", bgColor: "bg-blue-500/5" },
  { id: "Contacted", color: "bg-yellow-500", borderColor: "border-yellow-500/20", bgColor: "bg-yellow-500/5" },
  { id: "Discovery Call", color: "bg-purple-500", borderColor: "border-purple-500/20", bgColor: "bg-purple-500/5" },
  { id: "Proposal Sent", color: "bg-orange-500", borderColor: "border-orange-500/20", bgColor: "bg-orange-500/5" },
  { id: "Negotiation", color: "bg-pink-500", borderColor: "border-pink-500/20", bgColor: "bg-pink-500/5" },
  { id: "Closed Won", color: "bg-green-500", borderColor: "border-green-500/20", bgColor: "bg-green-500/5" },
  { id: "Closed Lost", color: "bg-red-500", borderColor: "border-red-500/20", bgColor: "bg-red-500/5" },
]

export default function CRMPipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [draggedLead, setDraggedLead] = useState<string | null>(null)
  const [dragOverStage, setDragOverStage] = useState<string | null>(null)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [updatingEmail, setUpdatingEmail] = useState<string | null>(null)

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
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverStage(stageId)
  }

  const handleDragLeave = () => {
    setDragOverStage(null)
  }

  const handleDrop = async (e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    setDragOverStage(null)
    const email = e.dataTransfer.getData('email')
    
    if (email) {
      setUpdatingEmail(email)
      try {
        const response = await fetch('/api/crm/leads', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            updates: { leadStatus: stageId }
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
        setDraggedLead(null)
      }
    }
  }

  const handleDragEnd = () => {
    setDraggedLead(null)
    setDragOverStage(null)
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
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-250px)]">
        {pipelineStages.map((stage) => {
          const stageLeads = getLeadsByStatus(stage.id)
          const totalValue = stageLeads.reduce((acc, lead) => {
            let budget: number
            if (typeof lead.budget === 'number') {
              budget = lead.budget
            } else {
              const budgetStr = String(lead.budget || '')
              budget = parseInt(budgetStr.replace(/[^0-9]/g, '')) || 50000000
            }
            return acc + budget
          }, 0)

          return (
            <div
              key={stage.id}
              className={`flex-shrink-0 w-80 rounded-xl bg-white/[0.02] border ${stage.borderColor} overflow-hidden transition-colors ${
                dragOverStage === stage.id ? 'bg-white/[0.05] border-blue-500/40' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* Stage Header */}
              <div className={`p-4 border-b border-white/[0.05] ${stage.bgColor}`}>
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
                  {formatCompactIDR(totalValue)}
                </p>
              </div>

              {/* Cards */}
              <div className="p-3 space-y-3 min-h-[200px]">
                {stageLeads.map((lead, index) => (
                  <div
                    key={`${lead.email}-${lead.timestamp}-${index}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.email)}
                    onDragEnd={handleDragEnd}
                    className={`glass-card p-4 rounded-lg cursor-grab active:cursor-grabbing hover:bg-white/[0.05] transition-all ${
                      draggedLead === lead.email ? 'opacity-50 scale-95' : ''
                    } ${updatingEmail === lead.email ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-1">
                        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-4 w-4 text-blue-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-white text-sm truncate">{lead.brandname}</p>
                          <p className="text-xs text-muted-foreground truncate">{lead.industry}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => setEditingLead(lead)}
                          className="p-1 hover:bg-white/5 rounded transition-colors"
                        >
                          <Edit2 className="h-3 w-3 text-muted-foreground" />
                        </button>
                        <button className="p-1 hover:bg-white/5 rounded transition-colors">
                          <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        <span className="text-white font-medium">
                          {lead.budget !== undefined && lead.budget !== null && lead.budget !== '' ? formatIDR(lead.budget) : "N/A"}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span className="truncate">{lead.fullname}</span>
                      </div>

                      {lead.primarygoal && (
                        <div className="pt-2 mt-2 border-t border-white/[0.05]">
                          <p className="text-xs text-muted-foreground line-clamp-2" title={lead.primarygoal}>
                            {lead.primarygoal}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1 pt-2">
                        {lead.servicesneeded?.split(",").slice(0, 2).map((service: string, i: number) => (
                          <span key={i} className="text-xs px-2 py-1 rounded bg-white/[0.05] text-muted-foreground truncate">
                            {service.trim()}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-white/[0.05]">
                        <Calendar className="h-3 w-3" />
                        <span>{formatTimestamp(lead.timestamp)}</span>
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

      {/* Edit Lead Modal */}
      {editingLead && (
        <EditLeadModal
          lead={editingLead}
          onClose={() => setEditingLead(null)}
          onSave={updateLead}
          saving={updatingEmail === editingLead.email}
        />
      )}
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
                {pipelineStages.map(stage => (
                  <option key={stage.id} value={stage.id}>{stage.id}</option>
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
