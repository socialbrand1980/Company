"use client"

import React, { useState, useRef, useEffect } from "react"
import { Calendar as CalendarIcon, ChevronDown, Check, ChevronLeft, ChevronRight } from "lucide-react"

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
  | "custom"

export function DateFilter({ onDateRangeChange }: DateFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<PresetOption>("all")
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
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
      
      case "today": {
        const end = new Date(today)
        end.setHours(23, 59, 59, 999)
        return { start: today, end: end, label: "Today" }
      }
      
      case "yesterday": {
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const end = new Date(yesterday)
        end.setHours(23, 59, 59, 999)
        return { start: yesterday, end: end, label: "Yesterday" }
      }
      
      case "last7": {
        const startDate = new Date(today)
        startDate.setDate(startDate.getDate() - 6)
        const end = new Date(today)
        end.setHours(23, 59, 59, 999)
        return { start: startDate, end: end, label: "Last 7 days" }
      }
      
      case "last14": {
        const startDate = new Date(today)
        startDate.setDate(startDate.getDate() - 13)
        const end = new Date(today)
        end.setHours(23, 59, 59, 999)
        return { start: startDate, end: end, label: "Last 14 days" }
      }
      
      case "last30": {
        const startDate = new Date(today)
        startDate.setDate(startDate.getDate() - 29)
        const end = new Date(today)
        end.setHours(23, 59, 59, 999)
        return { start: startDate, end: end, label: "Last 30 days" }
      }
      
      case "thisMonth": {
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        const end = new Date(today)
        end.setHours(23, 59, 59, 999)
        return { start: startDate, end: end, label: "This month" }
      }
      
      case "lastMonth": {
        const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const endDate = new Date(today.getFullYear(), today.getMonth(), 0)
        endDate.setHours(23, 59, 59, 999)
        return { start: startDate, end: endDate, label: "Last month" }
      }
      
      case "custom":
        return { start: startDate, end: endDate, label: startDate && endDate ? formatDateRange(startDate, endDate) : "Custom range" }
      
      default:
        return { start: null, end: null, label: "All time" }
    }
  }

  // Handle preset selection
  const handlePresetSelect = (preset: PresetOption) => {
    console.log('🔘 Preset selected:', preset)
    setSelectedPreset(preset)
    
    if (preset === "custom") {
      // Keep calendar open for custom selection
      return
    }
    
    const range = getDateRange(preset)
    console.log('📅 Range from preset:', range)
    setStartDate(range.start)
    setEndDate(range.end)
    
    console.log('📤 Calling onDateRangeChange:', {
      startDate: range.start,
      endDate: range.end,
      label: range.label
    })
    onDateRangeChange?.({
      startDate: range.start,
      endDate: range.end,
      label: range.label
    })
    setIsOpen(false)
  }

  // Handle date selection from calendar
  const handleDateSelect = (date: Date) => {
    if (!startDate || (startDate && endDate)) {
      // Start new selection
      setStartDate(date)
      setEndDate(null)
    } else {
      // Complete range
      if (date < startDate) {
        setStartDate(date)
        setEndDate(startDate)
      } else {
        setEndDate(date)
      }
    }
  }

  // Apply custom range
  const handleApply = () => {
    console.log('🔘 Apply clicked')
    console.log('📅 Start date:', startDate)
    console.log('📅 End date:', endDate)
    
    if (startDate && endDate) {
      const label = formatDateRange(startDate, endDate)
      console.log('📤 Calling onDateRangeChange:', {
        startDate,
        endDate,
        label
      })
      onDateRangeChange?.({
        startDate,
        endDate,
        label
      })
      setIsOpen(false)
    } else {
      console.log('❌ No dates selected')
    }
  }

  // Format date range for display
  const formatDateRange = (start: Date, end: Date): string => {
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    return `${startStr} - ${endStr}`
  }

  // Get current display label
  const getCurrentLabel = (): string => {
    if (selectedPreset !== "custom") {
      return getDateRange(selectedPreset).label
    }
    if (startDate && endDate) {
      return formatDateRange(startDate, endDate)
    }
    return "Custom range"
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDayOfWeek = firstDay.getDay()
    const totalDays = lastDay.getDate()
    
    const days = []
    
    // Previous month days
    const prevMonth = new Date(year, month, 0)
    const prevMonthDays = prevMonth.getDate()
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false
      })
    }
    
    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      })
    }
    
    // Next month days
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      })
    }
    
    return days
  }

  // Check if date is selected
  const isDateSelected = (date: Date) => {
    if (!startDate) return false
    if (!endDate) {
      return date.toDateString() === startDate.toDateString()
    }
    return date >= startDate && date <= endDate
  }

  // Check if date is start date
  const isStartDate = (date: Date) => {
    return startDate && date.toDateString() === startDate.toDateString()
  }

  // Check if date is end date
  const isEndDate = (date: Date) => {
    return endDate && date.toDateString() === endDate.toDateString()
  }

  // Check if date is in range
  const isInRange = (date: Date) => {
    if (!startDate || !endDate) return false
    return date > startDate && date < endDate
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
    { id: "custom", label: "Custom range" },
  ]

  const calendarDays = generateCalendarDays()
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

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

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 flex bg-[#0d0d12]/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/[0.12] z-50 overflow-hidden">
          {/* Sidebar Presets */}
          <div className="w-44 border-r border-white/[0.12] p-2 bg-[#0a0a0f]/50">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 py-2">
              Quick Filters
            </div>
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                  selectedPreset === preset.id
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "text-white hover:bg-white/[0.08]"
                }`}
              >
                {selectedPreset === preset.id && (
                  <Check className="h-4 w-4 flex-shrink-0" />
                )}
                <span className="truncate">{preset.label}</span>
              </button>
            ))}
          </div>

          {/* Calendar Panel */}
          <div className="w-72 p-4 bg-[#0a0a0f]/30">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              {selectedPreset === "custom" ? "Select Date Range" : "Calendar View"}
            </div>
            
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-1 hover:bg-white/[0.1] rounded transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              <span className="text-sm font-medium text-white">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-1 hover:bg-white/[0.1] rounded transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-center text-xs text-muted-foreground py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const isSelected = isDateSelected(day.date)
                const isStart = isStartDate(day.date)
                const isEnd = isEndDate(day.date)
                const inRange = isInRange(day.date)
                
                return (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(day.date)}
                    className={`relative h-8 w-8 text-xs rounded-lg transition-colors ${
                      !day.isCurrentMonth
                        ? "text-muted-foreground opacity-40"
                        : isSelected
                        ? "bg-blue-500 text-white font-medium"
                        : inRange
                        ? "bg-blue-500/30 text-white"
                        : "text-white hover:bg-white/[0.1]"
                    } ${isStart || isEnd ? 'bg-blue-500 ring-2 ring-blue-400' : ''}`}
                  >
                    {day.date.getDate()}
                  </button>
                )
              })}
            </div>

            {/* Selected Range Display */}
            {(startDate || endDate) && (
              <div className="mt-4 p-3 rounded-lg bg-white/[0.05] border border-white/[0.12]">
                <div className="text-xs text-muted-foreground mb-1">Selected Range</div>
                <div className="text-sm text-white font-medium">
                  {startDate ? formatDate(startDate) : 'Start date'} - {endDate ? formatDate(endDate) : 'End date'}
                </div>
              </div>
            )}

            {/* Action Buttons - Always Visible */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-white/[0.12]">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.12] text-white text-sm hover:bg-white/[0.1] transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={!startDate || !endDate}
                className="flex-1 px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-white/[0.05] disabled:text-muted-foreground disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Format single date for display
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
