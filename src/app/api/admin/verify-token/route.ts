import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, AdminUser } from '@/lib/adminAuth'

// Token verification endpoint - Protected
async function handleTokenVerification(request: NextRequest, adminUser: AdminUser) {
  try {
    return NextResponse.json({
      success: true,
      valid: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      }
    })
  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { error: 'Token verification failed' },
      { status: 500 }
    )
  }
}

// Export protected GET handler
export const GET = withAdminAuth(handleTokenVerification)