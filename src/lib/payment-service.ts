import { supabase } from '@/lib/supabase'
import { PaymentProviderFactory } from '@/lib/payment/PaymentProviderFactory'
import { StripePaymentProvider } from '@/lib/payment/providers/stripe/StripePaymentProvider'
import { PoliPaymentProvider } from '@/lib/payment/providers/poli/PoliPaymentProvider'
import type { Database } from '@/lib/supabase'
import type { 
  PaymentProvider as PaymentProviderType, 
  FeeBreakdown,
  PaymentRequest,
  PaymentResponse,
  PaymentResult
} from '@/lib/payment/interfaces/types'

type Payment = Database['public']['Tables']['payments']['Row']
type EscrowAccount = Database['public']['Tables']['escrow_accounts']['Row']
type Withdrawal = Database['public']['Tables']['withdrawals']['Row']

// Register payment providers
PaymentProviderFactory.registerProvider('stripe', () => new StripePaymentProvider())
PaymentProviderFactory.registerProvider('poli', () => new PoliPaymentProvider())

export class PaymentService {
  // Calculate fees for a payment (legacy method, now uses providers internally)
  static async calculateFees(amount: number, tradieId: string): Promise<FeeBreakdown> {
    // Use default provider (Stripe) for fee calculation
    const provider = PaymentProviderFactory.createProvider('stripe')
    return provider.calculateFees(amount, tradieId)
  }

  // Create payment using specified provider
  static async createPaymentByProvider(
    provider: PaymentProviderType,
    projectId: string,
    quoteId: string,
    payerId: string,
    tradieId: string,
    amount: number,
    currency: string = 'NZD'
  ): Promise<PaymentResponse> {
    const paymentProvider = PaymentProviderFactory.createProvider(provider)
    
    return paymentProvider.createPayment({
      projectId,
      quoteId,
      payerId,
      tradieId,
      amount,
      currency,
    })
  }

  // Legacy method - Create payment intent and database record (defaults to Stripe)
  static async createPayment(
    projectId: string,
    quoteId: string,
    payerId: string,
    tradieId: string,
    amount: number,
    currency: string = 'NZD'
  ): Promise<{ paymentId: string; clientSecret: string; fees: FeeBreakdown }> {
    const result = await this.createPaymentByProvider(
      'stripe',
      projectId,
      quoteId,
      payerId,
      tradieId,
      amount,
      currency
    )

    return {
      paymentId: result.paymentId,
      clientSecret: result.clientSecret || '',
      fees: result.fees
    }
  }

  // Confirm payment using appropriate provider
  static async confirmPaymentByProvider(
    provider: PaymentProviderType,
    providerTransactionId: string
  ): Promise<PaymentResult> {
    const paymentProvider = PaymentProviderFactory.createProvider(provider)
    return paymentProvider.confirmPayment(providerTransactionId)
  }

  // Legacy method - Confirm payment and create escrow (assumes Stripe)
  static async confirmPayment(paymentIntentId: string): Promise<EscrowAccount> {
    try {
      const result = await this.confirmPaymentByProvider('stripe', paymentIntentId)
      
      if (!result.success) {
        throw new Error(result.errorMessage || 'Payment confirmation failed')
      }

      // Get payment details to create escrow
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('provider_transaction_id', paymentIntentId)
        .single()

      if (paymentError || !payment) {
        throw new Error(`Failed to find payment: ${paymentError?.message}`)
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

  // Get payment status using appropriate provider
  static async getPaymentStatusByProvider(
    provider: PaymentProviderType,
    providerTransactionId: string
  ): Promise<PaymentResult> {
    const paymentProvider = PaymentProviderFactory.createProvider(provider)
    return paymentProvider.getPaymentStatus(providerTransactionId)
  }

  // Process webhook using appropriate provider
  static async processWebhookByProvider(
    provider: PaymentProviderType,
    webhookData: any,
    signature?: string
  ): Promise<void> {
    const paymentProvider = PaymentProviderFactory.createProvider(provider)
    await paymentProvider.handleWebhook({
      provider,
      eventType: 'webhook',
      data: webhookData,
      signature
    })
  }

  // Get recommended payment provider for user
  static getRecommendedPaymentProvider(userRegion?: string): PaymentProviderType | null {
    return PaymentProviderFactory.getRecommendedProvider(userRegion)
  }

  // Get available payment providers for user
  static getAvailablePaymentProviders(userRegion?: string): PaymentProviderType[] {
    return PaymentProviderFactory.getAvailableProvidersForUser(userRegion)
  }

  // Check if payment provider is available
  static isPaymentProviderAvailable(provider: PaymentProviderType): boolean {
    return PaymentProviderFactory.isProviderAvailable(provider)
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

      const payment = Array.isArray(escrow?.payments) ? escrow.payments[0] : escrow?.payments
      if (payment?.project_id) {
        await supabase
          .from('projects')
          .update({ status: 'released' })
          .eq('id', payment.project_id)
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
          payment_provider,
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

  // Refund payment using appropriate provider
  static async refundPaymentByProvider(
    provider: PaymentProviderType,
    paymentId: string,
    refundAmount?: number,
    reason?: string
  ): Promise<boolean> {
    const paymentProvider = PaymentProviderFactory.createProvider(provider)
    return paymentProvider.refundPayment(paymentId, refundAmount, reason)
  }

  // Legacy method - Refund payment (assumes Stripe)
  static async refundPayment(
    paymentId: string,
    refundAmount?: number,
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
  ): Promise<boolean> {
    return this.refundPaymentByProvider('stripe', paymentId, refundAmount, reason)
  }
}