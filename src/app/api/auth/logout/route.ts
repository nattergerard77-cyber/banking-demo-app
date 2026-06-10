import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json(
    { success: true, message: 'Déconnecté avec succès' },
    { status: 200 }
  )

  response.cookies.set('banking_demo_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  return response
}
