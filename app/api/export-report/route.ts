import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { leads, dateRange, stats } = body

    console.log('📊 Generating analytics report...')
    console.log('Date range:', dateRange)
    console.log('Total leads:', leads?.length)

    // Prepare data for Python script
    const reportData = {
      leads: leads || [],
      dateRange: dateRange || { label: 'All time' },
      stats: stats || {}
    }

    // Get absolute path to Python script
    const scriptPath = path.join(process.cwd(), 'scripts', 'generate_report.py')
    
    // Check if Python is available
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3'

    return new Promise((resolve) => {
      // Spawn Python process
      const pythonProcess = spawn(pythonCommand, [scriptPath, JSON.stringify(reportData)])

      let stdout = ''
      let stderr = ''

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString()
        console.log('Python stdout:', data.toString())
      })

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString()
        console.error('Python stderr:', data.toString())
      })

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          // Parse Python output
          const lines = stdout.trim().split('\n')
          const lastLine = lines[lines.length - 1]
          
          try {
            const result = JSON.parse(lastLine)
            
            if (result.success) {
              // Read the generated PDF
              const pdfPath = path.join(process.cwd(), result.file)
              
              if (fs.existsSync(pdfPath)) {
                const pdfBuffer = fs.readFileSync(pdfPath)
                
                // Clean up temporary files
                result.charts?.forEach((chartPath: string) => {
                  if (fs.existsSync(chartPath)) {
                    fs.unlinkSync(chartPath)
                  }
                })
                // Optionally delete PDF after sending (or keep it)
                // fs.unlinkSync(pdfPath)
                
                console.log('✅ Report generated successfully')
                
                resolve(
                  new NextResponse(pdfBuffer, {
                    headers: {
                      'Content-Type': 'application/pdf',
                      'Content-Disposition': `attachment; filename="${result.file}"`
                    }
                  })
                )
              } else {
                resolve(
                  NextResponse.json(
                    { error: 'PDF file not found' },
                    { status: 500 }
                  )
                )
              }
            } else {
              resolve(
                NextResponse.json(
                  { error: 'Failed to generate report' },
                  { status: 500 }
                )
              )
            }
          } catch (e) {
            console.log('Full output:', stdout)
            resolve(
              NextResponse.json(
                { error: 'Failed to parse Python output', details: stderr },
                { status: 500 }
              )
            )
          }
        } else {
          resolve(
            NextResponse.json(
              { error: 'Python script failed', code, stderr },
              { status: 500 }
            )
          )
        }
      })

      pythonProcess.on('error', (err) => {
        console.error('Failed to start Python process:', err)
        resolve(
          NextResponse.json(
            { error: 'Failed to start Python process', message: err.message },
            { status: 500 }
          )
        )
      })
    })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    )
  }
}
