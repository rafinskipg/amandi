import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken, getAdminToken } from './admin-auth'

/**
 * Middleware to protect admin API routes
 * Returns null if authenticated, or a NextResponse with error if not
 */
export async function requireAdminAuth(request: NextRequest): Promise<NextResponse | null> {
  const token = getAdminToken(request)
  
  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  const isValid = await verifyAdminToken(token)
  
  if (!isValid) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    )
  }

  return null // Authentication successful
}

