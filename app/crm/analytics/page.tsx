"use client"

import React, { useState, useEffect } from "react"
import { TrendingUp, Users, DollarSign, Target, Calendar, ArrowUpRight, ArrowDownRight, BarChart3, PieChart, Activity } from "lucide-react"
import { formatIDR } from "@/lib/format-currency"

interface Lead {
  leadstatus: string
  budget: string
  timestamp: string
}

export default function CRMAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d")
  const [leads, setLeads] = useState<Lead[]>([])

  // Fetch leads from CRM API
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

  // Calculate stats from real data
  const stats = {
    totalLeads: leads.length,
    leadsGrowth: 12.5, // Would calculate from historical data
    activeClients: leads.filter((l: Lead) => l.leadstatus === 'Closed Won').length,
    clientsGrowth: 8.3,
    totalRevenue: leads
      .filter((l: Lead) => l.leadstatus === 'Closed Won')
      .reduce((acc: number, l: Lead) => acc + (parseInt(l.budget?.replace(/[^0-9]/g, '') || '0')), 0),
    revenueGrowth: 23.7,
    conversionRate: leads.length > 0 ? ((leads.filter((l: Lead) => l.leadstatus === 'Closed Won').length / leads.length) * 100).toFixed(1) : 0,
    conversionGrowth: 5.2
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

  const revenueByMonth = [
    { month: "Jan", value: 150000000 },
    { month: "Feb", value: 280000000 },
    { month: "Mar", value: 420000000 },
    { month: "Apr", value: 380000000 },
    { month: "May", value: 520000000 },
    { month: "Jun", value: 700000000 }
  ]

  const topServices = [
    { name: "Social Media Management", count: 18, percentage: 85 },
    { name: "Content Production", count: 15, percentage: 72 },
    { name: "Performance Marketing", count: 12, percentage: 65 },
    { name: "Brand Strategy", count: 10, percentage: 58 },
    { name: "Influencer Marketing", count: 8, percentage: 45 }
  ]

  useEffect(() => {
    setLoading(false)
  }, [])

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
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Analytics</h1>
              <p className="text-sm text-muted-foreground mt-1">Track your CRM performance and metrics</p>
            </div>
            <div className="flex items-center gap-2">
              {(["7d", "30d", "90d", "all"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === range
                      ? "bg-blue-500 text-white"
                      : "bg-white/[0.03] text-muted-foreground hover:text-white"
                  }`}
                >
                  {range === "7d" ? "Last 7 days" : range === "30d" ? "Last 30 days" : range === "90d" ? "Last 90 days" : "All time"}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Users}
              label="Total Leads"
              value={stats.totalLeads.toString()}
              growth={stats.leadsGrowth}
            />
            <StatCard
              icon={Target}
              label="Active Clients"
              value={stats.activeClients.toString()}
              growth={stats.clientsGrowth}
            />
            <StatCard
              icon={DollarSign}
              label="Total Revenue"
              value={formatIDR(stats.totalRevenue)}
              growth={stats.revenueGrowth}
            />
            <StatCard
              icon={TrendingUp}
              label="Conversion Rate"
              value={`${stats.conversionRate}%`}
              growth={stats.conversionGrowth}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Leads by Status */}
            <div className="glass-card p-6 rounded-xl">
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

            {/* Revenue by Month */}
            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Revenue Trend</h3>
                  <p className="text-sm text-muted-foreground mt-1">Monthly revenue performance</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
              <div className="flex items-end justify-between gap-2 h-48">
                {revenueByMonth.map((item) => (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-green-500/20 to-green-500 rounded-t-lg transition-all duration-500"
                      style={{ height: `${(item.value / Math.max(...revenueByMonth.map(r => r.value))) * 100}%`, minHeight: '20px' }}
                    />
                    <span className="text-xs text-muted-foreground">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Services */}
          <div className="glass-card p-6 rounded-xl mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Top Services</h3>
                <p className="text-sm text-muted-foreground mt-1">Most requested services by clients</p>
              </div>
              <PieChart className="h-8 w-8 text-purple-400" />
            </div>
            <div className="space-y-4">
              {topServices.map((service, index) => (
                <div key={service.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                        {index + 1}
                      </div>
                      <span className="text-sm text-white">{service.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-white font-medium">{service.count} clients</span>
                      <span className="text-xs text-muted-foreground ml-2">({service.percentage}%)</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden ml-9">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${service.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Lead Sources</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Website</span>
                  <span className="text-sm text-white">45%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Referrals</span>
                  <span className="text-sm text-white">30%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Social Media</span>
                  <span className="text-sm text-white">15%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Other</span>
                  <span className="text-sm text-white">10%</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Avg. Deal Size</h3>
              <div className="text-3xl font-bold text-white mb-2">{formatIDR(stats.totalRevenue / stats.activeClients)}</div>
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
