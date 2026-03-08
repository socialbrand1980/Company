"use client"

import React, { useState, useEffect } from "react"
import { TrendingUp, Users, DollarSign, Target, ArrowUpRight, ArrowDownRight, BarChart3, Download, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatIDR } from "@/lib/format-currency"

interface Lead {
  leadstatus: string
  budget: string | number
  timestamp: string
  brandname: string
  industry: string
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
  const [timeRange, setTimeRange] = useState<"6m" | "12m" | "24m" | "all">("12m")
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)

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

  // Process monthly revenue data
  useEffect(() => {
    if (leads.length === 0) return

    const months: { [key: string]: MonthlyData } = {}
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    leads.forEach((lead: Lead) => {
      if (lead.leadstatus !== 'Closed Won') return
      
      const date = new Date(lead.timestamp || Date.now())
      const year = date.getFullYear()
      const month = date.getMonth()
      const monthKey = `${year}-${month}`
      
      const budgetValue = typeof lead.budget === 'string' 
        ? parseInt(lead.budget.replace(/[^0-9]/g, '')) || 0
        : (lead.budget as number) || 0

      if (!months[monthKey]) {
        months[monthKey] = {
          month: monthNames[month],
          year: year,
          value: 0,
          count: 0,
          clients: []
        }
      }

      months[monthKey].value += budgetValue
      months[monthKey].count += 1
      months[monthKey].clients.push(lead.brandname || 'Unknown')
    })

    const sortedData = Object.values(months).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return monthNames.indexOf(a.month) - monthNames.indexOf(b.month)
    })

    // Filter based on timeRange
    let filteredData = sortedData
    if (timeRange === "6m") {
      filteredData = sortedData.slice(-6)
    } else if (timeRange === "12m") {
      filteredData = sortedData.slice(-12)
    } else if (timeRange === "24m") {
      filteredData = sortedData.slice(-24)
    }

    console.log('Monthly data:', filteredData)
    setMonthlyData(filteredData)
  }, [leads, timeRange])

  const stats = {
    totalLeads: leads.length,
    activeClients: leads.filter((l: Lead) => l.leadstatus === 'Closed Won').length,
    totalRevenue: leads
      .filter((l: Lead) => l.leadstatus === 'Closed Won')
      .reduce((acc: number, l: Lead) => {
        const budgetValue = typeof l.budget === 'string' 
          ? parseInt(l.budget.replace(/[^0-9]/g, '')) || 0
          : (l.budget as number) || 0
        return acc + budgetValue
      }, 0),
    conversionRate: leads.length > 0 ? ((leads.filter((l: Lead) => l.leadstatus === 'Closed Won').length / leads.length) * 100).toFixed(1) : "0",
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

  const leadsByStatus = [
    { status: "New", count: leads.filter((l: Lead) => l.leadstatus === 'New').length, color: "bg-blue-500" },
    { status: "Contacted", count: leads.filter((l: Lead) => l.leadstatus === 'Contacted').length, color: "bg-yellow-500" },
    { status: "Discovery Call", count: leads.filter((l: Lead) => l.leadstatus === 'Discovery Call').length, color: "bg-purple-500" },
    { status: "Proposal Sent", count: leads.filter((l: Lead) => l.leadstatus === 'Proposal Sent').length, color: "bg-orange-500" },
    { status: "Negotiation", count: leads.filter((l: Lead) => l.leadstatus === 'Negotiation').length, color: "bg-pink-500" },
    { status: "Closed Won", count: leads.filter((l: Lead) => l.leadstatus === 'Closed Won').length, color: "bg-green-500" },
    { status: "Closed Lost", count: leads.filter((l: Lead) => l.leadstatus === 'Closed Lost').length, color: "bg-red-500" }
  ]

  const exportData = () => {
    const headers = ['Month', 'Year', 'Revenue', 'Deals Closed', 'Clients']
    const rows = monthlyData.map(data => [
      data.month,
      data.year,
      data.value,
      data.count,
      data.clients.join('; ')
    ])
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `revenue-report-${selectedYear}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const years = [...new Set(leads
    .map((l: Lead) => {
      const date = new Date(l.timestamp || Date.now())
      return date.getFullYear()
    })
    .filter(year => !isNaN(year)))]
    .sort((a, b) => b - a)

  const defaultYear = years.length > 0 ? years[0] : new Date().getFullYear()

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">Track your CRM performance and metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={exportData} className="gap-2 bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users} label="Total Leads" value={stats.totalLeads.toString()} growth={12.5} />
          <StatCard icon={Target} label="Active Clients" value={stats.activeClients.toString()} growth={8.3} />
          <StatCard icon={DollarSign} label="Total Revenue" value={formatIDR(stats.totalRevenue)} growth={23.7} />
          <StatCard icon={TrendingUp} label="Conversion Rate" value={`${stats.conversionRate}%`} growth={5.2} />
        </div>

        {/* Revenue Trend Chart */}
        <div className="glass-card p-6 rounded-xl mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Revenue Trend</h3>
                <p className="text-sm text-muted-foreground mt-1">Monthly revenue from closed deals</p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <select
                  value={selectedYear || defaultYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] focus:border-blue-500/50 focus:outline-none text-white text-sm"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(["6m", "12m", "24m", "all"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    timeRange === range
                      ? "bg-blue-500 text-white"
                      : "bg-white/[0.03] text-muted-foreground hover:text-white"
                  }`}
                >
                  {range === "6m" ? "6M" : range === "12m" ? "12M" : range === "24m" ? "24M" : "All"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end justify-between gap-2 h-64">
            {monthlyData
              .filter(data => !selectedYear || data.year === selectedYear)
              .map((data, index) => {
                const filteredByYear = monthlyData.filter(d => !selectedYear || d.year === selectedYear)
                const maxValue = Math.max(...filteredByYear.map(d => d.value), 1)
                const height = (data.value / maxValue) * 100
                
                return (
                  <div
                    key={`${data.month}-${data.year}`}
                    className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
                    onClick={() => setSelectedMonth(selectedMonth === index ? null : index)}
                  >
                    <div className="relative w-full">
                      <div
                        className="w-full bg-gradient-to-t from-green-500/30 to-green-500 rounded-t-lg transition-all duration-500 hover:from-green-400/40 hover:to-green-400"
                        style={{ height: `${Math.max(height, 2)}%`, minHeight: '8px' }}
                      />
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        <div className="glass-card rounded-lg p-3 min-w-[180px] shadow-xl">
                          <p className="text-xs font-medium text-white mb-1">{data.month} {data.year}</p>
                          <p className="text-sm font-bold text-green-400 mb-2">{formatIDR(data.value)}</p>
                          <div className="text-xs text-muted-foreground">
                            <p>{data.count} deal{data.count !== 1 ? 's' : ''}</p>
                            <p className="truncate mt-1">{data.clients.slice(0, 2).join(', ')}{data.clients.length > 2 ? ` +${data.clients.length - 2}` : ''}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{data.month}</span>
                  </div>
                )
              })}
          </div>

          {/* Selected Month Detail */}
          {selectedMonth !== null && monthlyData.filter(d => d.year === selectedYear)[selectedMonth] && (
            <div className="mt-6 p-4 rounded-lg bg-white/[0.02] border border-white/[0.08]">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-white">
                  {monthlyData.filter(d => d.year === selectedYear)[selectedMonth].month} {selectedYear} Details
                </h4>
                <button onClick={() => setSelectedMonth(null)} className="text-muted-foreground hover:text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
                  <p className="text-lg font-bold text-green-400">
                    {formatIDR(monthlyData.filter(d => d.year === selectedYear)[selectedMonth].value)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Deals Closed</p>
                  <p className="text-lg font-bold text-white">{monthlyData.filter(d => d.year === selectedYear)[selectedMonth].count}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Avg Deal Size</p>
                  <p className="text-lg font-bold text-white">
                    {formatIDR(monthlyData.filter(d => d.year === selectedYear)[selectedMonth].value / 
                              Math.max(monthlyData.filter(d => d.year === selectedYear)[selectedMonth].count, 1))}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Clients</p>
                <div className="flex flex-wrap gap-2">
                  {monthlyData.filter(d => d.year === selectedYear)[selectedMonth].clients.map((client, i) => (
                    <span key={i} className="text-xs px-2 py-1 rounded bg-white/[0.05] text-white">
                      {client}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Leads by Status */}
        <div className="glass-card p-6 rounded-xl mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Leads by Status</h3>
              <p className="text-sm text-muted-foreground mt-1">Distribution of leads across pipeline</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-400" />
          </div>
          <div className="space-y-4">
            {leadsByStatus.map((item) => (
              <div key={item.status}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white">{item.status}</span>
                  <span className="text-sm text-muted-foreground">{item.count} leads</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                  <div
                    className={`h-full ${item.color} transition-all duration-500`}
                    style={{ width: `${(item.count / Math.max(...leadsByStatus.map(l => l.count))) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Avg. Deal Size</h3>
            <div className="text-3xl font-bold text-white mb-2">{formatIDR(stats.avgDealSize)}</div>
            <div className="flex items-center gap-2 text-sm text-green-400">
              <ArrowUpRight className="h-4 w-4" />
              <span>+15.3% from last period</span>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Sales Cycle</h3>
            <div className="text-3xl font-bold text-white mb-2">14 days</div>
            <div className="flex items-center gap-2 text-sm text-green-400">
              <ArrowDownRight className="h-4 w-4" />
              <span>-3 days from last period</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, growth }: any) {
  const isPositive = growth > 0
  
  return (
    <div className="glass-card p-4 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.08] flex items-center justify-center">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          <span>{Math.abs(growth)}%</span>
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  )
}
