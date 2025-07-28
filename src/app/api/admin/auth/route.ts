import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../../lib/supabase'
import bcrypt from 'bcryptjs'

// Admin login API endpoint
export async function POST(request: NextRequest) {
  try {
    const { email, password, action } = await request.json()

    if (action === 'login') {
      // Try to validate admin login from database
      const { data: admin, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single()

      if (error || !admin) {
        return NextResponse.json(
          { error: 'Admin not found or inactive' },
          { status: 401 }
        )
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, admin.password_hash)
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid password' },
          { status: 401 }
        )
      }

      // Update login info
      await supabase.rpc('update_admin_login', { p_admin_id: admin.id })

      // Log activity
      await supabase.rpc('log_admin_activity', {
        p_admin_id: admin.id,
        p_action: 'login',
        p_details: { email: admin.email },
        p_ip_address: request.headers.get('x-forwarded-for') || null,
        p_user_agent: request.headers.get('user-agent') || null
      })

      // Return session data (without password)
      const adminSession = {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions,
        avatar: admin.avatar,
        department: admin.department
      }

      return NextResponse.json({ admin: adminSession })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Admin auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}