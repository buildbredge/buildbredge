import { supabase } from '@/lib/supabase'
import { stripe, createPaymentIntent, PaymentIntentMetadata, FeeBreakdown } from '@/lib/stripe'
import type { Database } from '@/lib/supabase'

type Payment = Database['public']['Tables']['payments']['Row']
type EscrowAccount = Database['public']['Tables']['escrow_accounts']['Row']
type Withdrawal = Database['public']['Tables']['withdrawals']['Row']

export class PaymentService {
  // Calculate fees for a payment
  static async calculateFees(amount: number, tradieId: string): Promise<FeeBreakdown> {
    const { data, error } = await supabase
      .rpc('calculate_payment_fees', {
        p_amount: amount,
        p_tradie_id: tradieId,
        p_currency: 'NZD'
      })
      .single()

    if (error) {
      console.error('Error calculating fees:', error)
      throw new Error('Failed to calculate payment fees')
    }

    return {
      platformFee: parseFloat(data.platform_fee),
      affiliateFee: parseFloat(data.affiliate_fee),
      taxAmount: parseFloat(data.tax_amount),
      netAmount: parseFloat(data.net_amount),
      parentTradieId: data.parent_tradie_id
    }
  }

  // Create payment intent and database record
  static async createPayment(
    projectId: string,
    quoteId: string,
    payerId: string,
    tradieId: string,
    amount: number,
    currency: string = 'NZD'
  ): Promise<{ paymentId: string; clientSecret: string; fees: FeeBreakdown }> {
    try {
      // Calculate fees
      const fees = await this.calculateFees(amount, tradieId)
      
      // Create payment record in database
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          project_id: projectId,
          quote_id: quoteId,
          payer_id: payerId,
          tradie_id: tradieId,
          amount,
          platform_fee: fees.platformFee,
          affiliate_fee: fees.affiliateFee,
          tax_amount: fees.taxAmount,
          net_amount: fees.netAmount,
          currency,
          status: 'pending',
          payment_method: 'stripe_card'
        })
        .select()
        .single()

      if (paymentError || !payment) {
        throw new Error(`Failed to create payment record: ${paymentError?.message}`)
      }

      // Create Stripe payment intent
      const metadata: PaymentIntentMetadata = {
        projectId,
        quoteId,
        tradieId,
        payerId,
        platformFee: fees.platformFee.toString(),
        affiliateFee: fees.affiliateFee.toString(),
        taxAmount: fees.taxAmount.toString(),
        netAmount: fees.netAmount.toString(),
        ...(fees.parentTradieId && { parentTradieId: fees.parentTradieId })
      }

      const paymentIntent = await createPaymentIntent(amount, currency, metadata)

      // Update payment record with Stripe payment intent ID
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          stripe_payment_intent_id: paymentIntent.id,
          status: 'processing'
        })
        .eq('id', payment.id)

      if (updateError) {
        throw new Error(`Failed to update payment with Stripe intent: ${updateError.message}`)
      }

      return {
        paymentId: payment.id,
        clientSecret: paymentIntent.client_secret!,
        fees
      }
    } catch (error: any) {
      console.error('Error creating payment:', error)
      throw new Error(`Payment creation failed: ${error.message}`)
    }
  }

  // Confirm payment and create escrow
  static async confirmPayment(paymentIntentId: string): Promise<EscrowAccount> {
    try {
      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      
      if (paymentIntent.status !== 'succeeded') {
        throw new Error(`Payment not successful: ${paymentIntent.status}`)
      }

      // Update payment status in database
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          confirmed_at: new Date().toISOString(),
          stripe_charge_id: paymentIntent.charges.data[0]?.id
        })
        .eq('stripe_payment_intent_id', paymentIntentId)
        .select()
        .single()

      if (paymentError || !payment) {
        throw new Error(`Failed to update payment status: ${paymentError?.message}`)
      }

      // Create escrow account
      const { data: escrowId, error: escrowError } = await supabase
        .rpc('create_escrow_account', { p_payment_id: payment.id })

      if (escrowError) {
        throw new Error(`Failed to create escrow account: ${escrowError.message}`)
      }

      // Get the created escrow account
      const { data: escrowAccount, error: fetchError } = await supabase
        .from('escrow_accounts')
        .select('*')
        .eq('id', escrowId)
        .single()

      if (fetchError || !escrowAccount) {
        throw new Error(`Failed to fetch escrow account: ${fetchError?.message}`)
      }

      // Update project status to 'escrowed'
      const { error: projectError } = await supabase
        .from('projects')
        .update({ status: 'escrowed' })
        .eq('id', payment.project_id)

      if (projectError) {
        console.warn('Failed to update project status:', projectError)
      }

      return escrowAccount
    } catch (error: any) {
      console.error('Error confirming payment:', error)
      throw new Error(`Payment confirmation failed: ${error.message}`)
    }
  }

  // Release escrow funds (manual)
  static async releaseEscrowFunds(
    escrowId: string,
    releasedBy: string,
    notes?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('release_escrow_funds', {
          p_escrow_id: escrowId,
          p_release_trigger: 'manual',
          p_released_by: releasedBy,
          p_notes: notes
        })

      if (error) {
        throw new Error(`Failed to release escrow funds: ${error.message}`)
      }

      // Update related project status to 'released'
      const { data: escrow } = await supabase
        .from('escrow_accounts')
        .select('payment_id, payments(project_id)')
        .eq('id', escrowId)
        .single()

      if (escrow?.payments?.project_id) {
        await supabase
          .from('projects')
          .update({ status: 'released' })
          .eq('id', escrow.payments.project_id)
      }

      return data
    } catch (error: any) {
      console.error('Error releasing escrow funds:', error)
      throw new Error(`Escrow release failed: ${error.message}`)
    }
  }

  // Get tradie earnings summary
  static async getTradieEarningsSummary(tradieId: string) {
    const { data, error } = await supabase
      .from('tradie_earnings_summary')
      .select('*')
      .eq('tradie_id', tradieId)
      .single()

    if (error) {
      console.error('Error fetching tradie earnings:', error)
      return null
    }

    return data
  }

  // Get affiliate earnings summary
  static async getAffiliateEarningsSummary(parentTradieId: string) {
    const { data, error } = await supabase
      .from('affiliate_earnings_summary')
      .select('*')
      .eq('parent_tradie_id', parentTradieId)
      .single()

    if (error) {
      console.error('Error fetching affiliate earnings:', error)
      return null
    }

    return data
  }

  // Request withdrawal
  static async requestWithdrawal(
    tradieId: string,
    escrowAccountId: string,
    amount: number,
    bankDetails: Record<string, any>
  ): Promise<Withdrawal> {
    try {
      // Generate unique reference number
      const referenceNumber = `WD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

      // Calculate final amount after fees
      const processingFee = 2.50 // From system config
      const finalAmount = amount - processingFee

      if (finalAmount <= 0) {
        throw new Error('Withdrawal amount must be greater than processing fee')
      }

      const { data: withdrawal, error } = await supabase
        .from('withdrawals')
        .insert({
          tradie_id: tradieId,
          escrow_account_id: escrowAccountId,
          requested_amount: amount,
          processing_fee: processingFee,
          final_amount: finalAmount,
          bank_details: bankDetails,
          reference_number: referenceNumber,
          status: 'pending'
        })
        .select()
        .single()

      if (error || !withdrawal) {
        throw new Error(`Failed to create withdrawal request: ${error?.message}`)
      }

      return withdrawal
    } catch (error: any) {
      console.error('Error requesting withdrawal:', error)
      throw new Error(`Withdrawal request failed: ${error.message}`)
    }
  }

  // Process automatic escrow releases (for cron job)
  static async processAutomaticEscrowReleases() {
    try {
      const { data, error } = await supabase
        .rpc('process_automatic_escrow_releases')

      if (error) {
        throw new Error(`Failed to process automatic releases: ${error.message}`)
      }

      return data || []
    } catch (error: any) {
      console.error('Error processing automatic escrow releases:', error)
      throw new Error(`Automatic release processing failed: ${error.message}`)
    }
  }

  // Get payment details
  static async getPaymentDetails(paymentId: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        projects (
          id,
          title,
          description,
          status
        ),
        payer:users!payments_payer_id_fkey (
          id,
          name,
          email
        ),
        tradie:users!payments_tradie_id_fkey (
          id,
          name,
          email,
          company
        )
      `)
      .eq('id', paymentId)
      .single()

    if (error) {
      console.error('Error fetching payment details:', error)
      return null
    }

    return data
  }

  // Get escrow account details
  static async getEscrowAccountDetails(escrowId: string): Promise<EscrowAccount | null> {
    const { data, error } = await supabase
      .from('escrow_accounts')
      .select(`
        *,
        payment:payments (
          id,
          amount,
          status,
          projects (
            id,
            title,
            description
          )
        ),
        tradie:users!escrow_accounts_tradie_id_fkey (
          id,
          name,
          email,
          company
        )
      `)
      .eq('id', escrowId)
      .single()

    if (error) {
      console.error('Error fetching escrow details:', error)
      return null
    }

    return data
  }

  // Refund payment
  static async refundPayment(
    paymentId: string,
    refundAmount?: number,
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
  ): Promise<boolean> {
    try {
      const { data: payment } = await supabase
        .from('payments')
        .select('stripe_payment_intent_id, amount')
        .eq('id', paymentId)
        .single()

      if (!payment?.stripe_payment_intent_id) {
        throw new Error('Payment not found or no Stripe payment intent')
      }

      // Process refund with Stripe
      const refund = await stripe.refunds.create({
        payment_intent: payment.stripe_payment_intent_id,
        amount: refundAmount ? Math.round(refundAmount * 100) : undefined, // Convert to cents
        reason
      })

      // Update payment status
      await supabase
        .from('payments')
        .update({
          status: 'refunded',
          refunded_at: new Date().toISOString()
        })
        .eq('id', paymentId)

      return refund.status === 'succeeded'
    } catch (error: any) {
      console.error('Error processing refund:', error)
      throw new Error(`Refund failed: ${error.message}`)
    }
  }
}