import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const session = request.cookies.get('banking_demo_session')

  if (session?.value === 'authenticated') {
    return NextResponse.json({ authenticated: true }, { status: 200 })
  }

  return NextResponse.json({ authenticated: false }, { status: 401 })
}
