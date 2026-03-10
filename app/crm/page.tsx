"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Briefcase, Target, DollarSign, Award, ArrowRight } from "lucide-react"
import { formatIDR } from "@/lib/format-currency"

interface Lead {
  leadstatus: string
  budget: string | number
  timestamp: string
  brandname: string
  fullname: string
  email: string
  servicesneeded: string
}

interface Stats {
  newLeads: number
  negotiation: number
  wonDeals: number
  revenue: number
  conversionRate: number
  pipelineValue: number
}

export default function CRMDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    newLeads: 0,
    negotiation: 0,
    wonDeals: 0,
    revenue: 0,
    conversionRate: 0,
    pipelineValue: 0
  })
  const [recentLeads, setRecentLeads] = useState<Lead[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/crm/leads')
        const data = await response.json()
        
        if (data.success && data.leads) {
          const leads: Lead[] = data.leads
          
          const newLeads = leads.filter((l: Lead) => l.leadstatus === 'New')
          const negotiation = leads.filter((l: Lead) => l.leadstatus === 'Negotiation')
          const won = leads.filter((l: Lead) => l.leadstatus === 'Closed Won')
          
          const revenue = won.reduce((sum: number, l: Lead) => {
            const budget = typeof l.budget === 'string' 
              ? parseInt(l.budget.replace(/[^0-9]/g, '')) || 0
              : (l.budget as number) || 0
            return sum + budget
          }, 0)
          
          const pipelineValue = leads
            .filter((l: Lead) => ['New', 'Contacted', 'Discovery Call', 'Proposal Sent', 'Negotiation'].includes(l.leadstatus))
            .reduce((sum: number, l: Lead) => {
              const budget = typeof l.budget === 'string' 
                ? parseInt(l.budget.replace(/[^0-9]/g, '')) || 0
                : (l.budget as number) || 0
              return sum + budget
            }, 0)
          
          const conversionRate = leads.length > 0 
            ? (won.length / leads.length) * 100
            : 0
          
          setStats({
            newLeads: newLeads.length,
            negotiation: negotiation.length,
            wonDeals: won.length,
            revenue,
            conversionRate,
            pipelineValue
          })
          
          setRecentLeads(leads.slice(-5).reverse())
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Metrics Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={Briefcase}
            value={stats.newLeads}
            label="New Leads"
          />
          <MetricCard
            icon={Target}
            value={stats.negotiation}
            label="Negotiation"
          />
          <MetricCard
            icon={Award}
            value={stats.wonDeals}
            label="Won Deals"
          />
          <MetricCard
            icon={DollarSign}
            value={formatIDR(stats.revenue)}
            label="Revenue"
          />
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Conversion Rate */}
          <div className="glass-card p-6 rounded-xl border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Conversion Rate</h3>
                <p className="text-xs text-muted-foreground">Lead to client conversion</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-3xl font-bold text-white mb-2">{stats.conversionRate.toFixed(1)}%</p>
              <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                  style={{ width: `${Math.min(stats.conversionRate, 100)}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {stats.wonDeals} leads converted
            </p>
          </div>

          {/* Pipeline Value */}
          <div className="glass-card p-6 rounded-xl border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Pipeline Value</h3>
                <p className="text-xs text-muted-foreground">Active deals in pipeline</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-3xl font-bold text-white mb-2">{formatIDR(stats.pipelineValue)}</p>
              <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                  style={{ width: `${Math.min((stats.pipelineValue / Math.max(stats.revenue, 1)) * 100, 100)}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Total pipeline value
            </p>
          </div>
        </div>

        {/* Recent Leads Section */}
        <div className="glass-card rounded-xl border border-white/[0.08]">
          <div className="p-6 border-b border-white/[0.08]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Recent Leads</h3>
                <p className="text-xs text-muted-foreground">Latest inquiries from your website</p>
              </div>
              <Link href="/crm/leads" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Brand</th>
                  <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact</th>
                  <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Service</th>
                  <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Budget</th>
                  <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.length > 0 ? (
                  recentLeads.map((lead, i) => (
                    <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <p className="text-sm font-medium text-white">{lead.brandname || 'N/A'}</p>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="text-sm text-white">{lead.fullname || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">{lead.email || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {lead.servicesneeded || 'N/A'}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-white">
                          {typeof lead.budget === 'string' 
                            ? formatIDR(parseInt(lead.budget.replace(/[^0-9]/g, '')) || 0)
                            : formatIDR((lead.budget as number) || 0)
                          }
                        </p>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={lead.leadstatus} />
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-muted-foreground">
                          {new Date(lead.timestamp).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No recent leads
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ icon: Icon, value, label }: any) {
  const valueStr = String(value)
  const isLongValue = valueStr.length > 10

  return (
    <div className="glass-card p-4 rounded-xl border border-white/[0.08]">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-white/[0.03] flex items-center justify-center flex-shrink-0">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <p className={`font-bold text-white mb-1 ${isLongValue ? 'text-lg' : 'text-2xl'} break-words`}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground truncate">{label}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const statusColors: Record<string, string> = {
    'New': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Contacted': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'Discovery Call': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'Proposal Sent': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'Negotiation': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    'Closed Won': 'bg-green-500/10 text-green-400 border-green-500/20',
    'Closed Lost': 'bg-red-500/10 text-red-400 border-red-500/20'
  }

  return (
    <span className={`text-xs px-3 py-1.5 rounded-full border ${statusColors[status] || 'bg-white/[0.05] text-white border-white/[0.08]'}`}>
      {status}
    </span>
  )
}
