"use client"

import React, { useState, useEffect, useCallback } from "react"
import { 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatCompactIDR } from "@/lib/format-currency"

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

export default function CRMDashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLeads = useCallback(async () => {
    try {
      const response = await fetch('/api/crm/leads')
      const data = await response.json()
      console.log('CRM API Response:', data)
      if (data.success) {
        setLeads(data.leads || [])
        console.log('Leads loaded:', data.leads?.length || 0)
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

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.leadstatus === "New").length,
    discovery: leads.filter(l => l.leadstatus === "Discovery Call").length,
    active: leads.filter(l => ["Contacted", "Discovery Call", "Proposal Sent", "Negotiation"].includes(l.leadstatus)).length,
    won: leads.filter(l => l.leadstatus === "Closed Won").length,
    lost: leads.filter(l => l.leadstatus === "Closed Lost").length,
    totalValue: leads
      .filter(l => l.leadstatus === "Closed Won")
      .reduce((acc, lead) => {
        const budgetStr = String(lead.budget || '')
        const budget = parseInt(budgetStr.replace(/[^0-9]/g, '')) || 0
        return acc + budget
      }, 0),
  }

  const conversionRate = stats.total > 0 ? ((stats.won / stats.total) * 100).toFixed(1) : "0"

  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)

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
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of your leads and conversions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchLeads} className="gap-2 bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Link href="/crm/leads">
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white gap-2">
              <Users className="h-4 w-4" />
              View All Leads
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
          icon={Eye}
          label="Discovery"
          value={stats.discovery.toString()}
          trendColor="purple"
        />
        <StatCard
          icon={TrendingUp}
          label="Active"
          value={stats.active.toString()}
          trendColor="cyan"
        />
        <StatCard
          icon={CheckCircle}
          label="Won"
          value={stats.won.toString()}
          trendColor="green"
        />
        <StatCard
          icon={DollarSign}
          label="Revenue"
          value={formatCompactIDR(stats.totalValue)}
          trendColor="green"
        />
      </div>

      {/* Conversion & Pipeline Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Conversion Rate</h3>
              <p className="text-sm text-muted-foreground mt-1">Lead to client conversion</p>
            </div>
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-white">{conversionRate}%</span>
            <div className="flex items-center gap-1 text-sm text-green-400 mb-1">
              <ArrowUpRight className="h-4 w-4" />
              <span>This month</span>
            </div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-white/[0.05] overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
              style={{ width: `${conversionRate}%` }}
            />
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Pipeline Value</h3>
              <p className="text-sm text-muted-foreground mt-1">Active deals in pipeline</p>
            </div>
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center">
              <DollarSign className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-white">
              {formatCompactIDR(
                leads.filter(l => ["Contacted", "Discovery Call", "Proposal Sent", "Negotiation"].includes(l.leadstatus))
                  .reduce((acc, lead) => {
                    const budgetStr = String(lead.budget || '')
                    const budget = parseInt(budgetStr.replace(/[^0-9]/g, '')) || 50000000
                    return acc + budget
                  }, 0)
              )}
            </span>
            <span className="text-sm text-muted-foreground mb-1">estimated</span>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Active Deals</span>
                <span className="text-white font-medium">{stats.active}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(stats.active / Math.max(stats.total, 1)) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Leads Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/[0.05]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Recent Leads</h3>
              <p className="text-sm text-muted-foreground mt-1">Latest inquiries from your website</p>
            </div>
            <Link href="/crm/leads">
              <Button variant="outline" size="sm" className="gap-2 bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Brand</th>
                <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact</th>
                <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Service</th>
                <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Budget</th>
                <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.map((lead, index) => (
                <tr 
                  key={index} 
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/[0.08] flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-400">{lead.brandname?.charAt(0) || "B"}</span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{lead.brandname || "N/A"}</p>
                        <p className="text-xs text-muted-foreground">{lead.industry}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <p className="text-sm text-white">{lead.fullname}</p>
                      <p className="text-xs text-muted-foreground">{lead.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {lead.servicesneeded?.split(",").slice(0, 2).map((service: string, i: number) => (
                        <span key={i} className="text-xs px-2 py-1 rounded bg-white/[0.05] text-muted-foreground">
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
                    <span className="text-sm text-white font-medium">{lead.budget || "N/A"}</span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-3 py-1.5 rounded-full border ${statusColors[lead.leadstatus] || statusColors["New"]}`}>
                      {lead.leadstatus || "New"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">
                      {new Date(lead.timestamp).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {recentLeads.length === 0 && (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No leads yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, trend, trendColor }: any) {
  return (
    <div className="glass-card p-4 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.08] flex items-center justify-center">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${
            trendColor === "green" ? "text-green-400" : 
            trendColor === "red" ? "text-red-400" : 
            trendColor === "blue" ? "text-blue-400" :
            trendColor === "purple" ? "text-purple-400" :
            trendColor === "cyan" ? "text-cyan-400" :
            "text-muted-foreground"
          }`}>
            {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : 
             trend === "down" ? <ArrowDownRight className="h-3 w-3" /> : 
             <ArrowUpRight className="h-3 w-3" />}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  )
}
