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
    
    console.log('📍 Script path:', scriptPath)
    
    // Check if script exists
    if (!fs.existsSync(scriptPath)) {
      console.error('❌ Python script not found:', scriptPath)
      return NextResponse.json(
        { error: 'Python script not found', path: scriptPath },
        { status: 500 }
      )
    }
    
    // Check if Python is available
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3'
    
    console.log('🐍 Using Python command:', pythonCommand)

    return new Promise((resolve) => {
      // Spawn Python process
      const pythonProcess = spawn(pythonCommand, [scriptPath, JSON.stringify(reportData)], {
        cwd: process.cwd(),
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
      })

      let stdout = ''
      let stderr = ''

      pythonProcess.stdout.on('data', (data) => {
        const str = data.toString()
        stdout += str
        console.log('Python stdout:', str)
      })

      pythonProcess.stderr.on('data', (data) => {
        const str = data.toString()
        stderr += str
        console.error('Python stderr:', str)
      })

      pythonProcess.on('close', (code) => {
        console.log('Python process closed with code:', code)
        
        if (code === 0) {
          // Parse Python output
          const lines = stdout.trim().split('\n')
          const lastLine = lines[lines.length - 1]
          
          try {
            const result = JSON.parse(lastLine)
            
            if (result.success) {
              // Read the generated PDF
              const pdfPath = path.join(process.cwd(), result.file)
              
              console.log('📄 Looking for PDF at:', pdfPath)
              
              if (fs.existsSync(pdfPath)) {
                const pdfBuffer = fs.readFileSync(pdfPath)
                
                console.log('✅ PDF read successfully, size:', pdfBuffer.length, 'bytes')
                
                // Clean up temporary chart files
                result.charts?.forEach((chartPath: string) => {
                  if (fs.existsSync(chartPath)) {
                    console.log('🧹 Cleaning up chart:', chartPath)
                    fs.unlinkSync(chartPath)
                  }
                })
                
                console.log('📤 Sending PDF response...')
                
                resolve(
                  new NextResponse(pdfBuffer, {
                    headers: {
                      'Content-Type': 'application/pdf',
                      'Content-Disposition': `attachment; filename="${result.file}"`
                    }
                  })
                )
              } else {
                console.error('❌ PDF file not found at:', pdfPath)
                resolve(
                  NextResponse.json(
                    { error: 'PDF file not found', path: pdfPath, stdout, stderr },
                    { status: 500 }
                  )
                )
              }
            } else {
              console.error('❌ Python script returned failure')
              resolve(
                NextResponse.json(
                  { error: 'Failed to generate report', result, stdout, stderr },
                  { status: 500 }
                )
              )
            }
          } catch (e: any) {
            console.error('❌ Failed to parse Python output:', e.message)
            console.log('Full stdout:', stdout)
            resolve(
              NextResponse.json(
                { error: 'Failed to parse Python output', message: e.message, stdout, stderr },
                { status: 500 }
              )
            )
          }
        } else {
          console.error('❌ Python script failed with code:', code)
          resolve(
            NextResponse.json(
              { error: 'Python script failed', code, stdout, stderr },
              { status: 500 }
            )
          )
        }
      })

      pythonProcess.on('error', (err: any) => {
        console.error('❌ Failed to start Python process:', err.message)
        resolve(
          NextResponse.json(
            { error: 'Failed to start Python process', message: err.message, stderr },
            { status: 500 }
          )
        )
      })
    })

  } catch (error: any) {
    console.error('❌ Export error:', error.message)
    return NextResponse.json(
      { error: 'Failed to export report', message: error.message },
      { status: 500 }
    )
  }
}
