import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'amandi2024'
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production')

/**
 * POST - Admin login
 * Returns a JWT token for authenticated requests
 */
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    // Validate password
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = await new SignJWT({ role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET)

    return NextResponse.json({ 
      token,
      expiresIn: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    })
  } catch (error: any) {
    console.error('Error in admin auth:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

