"use client"

import React, { useState, useEffect } from "react"

export default function SheetDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({
    sheetAccessible: false,
    gvizAccessible: false,
    sheetName: '',
    dataCount: 0,
  })

  useEffect(() => {
    async function debug() {
      const spreadsheetId = '13ruAstGIxEl9y-9BQ1eWJsfTkYiwPAYK5obLug2q7N0'
      const sheetName = 'Work With Us Leads'
      
      const info: any = {
        spreadsheetId,
        sheetName,
        checks: []
      }

      // Test 1: Check if sheet is accessible via gviz
      try {
        const gvizUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`
        const response = await fetch(gvizUrl)
        info.gvizStatus = response.status
        info.gvizAccessible = response.ok
        
        if (response.ok) {
          const text = await response.text()
          const jsonText = text.substring(text.indexOf('{')).slice(0, -2)
          const json = JSON.parse(jsonText)
          info.dataCount = json.table.rows?.length || 0
          info.cols = json.table.cols?.map((c: any) => c.label || c.id)
        } else {
          info.gvizError = await response.text()
        }
      } catch (err: any) {
        info.gvizError = err.message
      }

      // Test 2: Try published HTML version
      try {
        const htmlUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/htmlview`
        const response = await fetch(htmlUrl)
        info.htmlStatus = response.status
        info.htmlAccessible = response.ok
      } catch (err: any) {
        info.htmlError = err.message
      }

      // Test 3: Check sheet metadata
      try {
        const metadataUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/metadata`
        const response = await fetch(metadataUrl)
        info.metadataStatus = response.status
      } catch (err: any) {
        info.metadataError = err.message
      }

      setDebugInfo(info)
    }
    debug()
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Google Sheet Debug</h1>
        
        <div className="space-y-4">
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-lg font-semibold text-white mb-4">Sheet Info</h2>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Spreadsheet ID:</span> <code className="text-blue-400">{debugInfo.spreadsheetId}</code></p>
              <p><span className="text-muted-foreground">Sheet Name:</span> <code className="text-blue-400">{debugInfo.sheetName}</code></p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-lg font-semibold text-white mb-4">Accessibility Checks</h2>
            <div className="space-y-3">
              <CheckItem 
                label="gviz Endpoint" 
                accessible={debugInfo.gvizAccessible} 
                status={debugInfo.gvizStatus}
                error={debugInfo.gvizError}
              />
              <CheckItem 
                label="HTML View" 
                accessible={debugInfo.htmlAccessible} 
                status={debugInfo.htmlStatus}
                error={debugInfo.htmlError}
              />
              <CheckItem 
                label="Metadata" 
                accessible={undefined} 
                status={debugInfo.metadataStatus}
                error={debugInfo.metadataError}
              />
            </div>
          </div>

          {debugInfo.gvizAccessible && (
            <div className="glass-card p-6 rounded-xl">
              <h2 className="text-lg font-semibold text-white mb-4">Data Found!</h2>
              <p className="text-green-400 mb-4">✅ Sheet is accessible. Found <strong>{debugInfo.dataCount}</strong> rows.</p>
              
              {debugInfo.cols && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Columns:</p>
                  <div className="flex flex-wrap gap-2">
                    {debugInfo.cols.map((col: string, i: number) => (
                      <span key={i} className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!debugInfo.gvizAccessible && (
            <div className="glass-card p-6 rounded-xl border border-red-500/20">
              <h2 className="text-lg font-semibold text-white mb-4">❌ Sheet Not Accessible</h2>
              <p className="text-muted-foreground mb-4">
                The Google Sheet is not publicly accessible. To fix this:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Open your Google Sheet</li>
                <li>Click the <strong>Share</strong> button (top right)</li>
                <li>Under "General access", click <strong>Change to anyone with the link</strong></li>
                <li>Set role to <strong>Viewer</strong></li>
                <li>Click <strong>Done</strong></li>
                <li>Refresh this page</li>
              </ol>
              
              <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm text-yellow-400">
                  <strong>Alternative:</strong> Configure Google Sheets API credentials in <code className="text-yellow-300">.env.local</code>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CheckItem({ label, accessible, status, error }: any) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${
          accessible === true ? 'bg-green-500' : 
          accessible === false ? 'bg-red-500' : 
          'bg-yellow-500'
        }`} />
        <span className="text-sm text-white">{label}</span>
      </div>
      <div className="text-right">
        {status && <p className="text-xs text-muted-foreground">Status: {status}</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </div>
  )
}
