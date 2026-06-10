import { NextRequest, NextResponse } from 'next/server'
import { verifyDemoCredentials } from '@/lib/demoAuth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { loginId, password } = body

    if (!loginId || !password) {
      return NextResponse.json(
        { error: 'Identifiant et mot de passe requis' },
        { status: 400 }
      )
    }

    if (!verifyDemoCredentials({ loginId, password })) {
      return NextResponse.json(
        { error: 'Identifiant ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    const response = NextResponse.json(
      { success: true, message: 'Authentifié avec succès' },
      { status: 200 }
    )

    response.cookies.set('banking_demo_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    })

    return response
  } catch {
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
