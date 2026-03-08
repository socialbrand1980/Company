"use client"

import React, { useState, useEffect } from "react"
import { TrendingUp, Users, DollarSign, Target, ArrowUpRight, ArrowDownRight, BarChart3, Download, Calendar, PieChart, Activity, ChartBar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatIDR } from "@/lib/format-currency"

interface Lead {
  leadstatus: string
  budget: string | number
  timestamp: string
  brandname: string
  industry: string
  email: string
}

interface FunnelData {
  stage: string
  count: number
  percentage: number
  color: string
}

interface MonthlyData {
  month: string
  year: number
  value: number
  count: number
  clients: string[]
}

export default function CRMAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [leads, setLeads] = useState<Lead[]>([])
  const [timeRange, setTimeRange] = useState<"6m" | "12m" | "all">("12m")
  const [viewMode, setViewMode] = useState<"daily" | "monthly" | "yearly">("monthly")
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])

  useEffect(() => {
    async function fetchLeads() {
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
    }
    fetchLeads()
  }, [])

  // Process revenue data based on view mode
  useEffect(() => {
    if (leads.length === 0) return

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const data: { [key: string]: MonthlyData } = {}

    leads.forEach((lead: Lead) => {
      if (lead.leadstatus !== 'Closed Won') return
      
      const date = new Date(lead.timestamp || Date.now())
      const year = date.getFullYear()
      const month = date.getMonth()
      const day = date.getDate()
      
      // Filter by selected year and month based on view mode
      if (viewMode === "yearly" && year !== selectedYear) return
      if (viewMode === "monthly" && (year !== selectedYear || month !== selectedMonth)) return
      
      let key: string
      let label: string
      
      if (viewMode === "daily") {
        key = `${year}-${month}-${day}`
        label = `${day} ${monthNames[month]}`
      } else if (viewMode === "monthly") {
        key = `${year}-${month}`
        label = monthNames[month]
      } else {
        key = `${year}`
        label = `${year}`
      }
      
      const budgetValue = typeof lead.budget === 'string' 
        ? parseInt(lead.budget.replace(/[^0-9]/g, '')) || 0
        : (lead.budget as number) || 0

      if (!data[key]) {
        data[key] = {
          month: label,
          year: year,
          value: 0,
          count: 0,
          clients: []
        }
      }

      data[key].value += budgetValue
      data[key].count += 1
      data[key].clients.push(lead.brandname || 'Unknown')
    })

    const sortedData = Object.values(data).sort((a, b) => {
      if (viewMode === "yearly") return a.year - b.year
      if (viewMode === "monthly") return a.year - b.year || monthNames.indexOf(a.month) - monthNames.indexOf(b.month)
      return a.year - b.year || monthNames.indexOf(a.month) - monthNames.indexOf(b.month)
    })

    setMonthlyData(sortedData)
  }, [leads, viewMode, selectedYear, selectedMonth])

  // Calculate stats
  const stats = {
    totalLeads: leads.length,
    newLeads: leads.filter((l: Lead) => l.leadstatus === 'New').length,
    contacted: leads.filter((l: Lead) => l.leadstatus === 'Contacted').length,
    discovery: leads.filter((l: Lead) => l.leadstatus === 'Discovery Call').length,
    proposal: leads.filter((l: Lead) => l.leadstatus === 'Proposal Sent').length,
    negotiation: leads.filter((l: Lead) => l.leadstatus === 'Negotiation').length,
    closedWon: leads.filter((l: Lead) => l.leadstatus === 'Closed Won').length,
    closedLost: leads.filter((l: Lead) => l.leadstatus === 'Closed Lost').length,
    totalRevenue: leads
      .filter((l: Lead) => l.leadstatus === 'Closed Won')
      .reduce((acc: number, l: Lead) => {
        const budgetValue = typeof l.budget === 'string' 
          ? parseInt(l.budget.replace(/[^0-9]/g, '')) || 0
          : (l.budget as number) || 0
        return acc + budgetValue
      }, 0),
    conversionRate: leads.length > 0 
      ? ((leads.filter((l: Lead) => l.leadstatus === 'Closed Won').length / leads.length) * 100).toFixed(1) 
      : "0",
    avgDealSize: leads.filter((l: Lead) => l.leadstatus === 'Closed Won').length > 0 
      ? leads
          .filter((l: Lead) => l.leadstatus === 'Closed Won')
          .reduce((acc: number, l: Lead) => {
            const budgetValue = typeof l.budget === 'string' 
              ? parseInt(l.budget.replace(/[^0-9]/g, '')) || 0
              : (l.budget as number) || 0
            return acc + budgetValue
          }, 0) / leads.filter((l: Lead) => l.leadstatus === 'Closed Won').length
      : 0
  }

  // Funnel data
  const funnelData: FunnelData[] = [
    { stage: "New Leads", count: stats.newLeads, percentage: 100, color: "bg-blue-500" },
    { stage: "Contacted", count: stats.contacted, percentage: stats.totalLeads > 0 ? (stats.contacted / stats.totalLeads) * 100 : 0, color: "bg-yellow-500" },
    { stage: "Discovery Call", count: stats.discovery, percentage: stats.totalLeads > 0 ? (stats.discovery / stats.totalLeads) * 100 : 0, color: "bg-purple-500" },
    { stage: "Proposal", count: stats.proposal, percentage: stats.totalLeads > 0 ? (stats.proposal / stats.totalLeads) * 100 : 0, color: "bg-orange-500" },
    { stage: "Negotiation", count: stats.negotiation, percentage: stats.totalLeads > 0 ? (stats.negotiation / stats.totalLeads) * 100 : 0, color: "bg-pink-500" },
    { stage: "Closed Won", count: stats.closedWon, percentage: stats.totalLeads > 0 ? (stats.closedWon / stats.totalLeads) * 100 : 0, color: "bg-green-500" }
  ]

  // Industry breakdown
  const industryBreakdown = leads.reduce((acc: any, lead: Lead) => {
    const industry = lead.industry || 'Other'
    if (!acc[industry]) acc[industry] = 0
    acc[industry]++
    return acc
  }, {})

  const exportData = () => {
    const headers = ['Stage', 'Count', 'Percentage']
    const rows = funnelData.map(data => [data.stage, data.count, `${data.percentage.toFixed(1)}%`])
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `crm-analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Complete insights from leads to closed deals</p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Mode Filter */}
            <div className="flex items-center gap-1 bg-white/[0.03] rounded-lg p-1">
              <button
                onClick={() => setViewMode("daily")}
                className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  viewMode === "daily"
                    ? "bg-blue-500 text-white"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setViewMode("monthly")}
                className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  viewMode === "monthly"
                    ? "bg-blue-500 text-white"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setViewMode("yearly")}
                className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  viewMode === "yearly"
                    ? "bg-blue-500 text-white"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                Yearly
              </button>
            </div>
            
            {/* Year Filter */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] focus:border-blue-500/50 focus:outline-none text-white text-sm"
            >
              {Array.from(new Set(leads.map((l: Lead) => new Date(l.timestamp || Date.now()).getFullYear()))).sort((a, b) => b - a).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            {/* Month Filter (only for daily view) */}
            {viewMode === "daily" && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] focus:border-blue-500/50 focus:outline-none text-white text-sm"
              >
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
                  <option key={i} value={i}>{month}</option>
                ))}
              </select>
            )}
            
            <Button variant="outline" size="sm" onClick={exportData} className="gap-2 bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard 
            icon={Users} 
            label="Total Leads" 
            value={stats.totalLeads.toString()} 
            subValue={`${stats.newLeads} new`}
          />
          <MetricCard 
            icon={Target} 
            label="Active Deals" 
            value={(stats.contacted + stats.discovery + stats.proposal + stats.negotiation).toString()} 
            subValue={`${stats.discovery} discovery`}
          />
          <MetricCard 
            icon={DollarSign} 
            label="Total Revenue" 
            value={formatIDR(stats.totalRevenue)} 
            subValue={`${stats.closedWon} deals`}
          />
          <MetricCard 
            icon={TrendingUp} 
            label="Conversion Rate" 
            value={`${stats.conversionRate}%`} 
            subValue={`Avg: ${formatIDR(stats.avgDealSize)}`}
          />
        </div>

        {/* Sales Funnel */}
        <div className="glass-card p-6 rounded-xl mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <ChartBar className="h-6 w-6 text-blue-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Sales Funnel</h3>
                <p className="text-sm text-muted-foreground mt-1">Lead progression through pipeline</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {funnelData.map((item, index) => (
              <div key={item.stage}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm text-white">{item.stage}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-white">{item.count} leads</span>
                    <span className="text-xs text-muted-foreground ml-2">({item.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
                <div className="h-3 rounded-full bg-white/[0.05] overflow-hidden">
                  <div
                    className={`h-full ${item.color} transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="glass-card p-6 rounded-xl mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-green-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Revenue Overview</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {viewMode === "daily" 
                    ? `Daily revenue for ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][selectedMonth]} ${selectedYear}`
                    : viewMode === "monthly"
                    ? `Monthly revenue for ${selectedYear}`
                    : `Yearly revenue overview`
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between gap-2 h-48">
            {monthlyData.length > 0 ? (
              monthlyData.map((data, index) => {
                const maxValue = Math.max(...monthlyData.map(d => d.value), 1)
                const height = (data.value / maxValue) * 100
                
                return (
                  <div key={`${data.month}-${data.year}-${index}`} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="relative w-full">
                      <div
                        className="w-full bg-gradient-to-t from-green-500/30 to-green-500 rounded-t-lg transition-all duration-500 hover:from-green-400/40 hover:to-green-400"
                        style={{ height: `${Math.max(height, 2)}%`, minHeight: '8px' }}
                      />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        <div className="glass-card rounded-lg p-3 min-w-[180px] shadow-xl">
                          <p className="text-xs font-medium text-white mb-1">{data.month} {data.year}</p>
                          <p className="text-sm font-bold text-green-400 mb-2">{formatIDR(data.value)}</p>
                          <p className="text-xs text-muted-foreground">{data.count} deal{data.count !== 1 ? 's' : ''}</p>
                          {data.clients.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">{data.clients.slice(0, 3).join(', ')}{data.clients.length > 3 ? ` +${data.clients.length - 3}` : ''}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{viewMode === "daily" ? data.month : data.month}</span>
                  </div>
                )
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-muted-foreground">No closed deals in this period</p>
              </div>
            )}
          </div>
        </div>

        {/* Status Distribution & Industry */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Status Distribution */}
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-6">
              <PieChart className="h-6 w-6 text-purple-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Lead Status Distribution</h3>
                <p className="text-sm text-muted-foreground mt-1">Current pipeline breakdown</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <StatusItem label="New" count={stats.newLeads} color="text-blue-400" />
              <StatusItem label="Contacted" count={stats.contacted} color="text-yellow-400" />
              <StatusItem label="Discovery" count={stats.discovery} color="text-purple-400" />
              <StatusItem label="Proposal" count={stats.proposal} color="text-orange-400" />
              <StatusItem label="Negotiation" count={stats.negotiation} color="text-pink-400" />
              <StatusItem label="Won" count={stats.closedWon} color="text-green-400" />
              <StatusItem label="Lost" count={stats.closedLost} color="text-red-400" />
            </div>
          </div>

          {/* Industry Breakdown */}
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-6">
              <Target className="h-6 w-6 text-cyan-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Industry Breakdown</h3>
                <p className="text-sm text-muted-foreground mt-1">Leads by industry</p>
              </div>
            </div>
            <div className="space-y-3">
              {Object.entries(industryBreakdown)
                .sort(([,a]: any, [,b]: any) => b - a)
                .slice(0, 5)
                .map(([industry, count]: [string, any], index) => (
                  <div key={industry}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white">{industry}</span>
                      <span className="text-sm text-muted-foreground">{count} leads</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        style={{ width: `${(count as number / stats.totalLeads) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-2">Avg. Deal Size</h3>
            <div className="text-2xl font-bold text-white mb-2">{formatIDR(stats.avgDealSize)}</div>
            <p className="text-xs text-muted-foreground">Average revenue per closed deal</p>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-2">Win Rate</h3>
            <div className="text-2xl font-bold text-green-400 mb-2">
              {stats.totalLeads > 0 ? ((stats.closedWon / stats.totalLeads) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Percentage of leads that close won</p>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-2">Total Pipeline Value</h3>
            <div className="text-2xl font-bold text-white mb-2">
              {formatIDR(
                leads
                  .filter((l: Lead) => ['New', 'Contacted', 'Discovery Call', 'Proposal Sent', 'Negotiation'].includes(l.leadstatus))
                  .reduce((acc: number, l: Lead) => {
                    const budgetValue = typeof l.budget === 'string' 
                      ? parseInt(l.budget.replace(/[^0-9]/g, '')) || 0
                      : (l.budget as number) || 0
                    return acc + budgetValue
                  }, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">Potential revenue from active deals</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, subValue }: any) {
  return (
    <div className="glass-card p-4 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.08] flex items-center justify-center">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
    </div>
  )
}

function StatusItem({ label, count, color }: any) {
  return (
    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
      <p className={`text-lg font-bold ${color}`}>{count}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
