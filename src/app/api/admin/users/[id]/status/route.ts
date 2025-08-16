import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const { status } = await request.json()
    const userId = params.id

    // Validate status value
    if (!['pending', 'approved', 'closed'].includes(status)) {
      return NextResponse.json({
        success: false,
        error: "Invalid status value"
      }, { status: 400 })
    }

    // Check admin authorization
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized"
      }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    
    // Verify admin token and check if user exists in admins table
    // In a real implementation, you would decode and verify the JWT token
    // For now, we'll do a basic check
    if (!token) {
      return NextResponse.json({
        success: false,
        error: "Invalid admin token"
      }, { status: 401 })
    }

    // Optional: Add additional admin verification by checking admins table
    // This would require getting the admin user ID from the token
    // const { data: adminUser, error: adminError } = await supabase
    //   .from("admins")
    //   .select("id, email")
    //   .eq("id", adminUserId)
    //   .single()
    
    // if (adminError || !adminUser) {
    //   return NextResponse.json({
    //     success: false,
    //     error: "Admin access required"
    //   }, { status: 403 })
    // }

    // Update user status in database
    const { data, error } = await supabase
      .from("users")
      .update({ status })
      .eq("id", userId)
      .select("id, name, email, status")
      .single()

    if (error) {
      console.error("Error updating user status:", error)
      return NextResponse.json({
        success: false,
        error: "Failed to update user status"
      }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({
        success: false,
        error: "User not found"
      }, { status: 404 })
    }

    // Log the status change for audit trail
    console.log(`Admin updated user ${userId} status to ${status}`)

    return NextResponse.json({
      success: true,
      data: {
        user: data,
        message: `User status updated to ${status}`
      }
    })

  } catch (error) {
    console.error("Error in status update API:", error)
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 })
  }
}