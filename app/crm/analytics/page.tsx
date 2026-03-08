"use client"

import React, { useState, useEffect } from "react"
import { TrendingUp, Users, DollarSign, Target, ArrowUpRight, ArrowDownRight, BarChart3, Download, PieChart, Activity, ChartBar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatIDR } from "@/lib/format-currency"
import { DateFilter } from "@/components/date-filter"

interface Lead {
  leadstatus: string
  budget: string | number
  timestamp: string
  brandname: string
  industry: string
  email: string
  phone?: string
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
  label: string
  value: number
  count: number
  clients: string[]
}

export default function CRMAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [leads, setLeads] = useState<Lead[]>([])
  const [dateRange, setDateRange] = useState<{ startDate: Date | null; endDate: Date | null; label: string }>({
    startDate: null,
    endDate: null,
    label: "Last 7 days"
  })
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])

  useEffect(() => {
    async function fetchLeads() {
      try {
        console.log('📡 Fetching leads from API...')
        const response = await fetch('/api/crm/leads')
        console.log('📡 Response status:', response.status)
        
        const data = await response.json()
        console.log('📡 Response data:', data)
        
        if (data.success) {
          setLeads(data.leads || [])
          console.log('✅ Leads loaded:', data.leads?.length)
        } else {
          console.error('❌ API returned error:', data)
          setLeads([])
        }
      } catch (error) {
        console.error('❌ Failed to fetch leads:', error)
        setLeads([])
      } finally {
        setLoading(false)
      }
    }
    fetchLeads()
  }, [])

  // Debug: Log when dateRange changes
  useEffect(() => {
    console.log('🔔 DateRange changed:', dateRange)
  }, [dateRange])

  // Process revenue data based on selected date range
  useEffect(() => {
    console.log('=== Analytics Filter ===')
    console.log('Date range:', dateRange)
    console.log('Start:', dateRange.startDate ? dateRange.startDate.toISOString() : 'null')
    console.log('End:', dateRange.endDate ? dateRange.endDate.toISOString() : 'null')
    console.log('Total leads:', leads.length)
    console.log('Closed Won leads:', leads.filter(l => l.leadstatus === 'Closed Won').length)
    
    if (leads.length === 0) return

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const data: { [key: string]: MonthlyData } = {}

    // Convert to timestamps for comparison
    const startTimestamp = dateRange.startDate ? new Date(dateRange.startDate).setHours(0, 0, 0, 0) : null
    const endTimestamp = dateRange.endDate ? new Date(dateRange.endDate).setHours(23, 59, 59, 999) : null

    console.log('Start timestamp:', startTimestamp, new Date(startTimestamp || 0).toISOString())
    console.log('End timestamp:', endTimestamp, new Date(endTimestamp || 0).toISOString())

    let filteredCount = 0
    let skippedCount = 0
    
    leads.forEach((lead: Lead) => {
      if (lead.leadstatus !== 'Closed Won') {
        return
      }

      // Parse timestamp from Google Sheets format "Date(2026,2,8,13,3,42)"
      let leadDate: Date
      
      if (typeof lead.timestamp === 'string' && lead.timestamp.startsWith('Date(')) {
        // Extract: Date(year, month, day, hour, minute, second)
        const match = lead.timestamp.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/)
        if (match) {
          const [, year, month, day, hour, minute, second] = match
          // Google Sheets appears to use 0-indexed months like JS (0=Jan, 1=Feb, 2=Mar)
          // So month=2 means March, no conversion needed
          leadDate = new Date(Number(year), Number(month), Number(day), Number(hour), Number(minute), Number(second))
          console.log('Parsed GS timestamp:', lead.timestamp, '→', leadDate.toISOString(), '(month:', Number(month), '= March, no conversion)')
        } else {
          leadDate = new Date(lead.timestamp)
        }
      } else {
        leadDate = new Date(lead.timestamp)
      }
      
      // Check if date is valid
      if (isNaN(leadDate.getTime())) {
        console.log('Lead:', lead.brandname, '❌ Invalid timestamp:', lead.timestamp)
        return
      }
      
      const leadTimestamp = new Date(leadDate.getFullYear(), leadDate.getMonth(), leadDate.getDate()).getTime()
      
      console.log('Lead:', lead.brandname, 'Raw:', lead.timestamp, 'Parsed:', leadDate.toISOString(), 'Midnight:', new Date(leadTimestamp).toISOString())

      // Filter by date range using timestamps
      if (startTimestamp !== null && leadTimestamp < startTimestamp) {
        console.log('  ❌ Skipped: Before start date')
        skippedCount++
        return
      }
      if (endTimestamp !== null && leadTimestamp > endTimestamp) {
        console.log('  ❌ Skipped: After end date')
        skippedCount++
        return
      }
      
      console.log('  ✅ Included in range')
      filteredCount++
      
      const year = leadDate.getFullYear()
      const month = leadDate.getMonth()
      const day = leadDate.getDate()

      // Determine grouping based on date range
      let groupByDay = false
      let groupByWeek = false
      
      if (startTimestamp !== null && endTimestamp !== null) {
        const rangeDays = Math.ceil((endTimestamp - startTimestamp) / (1000 * 60 * 60 * 24))
        groupByDay = rangeDays <= 14  // Group by day for ≤2 weeks
        groupByWeek = rangeDays > 14 && rangeDays <= 90  // Group by week for 2 weeks - 3 months
      } else if (startTimestamp !== null && endTimestamp === null) {
        // Only start date (e.g., "Today")
        groupByDay = true
      } else if (startTimestamp === null && endTimestamp === null) {
        // All time - group by month
        groupByDay = false
        groupByWeek = false
      }

      let key: string
      let label: string
      let periodYear: number
      let periodMonth: number

      if (groupByDay) {
        key = `${year}-${month}-${day}`
        // Format: "8 Mar" or "8 Mar 2026" if different year
        const monthName = monthNames[month]
        label = year === new Date().getFullYear() ? `${day} ${monthName}` : `${day} ${monthName} ${year}`
        periodYear = year
        periodMonth = month
      } else if (groupByWeek) {
        // Calculate week number
        const weekNumber = Math.ceil(day / 7)
        key = `${year}-${month}-W${weekNumber}`
        label = `Week ${weekNumber}`
        periodYear = year
        periodMonth = month
      } else {
        key = `${year}-${month}`
        label = monthNames[month]
        periodYear = year
        periodMonth = month
      }

      const budgetValue = typeof lead.budget === 'string'
        ? parseInt(lead.budget.replace(/[^0-9]/g, '')) || 0
        : (lead.budget as number) || 0

      if (!data[key]) {
        data[key] = {
          month: label,
          label: label,
          year: periodYear,
          value: 0,
          count: 0,
          clients: []
        }
      }

      data[key].value += budgetValue
      data[key].count += 1
      data[key].clients.push(lead.brandname || 'Unknown')
    })

    console.log('✅ Filtered leads count:', filteredCount)
    console.log('❌ Skipped leads count:', skippedCount)
    console.log('Grouped data:', data)

    const sortedData = Object.values(data).sort((a, b) => {
      // Year sorting
      if (a.year !== b.year) {
        return Number(a.year) - Number(b.year)
      }
      // Month sorting (0-11)
      if (a.month !== b.month) {
        return Number(a.month) - Number(b.month)
      }
      // Handle week/day sorting
      const aLabel = String(a.label || a.month)
      const bLabel = String(b.label || b.month)
      const aNum = Number(aLabel.replace('W', '')) || 0
      const bNum = Number(bLabel.replace('W', '')) || 0
      return aNum - bNum
    })

    console.log('Sorted data:', sortedData)
    setMonthlyData(sortedData)
  }, [leads, dateRange])

  // Calculate stats (filtered by date range)
  const getFilteredStats = () => {
    const filteredLeads = leads.filter((lead: Lead) => {
      // Parse timestamp from Google Sheets format "Date(2026,2,8,13,3,42)"
      let leadDate: Date
      
      if (typeof lead.timestamp === 'string' && lead.timestamp.startsWith('Date(')) {
        const match = lead.timestamp.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/)
        if (match) {
          const [, year, month, day, hour, minute, second] = match
          // Google Sheets uses 0-indexed months like JS
          leadDate = new Date(Number(year), Number(month), Number(day), Number(hour), Number(minute), Number(second))
        } else {
          leadDate = new Date(lead.timestamp)
        }
      } else {
        leadDate = new Date(lead.timestamp)
      }
      
      // Check if date is valid
      if (isNaN(leadDate.getTime())) return true

      // If no date range selected, include all
      if (!dateRange.startDate && !dateRange.endDate) return true

      // Filter by date range
      if (dateRange.startDate) {
        const start = new Date(dateRange.startDate as Date)
        start.setHours(0, 0, 0, 0)
        if (leadDate < start) return false
      }
      if (dateRange.endDate) {
        const end = new Date(dateRange.endDate as Date)
        end.setHours(23, 59, 59, 999)
        if (leadDate > end) return false
      }

      return true
    })

    console.log('📊 Filtered Stats:', {
      totalLeads: filteredLeads.length,
      closedWon: filteredLeads.filter((l: Lead) => l.leadstatus === 'Closed Won').length,
      dateRange: dateRange.label
    })

    return {
      totalLeads: filteredLeads.length,
      newLeads: filteredLeads.filter((l: Lead) => l.leadstatus === 'New').length,
      contacted: filteredLeads.filter((l: Lead) => l.leadstatus === 'Contacted').length,
      discovery: filteredLeads.filter((l: Lead) => l.leadstatus === 'Discovery Call').length,
      proposal: filteredLeads.filter((l: Lead) => l.leadstatus === 'Proposal Sent').length,
      negotiation: filteredLeads.filter((l: Lead) => l.leadstatus === 'Negotiation').length,
      closedWon: filteredLeads.filter((l: Lead) => l.leadstatus === 'Closed Won').length,
      closedLost: filteredLeads.filter((l: Lead) => l.leadstatus === 'Closed Lost').length,
      totalRevenue: filteredLeads
        .filter((l: Lead) => l.leadstatus === 'Closed Won')
        .reduce((acc: number, l: Lead) => {
          const budgetValue = typeof l.budget === 'string' 
            ? parseInt(l.budget.replace(/[^0-9]/g, '')) || 0
            : (l.budget as number) || 0
          return acc + budgetValue
        }, 0),
      conversionRate: filteredLeads.length > 0 
        ? ((filteredLeads.filter((l: Lead) => l.leadstatus === 'Closed Won').length / filteredLeads.length) * 100).toFixed(1) 
        : "0",
      avgDealSize: filteredLeads.filter((l: Lead) => l.leadstatus === 'Closed Won').length > 0 
        ? filteredLeads
            .filter((l: Lead) => l.leadstatus === 'Closed Won')
            .reduce((acc: number, l: Lead) => {
              const budgetValue = typeof l.budget === 'string' 
                ? parseInt(l.budget.replace(/[^0-9]/g, '')) || 0
                : (l.budget as number) || 0
              return acc + budgetValue
            }, 0) / filteredLeads.filter((l: Lead) => l.leadstatus === 'Closed Won').length
        : 0
    }
  }

  const [filteredStats, setFilteredStats] = useState(getFilteredStats())

  // Update stats when dateRange or leads change
  useEffect(() => {
    console.log('🔔 Date range changed, recalculating stats...')
    const newStats = getFilteredStats()
    console.log('📊 New stats:', newStats)
    setFilteredStats(newStats)
  }, [leads, dateRange])

  const stats = filteredStats

  // Funnel data (using filtered stats)
  const funnelData: FunnelData[] = [
    { stage: "New Leads", count: stats.newLeads, percentage: stats.totalLeads > 0 ? (stats.newLeads / stats.totalLeads) * 100 : 0, color: "bg-blue-500" },
    { stage: "Contacted", count: stats.contacted, percentage: stats.totalLeads > 0 ? (stats.contacted / stats.totalLeads) * 100 : 0, color: "bg-yellow-500" },
    { stage: "Discovery Call", count: stats.discovery, percentage: stats.totalLeads > 0 ? (stats.discovery / stats.totalLeads) * 100 : 0, color: "bg-purple-500" },
    { stage: "Proposal", count: stats.proposal, percentage: stats.totalLeads > 0 ? (stats.proposal / stats.totalLeads) * 100 : 0, color: "bg-orange-500" },
    { stage: "Negotiation", count: stats.negotiation, percentage: stats.totalLeads > 0 ? (stats.negotiation / stats.totalLeads) * 100 : 0, color: "bg-pink-500" },
    { stage: "Closed Won", count: stats.closedWon, percentage: stats.totalLeads > 0 ? (stats.closedWon / stats.totalLeads) * 100 : 0, color: "bg-green-500" }
  ]

  // Industry breakdown (using filtered stats)
  const industryBreakdown = leads
    .filter((lead: Lead) => {
      // Parse timestamp from Google Sheets format
      let leadDate: Date
      
      if (typeof lead.timestamp === 'string' && lead.timestamp.startsWith('Date(')) {
        const match = lead.timestamp.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/)
        if (match) {
          const [, year, month, day, hour, minute, second] = match
          leadDate = new Date(Number(year), Number(month), Number(day), Number(hour), Number(minute), Number(second))
        } else {
          leadDate = new Date(lead.timestamp)
        }
      } else {
        leadDate = new Date(lead.timestamp)
      }
      
      if (isNaN(leadDate.getTime())) return true
      
      if (!dateRange.startDate && !dateRange.endDate) return true
      
      if (dateRange.startDate) {
        const start = new Date(dateRange.startDate)
        start.setHours(0, 0, 0, 0)
        if (leadDate < start) return false
      }
      if (dateRange.endDate) {
        const end = new Date(dateRange.endDate)
        end.setHours(23, 59, 59, 999)
        if (leadDate > end) return false
      }
      
      return true
    })
    .reduce((acc: any, lead: Lead) => {
      const industry = lead.industry || 'Other'
      if (!acc[industry]) acc[industry] = 0
      acc[industry]++
      return acc
    }, {})

  const exportData = () => {
    console.log('📥 Exporting detailed analytics report...')
    
    // Get filtered leads based on current date range
    const filteredLeads = leads.filter((lead: Lead) => {
      let leadDate: Date
      
      if (typeof lead.timestamp === 'string' && lead.timestamp.startsWith('Date(')) {
        const match = lead.timestamp.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/)
        if (match) {
          const [, year, month, day, hour, minute, second] = match
          leadDate = new Date(Number(year), Number(month), Number(day), Number(hour), Number(minute), Number(second))
        } else {
          leadDate = new Date(lead.timestamp)
        }
      } else {
        leadDate = new Date(lead.timestamp)
      }
      
      if (isNaN(leadDate.getTime())) return true
      
      if (!dateRange.startDate && !dateRange.endDate) return true
      
      if (dateRange.startDate) {
        const start = new Date(dateRange.startDate)
        start.setHours(0, 0, 0, 0)
        if (leadDate < start) return false
      }
      if (dateRange.endDate) {
        const end = new Date(dateRange.endDate)
        end.setHours(23, 59, 59, 999)
        if (leadDate > end) return false
      }
      
      return true
    })

    console.log('Filtered leads for export:', filteredLeads.length)

    // Generate detailed CSV with analysis
    const dateStr = new Date().toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    }).replace(/ /g, '-')
    
    const csvSections = []

    // Section 1: Report Header
    csvSections.push('SOCIALBRAND 1980 - ANALYTICS REPORT')
    csvSections.push(`Generated: ${new Date().toLocaleString('id-ID')}`)
    csvSections.push(`Date Range: ${dateRange.label}`)
    csvSections.push(`Total Leads: ${filteredLeads.length}`)
    csvSections.push('')

    // Section 2: Executive Summary
    csvSections.push('EXECUTIVE SUMMARY')
    csvSections.push('================')
    csvSections.push(`Total Leads: ${stats.totalLeads}`)
    csvSections.push(`Closed Won: ${stats.closedWon}`)
    csvSections.push(`Total Revenue: Rp ${stats.totalRevenue.toLocaleString('id-ID')}`)
    csvSections.push(`Conversion Rate: ${stats.conversionRate}%`)
    csvSections.push(`Average Deal Size: Rp ${Math.round(stats.avgDealSize).toLocaleString('id-ID')}`)
    csvSections.push('')

    // Section 3: Key Insights
    csvSections.push('KEY INSIGHTS')
    csvSections.push('============')
    
    // Insight 1: Top Status
    const statusCounts = filteredLeads.reduce((acc: any, lead: Lead) => {
      acc[lead.leadstatus] = (acc[lead.leadstatus] || 0) + 1
      return acc
    }, {})
    const topStatus = Object.entries(statusCounts).sort((a, b) => b[1] - a[1])[0]
    if (topStatus) {
      csvSections.push(`• Most leads are in '${topStatus[0] as string}' stage (${topStatus[1] as number} leads)`)
    }

    // Insight 2: Top Industry
    const industryCounts = filteredLeads.reduce((acc: any, lead: Lead) => {
      const industry = lead.industry || 'Unknown'
      acc[industry] = (acc[industry] || 0) + 1
      return acc
    }, {})
    const topIndustry = Object.entries(industryCounts).sort((a, b) => b[1] - a[1])[0]
    if (topIndustry) {
      csvSections.push(`• Top industry: ${topIndustry[0] as string} (${topIndustry[1] as number} leads)`)
    }

    // Insight 3: Revenue Insight
    const closedWonLeads = filteredLeads.filter((l: Lead) => l.leadstatus === 'Closed Won')
    if (closedWonLeads.length > 0) {
      const totalRevenue = closedWonLeads.reduce((sum: number, l: Lead) => {
        const budget = typeof l.budget === 'string'
          ? parseInt(l.budget.replace(/[^0-9]/g, '')) || 0
          : (l.budget as number) || 0
        return sum + budget
      }, 0)
      const avgDeal = totalRevenue / closedWonLeads.length
      csvSections.push(`• Total revenue from ${closedWonLeads.length} closed deals: Rp ${totalRevenue.toLocaleString('id-ID')}`)
      csvSections.push(`• Average deal size: Rp ${Math.round(avgDeal).toLocaleString('id-ID')}`)
    }

    // Insight 4: Conversion Analysis
    const conversionRate = filteredLeads.length > 0 
      ? ((closedWonLeads.length / filteredLeads.length) * 100).toFixed(1)
      : "0"
    
    if (parseFloat(conversionRate) >= 40) {
      csvSections.push(`• Excellent conversion rate of ${conversionRate}% - above industry average!`)
    } else if (parseFloat(conversionRate) >= 25) {
      csvSections.push(`• Good conversion rate of ${conversionRate}% - room for improvement.`)
    } else {
      csvSections.push(`• Conversion rate of ${conversionRate}% - consider optimizing sales process.`)
    }

    // Insight 5: Top Client
    if (closedWonLeads.length > 0) {
      const topClient = closedWonLeads.reduce((max: any, l: Lead) => {
        const budget = typeof l.budget === 'string' 
          ? parseInt(l.budget.replace(/[^0-9]/g, '')) || 0
          : (l.budget as number) || 0
        const maxBudget = typeof max.budget === 'string' 
          ? parseInt(max.budget.replace(/[^0-9]/g, '')) || 0
          : (max.budget as number) || 0
        return budget > maxBudget ? l : max
      }, closedWonLeads[0])
      
      const topClientBudget = typeof topClient.budget === 'string' 
        ? parseInt(topClient.budget.replace(/[^0-9]/g, '')) || 0
        : (topClient.budget as number) || 0
      
      csvSections.push(`• Top client by revenue: ${topClient.brandname} (Rp ${topClientBudget.toLocaleString('id-ID')})`)
    }

    csvSections.push('')

    // Section 4: Funnel Data
    csvSections.push('SALES FUNNEL')
    csvSections.push('============')
    csvSections.push('Stage,Count,Percentage')
    funnelData.forEach(item => {
      csvSections.push(`${item.stage},${item.count},${item.percentage.toFixed(1)}%`)
    })
    csvSections.push('')

    // Section 5: Detailed Lead Data
    csvSections.push('DETAILED LEAD DATA')
    csvSections.push('==================')
    csvSections.push('Brand Name,Status,Industry,Budget,Email,Phone,Timestamp')
    
    filteredLeads.forEach((lead: Lead) => {
      const budget = typeof lead.budget === 'string' 
        ? lead.budget
        : (lead.budget as number)?.toString() || ''
      
      csvSections.push(`"${lead.brandname || ''}","${lead.leadstatus || ''}","${lead.industry || ''}","${budget}","${lead.email || ''}","${lead.phone || ''}","${lead.timestamp || ''}"`)
    })

    // Join all sections
    const csv = csvSections.join('\n')

    // Download
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    
    const filenameDate = new Date().toISOString().split('T')[0]
    a.download = `socialbrand1980-analytics-report-${filenameDate}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    
    console.log('✅ Detailed CSV exported successfully')
    alert('✅ Detailed analytics report exported! Check your downloads folder.')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
          <p className="text-xs text-muted-foreground mt-2">Fetching data from Google Sheets</p>
        </div>
      </div>
    )
  }

  if (leads.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
            <Activity className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Data Available</h2>
          <p className="text-muted-foreground mb-4">
            No leads found in the system. Make sure you have submissions from the Work With Us form.
          </p>
          <div className="text-sm text-muted-foreground">
            <p>Check console logs (F12) for more details</p>
          </div>
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
            <DateFilter onDateRangeChange={setDateRange} />
            
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
                <p className="text-sm text-muted-foreground mt-1">{dateRange.label}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Chart Area */}
            <div className="h-64 flex items-end gap-1 relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[100, 75, 50, 25, 0].map((percent) => (
                  <div key={percent} className="flex items-center gap-2">
                    <div className="w-full h-px bg-white/[0.05]" />
                    <span className="text-xs text-muted-foreground w-12 text-right">{percent}%</span>
                  </div>
                ))}
              </div>
              
              {/* Bars with gradient */}
              {monthlyData.length > 0 ? (
                monthlyData.map((data, index) => {
                  const maxValue = Math.max(...monthlyData.map(d => d.value), 1)
                  const height = (data.value / maxValue) * 100
                  
                  return (
                    <div
                      key={`${data.month}-${data.year}-${index}`}
                      className="flex-1 flex flex-col items-center gap-2 group relative z-10"
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                        <div className="glass-card rounded-lg p-3 min-w-[200px] shadow-xl border border-white/[0.12]">
                          <p className="text-xs font-medium text-white mb-2">
                            {data.label} {data.year !== new Date().getFullYear() ? data.year : ''}
                          </p>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-xs text-muted-foreground">Revenue:</span>
                              <span className="text-sm font-bold text-green-400">{formatIDR(data.value)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-xs text-muted-foreground">Deals:</span>
                              <span className="text-xs text-white">{data.count} deal{data.count !== 1 ? 's' : ''}</span>
                            </div>
                            {data.clients.length > 0 && (
                              <div className="pt-2 mt-2 border-t border-white/[0.08]">
                                <p className="text-xs text-muted-foreground mb-1">Clients:</p>
                                <p className="text-xs text-white truncate">{data.clients.join(', ')}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Bar with gradient */}
                      <div className="w-full relative flex-1 flex items-end">
                        <div
                          className="w-full bg-gradient-to-t from-green-500/80 via-green-400/60 to-green-300/40 rounded-t-lg transition-all duration-500 group-hover:from-green-500 group-hover:via-green-400 group-hover:to-green-300 relative"
                          style={{ height: `${Math.max(height, 2)}%`, minHeight: '4px' }}
                        >
                          {/* Top glow */}
                          <div className="absolute -top-1 left-0 right-0 h-2 bg-green-400/30 blur-sm rounded-full" />
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground rotate-0 whitespace-nowrap">{data.label}</span>
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
