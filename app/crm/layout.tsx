"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  Kanban, 
  Briefcase, 
  BarChart3, 
  Settings,
  Search,
  Bell,
  Menu,
  X,
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CRMLayoutProps {
  children: React.ReactNode
}

const navItems = [
  { href: "/crm", label: "Dashboard", icon: LayoutDashboard },
  { href: "/crm/leads", label: "Leads", icon: Users },
  { href: "/crm/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/crm/clients", label: "Clients", icon: Briefcase },
  { href: "/crm/analytics", label: "Analytics", icon: BarChart3 },
]

export default function CRMLayout({ children }: CRMLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-[#0d0d12]/80 backdrop-blur-xl border-r border-white/[0.05] transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20",
          "lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">SB</span>
            </div>
            {sidebarOpen && (
              <span className="text-white font-semibold text-lg">SocialBrand</span>
            )}
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex p-1.5 hover:bg-white/5 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="h-4 w-4 text-muted-foreground" /> : <Menu className="h-4 w-4 text-muted-foreground" />}
          </button>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
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
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-blue-400" : "group-hover:text-foreground"
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

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/[0.05]">
          <Link
            href="/crm/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && (
              <span className="text-sm font-medium">Settings</span>
            )}
          </Link>
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && (
              <span className="text-sm font-medium">Exit CRM</span>
            )}
          </Link>
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
        <header className="sticky top-0 z-30 h-16 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.05]">
          <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
            {/* Left: Mobile Menu + Search */}
            <div className="flex items-center gap-4 flex-1">
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <Menu className="h-5 w-5 text-muted-foreground" />
              </button>
              
              <div className="relative max-w-md flex-1 hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search leads, clients..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] focus:border-blue-500/50 focus:outline-none text-foreground text-sm transition-colors"
                />
              </div>
            </div>

            {/* Right: Notifications + Profile */}
            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-white/5 rounded-lg transition-colors">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              </button>
              
              <div className="flex items-center gap-3 pl-3 border-l border-white/[0.08]">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/[0.08] flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-400">A</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-foreground">Admin</p>
                  <p className="text-xs text-muted-foreground">admin@socialbrand.com</p>
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
    </div>
  )
}
