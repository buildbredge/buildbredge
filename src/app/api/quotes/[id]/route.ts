import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { smtpEmailService } from "@/lib/smtp-email"

export const dynamic = "force-dynamic"

// GET /api/quotes/[id] - Get quote details for payment processing
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const quoteId = params.id
    const { searchParams } = new URL(request.url)
    const includeProject = searchParams.get('include_project') === 'true'

    if (!quoteId) {
      return NextResponse.json(
        { error: 'Quote ID is required' },
        { status: 400 }
      )
    }

    // Check if this is a test quote ID for payment testing
    if (quoteId.startsWith('test-quote-')) {
      // Return mock data for testing
      const mockQuote = {
        id: quoteId,
        project_id: `test-project-${Date.now()}`,
        tradie_id: 'test-tradie-1',
        price: 500.00,
        description: 'Test quote for payment system',
        status: 'accepted',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        project: includeProject ? {
          id: `test-project-${Date.now()}`,
          title: 'Test Payment Project',
          description: 'This is a test project for payment system testing',
          user_id: `test-payer-${Date.now()}`,
          status: 'agreed'
        } : null,
        tradie: {
          id: 'test-tradie-1',
          name: 'Test Tradie',
          email: 'test@tradie.com',
          company: 'Test Tradie Company'
        },
        // Add computed fields for payment processing
        project_title: 'Test Payment Project',
        tradie_name: 'Test Tradie',
        is_affiliate: false,
        parent_tradie_name: null
      }

      return NextResponse.json({
        success: true,
        quote: mockQuote
      })
    }

    // Get quote with related data
    const { data: quote, error } = await supabase
      .from('quotes')
      .select(`
        id,
        project_id,
        tradie_id,
        price,
        description,
        status,
        created_at,
        updated_at,
        project:projects (
          id,
          description,
          location,
          detailed_description,
          status,
          user_id
        ),
        tradie:users!quotes_tradie_id_fkey (
          id,
          name,
          email,
          company,
          parent_tradie_id,
          parent_tradie:users!parent_tradie_id_fkey (
            id,
            name,
            company
          )
        )
      `)
      .eq('id', quoteId)
      .single()

    if (error) {
      console.error('Error fetching quote:', error)
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Quote not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch quote details' },
        { status: 500 }
      )
    }

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    // Format the response
    const project = Array.isArray(quote.project) ? quote.project[0] : quote.project
    const tradie = Array.isArray(quote.tradie) ? quote.tradie[0] : quote.tradie
    const parentTradie = Array.isArray(tradie?.parent_tradie) ? tradie.parent_tradie[0] : tradie?.parent_tradie
    const formattedQuote = {
      ...quote,
      // Add computed fields for payment processing
      project_title: project?.description || 'Unknown Project',
      tradie_name: tradie?.name || 'Unknown Tradie',
      is_affiliate: !!tradie?.parent_tradie_id,
      parent_tradie_name: parentTradie?.name
    }

    return NextResponse.json({
      success: true,
      quote: formattedQuote
    })

  } catch (error: any) {
    console.error('Error in quote API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/quotes/[id] - 更新报价
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const quoteId = params.id
    const { price, description } = await request.json()

    // 验证必需字段
    if (!price || !description) {
      return NextResponse.json(
        { error: "Missing required fields: price, description" },
        { status: 400 }
      )
    }

    if (price <= 0) {
      return NextResponse.json(
        { error: "Price must be greater than 0" },
        { status: 400 }
      )
    }

    // 获取原报价信息
    const { data: originalQuote, error: fetchError } = await supabase
      .from('quotes')
      .select(`
        id,
        project_id,
        tradie_id,
        price,
        description,
        status,
        project:projects(
          id,
          description,
          location,
          email,
          user_id,
          status
        ),
        tradie:users(
          id,
          name,
          email,
          company
        )
      `)
      .eq('id', quoteId)
      .single()

    if (fetchError || !originalQuote) {
      return NextResponse.json(
        { error: "Quote not found" },
        { status: 404 }
      )
    }

    // 检查报价状态是否可以修改
    if (originalQuote.status !== 'pending') {
      return NextResponse.json(
        { error: "Only pending quotes can be updated" },
        { status: 400 }
      )
    }

    // 获取项目和技师信息
    const project = Array.isArray(originalQuote.project) ? originalQuote.project[0] : originalQuote.project
    const tradie = Array.isArray(originalQuote.tradie) ? originalQuote.tradie[0] : originalQuote.tradie

    // 检查项目状态
    if (project?.status !== 'published' && project?.status !== 'negotiating') {
      return NextResponse.json(
        { error: "Project is not accepting quote updates" },
        { status: 400 }
      )
    }

    // 更新报价
    const { data: updatedQuote, error: updateError } = await supabase
      .from('quotes')
      .update({
        price: parseFloat(price),
        description: description.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', quoteId)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating quote:", updateError)
      return NextResponse.json(
        { error: "Failed to update quote" },
        { status: 500 }
      )
    }

    // 发送邮件通知项目拥有者
    try {
      await smtpEmailService.sendQuoteUpdateNotification({
        to: project?.email || '',
        projectId: project?.id || '',
        projectTitle: project?.description || '',
        projectLocation: project?.location || '',
        tradieId: tradie?.id || '',
        tradieName: tradie?.name || '',
        tradieCompany: tradie?.company || '',
        oldPrice: originalQuote.price,
        newPrice: parseFloat(price),
        quoteDescription: description.trim(),
        tradieEmail: tradie?.email || ''
      })
      console.log("✅ Quote update notification email sent successfully")
    } catch (emailError) {
      console.error("❌ Failed to send quote update notification email:", emailError)
      // 不让邮件错误影响报价更新成功
    }

    return NextResponse.json({
      success: true,
      message: "Quote updated successfully",
      quote: updatedQuote
    })

  } catch (error) {
    console.error("Error updating quote:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/quotes/[id] - 删除报价
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const quoteId = params.id

    // 获取报价信息
    const { data: quote, error: fetchError } = await supabase
      .from('quotes')
      .select(`
        id,
        project_id,
        tradie_id,
        price,
        description,
        status,
        project:projects(
          id,
          description,
          location,
          email,
          user_id,
          status
        ),
        tradie:users(
          id,
          name,
          email,
          company
        )
      `)
      .eq('id', quoteId)
      .single()

    if (fetchError || !quote) {
      return NextResponse.json(
        { error: "Quote not found" },
        { status: 404 }
      )
    }

    // 检查报价状态是否可以删除
    if (quote.status !== 'pending') {
      return NextResponse.json(
        { error: "Only pending quotes can be deleted" },
        { status: 400 }
      )
    }

    // 获取项目和技师信息
    const project = Array.isArray(quote.project) ? quote.project[0] : quote.project
    const tradie = Array.isArray(quote.tradie) ? quote.tradie[0] : quote.tradie

    // 删除报价
    const { error: deleteError } = await supabase
      .from('quotes')
      .delete()
      .eq('id', quoteId)

    if (deleteError) {
      console.error("Error deleting quote:", deleteError)
      return NextResponse.json(
        { error: "Failed to delete quote" },
        { status: 500 }
      )
    }

    // 发送邮件通知项目拥有者
    try {
      await smtpEmailService.sendQuoteDeletionNotification({
        to: project?.email || '',
        projectId: project?.id || '',
        projectTitle: project?.description || '',
        projectLocation: project?.location || '',
        tradieId: tradie?.id || '',
        tradieName: tradie?.name || '',
        tradieCompany: tradie?.company || '',
        quotePrice: quote.price,
        quoteDescription: quote.description,
        tradieEmail: tradie?.email || ''
      })
      console.log("✅ Quote deletion notification email sent successfully")
    } catch (emailError) {
      console.error("❌ Failed to send quote deletion notification email:", emailError)
      // 不让邮件错误影响报价删除成功
    }

    return NextResponse.json({
      success: true,
      message: "Quote deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting quote:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}