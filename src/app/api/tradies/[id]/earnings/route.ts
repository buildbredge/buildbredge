import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/lib/payment-service'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const tradieId = params.id

    if (!tradieId) {
      return NextResponse.json(
        { error: 'Tradie ID is required' },
        { status: 400 }
      )
    }

    // Verify tradie exists and has tradie role
    const { data: tradie, error: tradieError } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        company,
        parent_tradie_id,
        user_roles!inner (
          role_type
        )
      `)
      .eq('id', tradieId)
      .eq('user_roles.role_type', 'tradie')
      .single()

    if (tradieError || !tradie) {
      return NextResponse.json(
        { error: 'Tradie not found' },
        { status: 404 }
      )
    }

    // Get earnings summary
    const earningsSummary = await PaymentService.getTradieEarningsSummary(tradieId)

    // Get detailed escrow accounts
    const { data: escrowAccounts, error: escrowError } = await supabase
      .from('escrow_accounts')
      .select(`
        id,
        gross_amount,
        platform_fee,
        affiliate_fee,
        tax_withheld,
        net_amount,
        status,
        protection_start_date,
        protection_end_date,
        released_at,
        payment:payments (
          id,
          amount,
          created_at,
          confirmed_at,
          projects (
            id,
            description
          )
        )
      `)
      .eq('tradie_id', tradieId)
      .order('created_at', { ascending: false })

    if (escrowError) {
      console.error('Error fetching escrow accounts:', escrowError)
    }

    // Get withdrawal history
    const { data: withdrawals, error: withdrawalError } = await supabase
      .from('withdrawals')
      .select(`
        id,
        requested_amount,
        processing_fee,
        final_amount,
        status,
        reference_number,
        requested_at,
        completed_at,
        escrow_account_id
      `)
      .eq('tradie_id', tradieId)
      .order('requested_at', { ascending: false })

    if (withdrawalError) {
      console.error('Error fetching withdrawals:', withdrawalError)
    }

    // Get affiliate earnings if this is a parent tradie
    let affiliateEarnings = null
    if (!tradie.parent_tradie_id) {
      affiliateEarnings = await PaymentService.getAffiliateEarningsSummary(tradieId)
      
      // Get detailed affiliate earnings
      const { data: affiliateDetails, error: affiliateError } = await supabase
        .from('affiliate_earnings')
        .select(`
          id,
          child_tradie_id,
          fee_amount,
          status,
          earned_at,
          available_at,
          withdrawn_at,
          child_tradie:users!affiliate_earnings_child_tradie_id_fkey (
            id,
            name,
            company
          ),
          payment:payments (
            id,
            amount,
            projects (
              id,
              description
            )
          )
        `)
        .eq('parent_tradie_id', tradieId)
        .order('earned_at', { ascending: false })

      if (!affiliateError && affiliateDetails) {
        affiliateEarnings = {
          ...affiliateEarnings,
          details: affiliateDetails
        }
      }
    }

    // Calculate available balance (released escrow minus withdrawn amounts)
    const availableBalance = (escrowAccounts || [])
      .filter(escrow => escrow.status === 'released')
      .reduce((total, escrow) => {
        const withdrawn = (withdrawals || [])
          .filter(w => w.escrow_account_id === escrow.id && w.status === 'completed')
          .reduce((sum, w) => sum + parseFloat(w.final_amount.toString()), 0)
        
        return total + (parseFloat(escrow.net_amount.toString()) - withdrawn)
      }, 0)

    // Calculate protection period status
    const protectionPeriodStatus = (escrowAccounts || [])
      .filter(escrow => escrow.status === 'held')
      .map(escrow => {
        const endDate = new Date(escrow.protection_end_date)
        const now = new Date()
        const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        
        const payment = Array.isArray(escrow.payment) ? escrow.payment[0] : escrow.payment
        const projects = Array.isArray(payment?.projects) ? payment.projects[0] : payment?.projects
        return {
          escrowId: escrow.id,
          projectTitle: projects?.description || 'Unknown Project',
          amount: parseFloat(escrow.net_amount.toString()),
          daysRemaining: Math.max(0, daysRemaining),
          autoReleaseDate: escrow.protection_end_date
        }
      })

    return NextResponse.json({
      success: true,
      tradie: {
        id: tradie.id,
        name: tradie.name,
        email: tradie.email,
        company: tradie.company,
        isAffiliate: !!tradie.parent_tradie_id
      },
      earnings: {
        summary: earningsSummary,
        availableBalance,
        escrowAccounts: escrowAccounts || [],
        withdrawals: withdrawals || [],
        protectionPeriodStatus,
        affiliateEarnings
      }
    })

  } catch (error: any) {
    console.error('Error fetching tradie earnings:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tradie earnings' },
      { status: 500 }
    )
  }
}