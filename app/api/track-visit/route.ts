import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const SITE_VISIT_PATH = path.join(process.cwd(), 'siteVisit.json')

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-real-ip') ?? 'unknown'
    const userAgent = request.headers.get('user-agent') ?? 'unknown'
    
    // Read existing visits
    let visits = []
    try {
      const data = await fs.readFile(SITE_VISIT_PATH, 'utf-8')
      visits = JSON.parse(data)
    } catch (error) {
      // File doesn't exist or is invalid, start with empty array
    }

    // Add new visit
    visits.push({
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
      path: request.nextUrl.pathname
    })

    // Save to file
    await fs.writeFile(SITE_VISIT_PATH, JSON.stringify(visits, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to track visit:', error)
    return NextResponse.json({ error: 'Failed to track visit' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const data = await fs.readFile(SITE_VISIT_PATH, 'utf-8')
    return NextResponse.json(JSON.parse(data))
  } catch (error) {
    return NextResponse.json([], { status: 200 })
  }
}
