"use client"

import React, { useState, useEffect } from "react"

export default function CRMTestPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function testAPI() {
      try {
        const response = await fetch('/api/crm/leads')
        const result = await response.json()
        setData(result)
        console.log('API Result:', result)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    testAPI()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Testing API...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">CRM API Test</h1>
        
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <div className="glass-card p-6 rounded-xl mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Response:</h2>
          <pre className="text-sm text-muted-foreground overflow-auto max-h-96">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>

        {data?.leads?.length > 0 && (
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-lg font-semibold text-white mb-4">
              Leads ({data.leads.length})
            </h2>
            <div className="space-y-4">
              {data.leads.map((lead: any, index: number) => (
                <div key={index} className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{lead.brandname || lead.brandName || "N/A"}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {lead.leadstatus || lead.leadStatus || "New"}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Email: {lead.email}</p>
                    <p>Industry: {lead.industry}</p>
                    <p>Budget: {lead.budget}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data?.leads?.length === 0 && (
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-lg font-semibold text-white mb-4">No Leads Found</h2>
            <p className="text-muted-foreground mb-4">{data.message || "The spreadsheet might be empty or not accessible."}</p>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">Troubleshooting:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Make sure the Google Sheet is shared with "Anyone with link can view"</li>
                <li>Check if there's data in the spreadsheet</li>
                <li>Verify the spreadsheet ID is correct</li>
                <li>Or configure Google Sheets API credentials in .env.local</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
