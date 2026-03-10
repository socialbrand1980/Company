"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Briefcase,
  PieChart,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CRMLayoutProps {
  children: React.ReactNode
}

const navItems = [
  { href: "/crm", label: "Dashboard", icon: LayoutDashboard },
  { href: "/crm/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/crm/leads", label: "Leads", icon: Users },
  { href: "/crm/pipeline", label: "Pipeline", icon: Briefcase },
  { href: "/crm/clients", label: "Clients", icon: PieChart },
]

export default function CRMLayout({ children }: CRMLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch('/api/login', { method: 'DELETE' })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-[#0d0d12]/95 backdrop-blur-xl border-r border-white/[0.08] transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20",
          "lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-blue-400" />
            </div>
            {sidebarOpen && (
              <span className="text-white font-semibold text-sm">CRM</span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex p-1.5 hover:bg-white/[0.05] rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="h-4 w-4 text-muted-foreground" /> : <Menu className="h-4 w-4 text-muted-foreground" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 hover:bg-white/[0.05] rounded-lg transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    : "text-muted-foreground hover:text-white hover:bg-white/[0.05]"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-blue-400" : "group-hover:text-white"
                )} />
                {sidebarOpen && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
                {isActive && sidebarOpen && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Section - Logout */}
        <div className="p-3 border-t border-white/[0.08]">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-red-400 hover:bg-red-500/10 w-full"
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          "transition-all duration-300",
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        )}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.08]">
          <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
            {/* Left: Mobile Menu */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-white/[0.05] rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5 text-muted-foreground" />
            </button>

            {/* Page Title */}
            <div className="hidden lg:block">
              <h1 className="text-lg font-semibold text-white">
                {pathname === '/crm' ? 'Dashboard' :
                 pathname === '/crm/analytics' ? 'Analytics' :
                 pathname === '/crm/leads' ? 'Leads' :
                 pathname === '/crm/pipeline' ? 'Pipeline' :
                 pathname === '/crm/clients' ? 'Clients' :
                 'CRM'}
              </h1>
            </div>

            {/* Right: User Info */}
            <div className="flex items-center gap-3 ml-auto">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/[0.08] flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-400">A</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-white">Admin</p>
                  <p className="text-xs text-muted-foreground">admin@socialbrand1980.com</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
