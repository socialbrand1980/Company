"use client"

import React, { useState, useRef, useEffect } from "react"
import { Calendar as CalendarIcon, ChevronDown, Check } from "lucide-react"

interface DateRange {
  startDate: Date | null
  endDate: Date | null
  label: string
}

interface DateFilterProps {
  onDateRangeChange?: (range: DateRange) => void
}

type PresetOption = 
  | "all"
  | "today"
  | "yesterday"
  | "last7"
  | "last14"
  | "last30"
  | "thisMonth"
  | "lastMonth"

export function DateFilter({ onDateRangeChange }: DateFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<PresetOption>("all")
  const [customRange, setCustomRange] = useState<{ start: string; end: string }>({ start: "", end: "" })
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Get date range for preset
  const getDateRange = (preset: PresetOption): { start: Date | null; end: Date | null; label: string } => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    switch (preset) {
      case "all":
        return { start: null, end: null, label: "All time" }
      
      case "today":
        return { start: today, end: today, label: "Today" }
      
      case "yesterday": {
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        yesterday.setHours(0, 0, 0, 0)
        return { start: yesterday, end: yesterday, label: "Yesterday" }
      }
      
      case "last7": {
        const startDate = new Date(today)
        startDate.setDate(startDate.getDate() - 6)
        startDate.setHours(0, 0, 0, 0)
        return { start: startDate, end: today, label: "Last 7 days" }
      }
      
      case "last14": {
        const startDate = new Date(today)
        startDate.setDate(startDate.getDate() - 13)
        startDate.setHours(0, 0, 0, 0)
        return { start: startDate, end: today, label: "Last 14 days" }
      }
      
      case "last30": {
        const startDate = new Date(today)
        startDate.setDate(startDate.getDate() - 29)
        startDate.setHours(0, 0, 0, 0)
        return { start: startDate, end: today, label: "Last 30 days" }
      }
      
      case "thisMonth": {
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        startDate.setHours(0, 0, 0, 0)
        return { start: startDate, end: today, label: "This month" }
      }
      
      case "lastMonth": {
        const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        startDate.setHours(0, 0, 0, 0)
        const endDate = new Date(today.getFullYear(), today.getMonth(), 0)
        endDate.setHours(23, 59, 59, 999)
        return { start: startDate, end: endDate, label: "Last month" }
      }
      
      default:
        return { start: null, end: null, label: "All time" }
    }
  }

  // Handle preset selection
  const handlePresetSelect = (preset: PresetOption) => {
    setSelectedPreset(preset)
    const range = getDateRange(preset)
    onDateRangeChange?.({
      startDate: range.start,
      endDate: range.end,
      label: range.label
    })
    setIsOpen(false)
  }

  // Handle custom date range apply
  const handleApplyCustomRange = () => {
    if (customRange.start && customRange.end) {
      const startDate = new Date(customRange.start)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(customRange.end)
      endDate.setHours(23, 59, 59, 999)
      
      onDateRangeChange?.({
        startDate,
        endDate,
        label: `${formatDate(startDate)} - ${formatDate(endDate)}`
      })
      setIsOpen(false)
    }
  }

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  // Get current display label
  const getCurrentLabel = (): string => {
    if (selectedPreset === "all") {
      return "All time"
    }
    return getDateRange(selectedPreset).label
  }

  const presets: { id: PresetOption; label: string }[] = [
    { id: "all", label: "All time" },
    { id: "today", label: "Today" },
    { id: "yesterday", label: "Yesterday" },
    { id: "last7", label: "Last 7 days" },
    { id: "last14", label: "Last 14 days" },
    { id: "last30", label: "Last 30 days" },
    { id: "thisMonth", label: "This month" },
    { id: "lastMonth", label: "Last month" },
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] transition-colors text-sm text-white"
      >
        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        <span>{getCurrentLabel()}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 flex glass-card rounded-xl shadow-2xl border border-white/[0.08] z-50 overflow-hidden">
          {/* Sidebar Presets */}
          <div className="w-48 border-r border-white/[0.08] p-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 py-2">
              Quick Filters
            </div>
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                  selectedPreset === preset.id
                    ? "bg-blue-500/10 text-blue-400"
                    : "text-white hover:bg-white/[0.05]"
                }`}
              >
                {selectedPreset === preset.id && (
                  <Check className="h-4 w-4 flex-shrink-0" />
                )}
                <span>{preset.label}</span>
              </button>
            ))}
          </div>

          {/* Calendar Picker */}
          <div className="w-72 p-4">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Custom Date Range
            </div>
            
            <div className="space-y-3">
              {/* Start Date */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
                <input
                  type="date"
                  value={customRange.start}
                  onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] focus:border-blue-500/50 focus:outline-none text-white text-sm"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
                <input
                  type="date"
                  value={customRange.end}
                  onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] focus:border-blue-500/50 focus:outline-none text-white text-sm"
                />
              </div>

              {/* Apply Button */}
              <button
                onClick={handleApplyCustomRange}
                disabled={!customRange.start || !customRange.end}
                className="w-full px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-white/[0.05] disabled:text-muted-foreground text-white text-sm font-medium transition-colors"
              >
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
