import { PaymentProvider } from '../../interfaces/PaymentProvider'
import type {
  PaymentRequest,
  PaymentResponse,
  PaymentResult,
  WebhookData,
  FeeBreakdown,
} from '../../interfaces/types'
import { supabase } from '@/lib/supabase'
import { validateStripeConfig } from './stripe-client'
import {
  createPaymentIntent,
  confirmPaymentIntent,
  constructWebhookEvent,
  refundPayment,
  getPaymentIntentDetails,
  createCheckoutSession,
} from './stripe-utils'
import type {
  StripePaymentIntentMetadata,
  StripeWebhookEvent,
} from './stripe-types'
import { STRIPE_WEBHOOK_EVENTS } from './stripe-types'
import type Stripe from 'stripe'

export class StripePaymentProvider extends PaymentProvider {
  provider = 'stripe'
  mode: 'embedded' | 'redirect' = 'embedded'

  async calculateFees(amount: number, tradieId: string): Promise<FeeBreakdown> {
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
      platformFee: parseFloat((data as any).platform_fee),
      affiliateFee: parseFloat((data as any).affiliate_fee),
      taxAmount: parseFloat((data as any).tax_amount),
      netAmount: parseFloat((data as any).net_amount),
      parentTradieId: (data as any).parent_tradie_id
    }
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Calculate fees
      const fees = await this.calculateFees(request.amount, request.tradieId)
      
      // Create payment record in database
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          project_id: request.projectId,
          quote_id: request.quoteId,
          payer_id: request.payerId,
          tradie_id: request.tradieId,
          amount: request.amount,
          platform_fee: fees.platformFee,
          affiliate_fee: fees.affiliateFee,
          tax_amount: fees.taxAmount,
          net_amount: fees.netAmount,
          currency: request.currency,
          status: 'pending',
          payment_method: 'stripe_card',
          payment_provider: 'stripe'
        })
        .select()
        .single()

      if (paymentError || !payment) {
        throw new Error(`Failed to create payment record: ${paymentError?.message}`)
      }

      // Create Stripe payment intent
      const metadata: StripePaymentIntentMetadata = {
        projectId: request.projectId,
        quoteId: request.quoteId,
        tradieId: request.tradieId,
        payerId: request.payerId,
        platformFee: fees.platformFee.toString(),
        affiliateFee: fees.affiliateFee.toString(),
        taxAmount: fees.taxAmount.toString(),
        netAmount: fees.netAmount.toString(),
        parentTradieId: fees.parentTradieId || null
      }

      const paymentIntent = await createPaymentIntent(request.amount, request.currency, metadata)

      // Update payment record with Stripe payment intent ID
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          stripe_payment_intent_id: paymentIntent.id,
          provider_transaction_id: paymentIntent.id,
          status: 'processing'
        })
        .eq('id', payment.id)

      if (updateError) {
        throw new Error(`Failed to update payment with Stripe intent: ${updateError.message}`)
      }

      return {
        paymentId: payment.id,
        clientSecret: paymentIntent.client_secret!,
        fees,
        provider: 'stripe',
        mode: 'embedded'
      }
    } catch (error: any) {
      console.error('Error creating Stripe payment:', error)
      throw new Error(`Stripe payment creation failed: ${error.message}`)
    }
  }

  async confirmPayment(providerTransactionId: string): Promise<PaymentResult> {
    try {
      const paymentIntent = await confirmPaymentIntent(providerTransactionId)
      
      return {
        success: true,
        paymentId: paymentIntent.metadata?.projectId || providerTransactionId,
        providerTransactionId: paymentIntent.id,
        status: 'completed'
      }
    } catch (error: any) {
      return {
        success: false,
        paymentId: providerTransactionId,
        providerTransactionId,
        status: 'failed',
        errorMessage: error.message
      }
    }
  }

  async handleWebhook(webhookData: WebhookData): Promise<void> {
    try {
      const event = constructWebhookEvent(webhookData.data, webhookData.signature!)
      
      console.log(`Received Stripe webhook: ${event.type}`, {
        id: event.id,
        created: event.created
      })

      switch (event.type) {
        case STRIPE_WEBHOOK_EVENTS.PAYMENT_INTENT_SUCCEEDED:
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
          break

        case STRIPE_WEBHOOK_EVENTS.PAYMENT_INTENT_PAYMENT_FAILED:
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
          break

        case STRIPE_WEBHOOK_EVENTS.CHARGE_DISPUTE_CREATED:
          await this.handleChargeDisputeCreated(event.data.object as Stripe.Dispute)
          break

        case STRIPE_WEBHOOK_EVENTS.CHECKOUT_SESSION_COMPLETED:
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
          break

        case STRIPE_WEBHOOK_EVENTS.CHECKOUT_SESSION_EXPIRED:
          await this.handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session)
          break

        default:
          console.log(`Unhandled Stripe webhook event type: ${event.type}`)
      }
    } catch (error: any) {
      console.error('Stripe webhook handling error:', error)
      throw error
    }
  }

  async getPaymentStatus(providerTransactionId: string): Promise<PaymentResult> {
    try {
      const paymentIntent = await getPaymentIntentDetails(providerTransactionId)
      
      return {
        success: paymentIntent.status === 'succeeded',
        paymentId: paymentIntent.metadata?.projectId || providerTransactionId,
        providerTransactionId: paymentIntent.id,
        status: this.mapStripeStatus(paymentIntent.status)
      }
    } catch (error: any) {
      return {
        success: false,
        paymentId: providerTransactionId,
        providerTransactionId,
        status: 'failed',
        errorMessage: error.message
      }
    }
  }

  async refundPayment(paymentId: string, refundAmount?: number, reason?: string): Promise<boolean> {
    try {
      const { data: payment } = await supabase
        .from('payments')
        .select('provider_transaction_id, amount')
        .eq('id', paymentId)
        .single()

      if (!payment?.provider_transaction_id) {
        throw new Error('Payment not found or no provider transaction ID')
      }

      const refund = await refundPayment({
        paymentIntentId: payment.provider_transaction_id,
        amount: refundAmount,
        reason: reason as any
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
      console.error('Error processing Stripe refund:', error)
      throw new Error(`Stripe refund failed: ${error.message}`)
    }
  }

  validateConfig(): boolean {
    return validateStripeConfig()
  }

  getDisplayName(): string {
    return 'Credit/Debit Card (Stripe)'
  }

  getSupportedCurrencies(): string[] {
    return ['NZD', 'USD', 'AUD', 'CAD', 'EUR', 'GBP']
  }

  isAvailableForUser(userRegion?: string): boolean {
    return true // Stripe is available globally
  }

  // Private helper methods
  private mapStripeStatus(stripeStatus: Stripe.PaymentIntent.Status): 'completed' | 'failed' | 'cancelled' | 'pending' {
    switch (stripeStatus) {
      case 'succeeded':
        return 'completed'
      case 'canceled':
        return 'cancelled'
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
      case 'processing':
        return 'pending'
      default:
        return 'failed'
    }
  }

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    // Implementation from existing webhook handler
    console.log('Processing successful payment intent:', paymentIntent.id)

    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        confirmed_at: new Date().toISOString(),
        stripe_charge_id: (paymentIntent as any).charges?.data[0]?.id,
        stripe_customer_id: paymentIntent.customer as string
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)

    if (updateError) {
      console.error('Failed to update payment status:', updateError)
    }
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    console.log('Processing failed payment intent:', paymentIntent.id)

    const failureReason = paymentIntent.last_payment_error?.message || 'Payment failed'

    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'failed',
        failed_at: new Date().toISOString(),
        failure_reason: failureReason
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)

    if (updateError) {
      console.error('Failed to update payment failure status:', updateError)
    }
  }

  private async handleChargeDisputeCreated(dispute: Stripe.Dispute): Promise<void> {
    console.log('Processing charge dispute:', dispute.id)

    const chargeId = dispute.charge as string

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, project_id')
      .eq('stripe_charge_id', chargeId)
      .single()

    if (paymentError || !payment) {
      console.error('Payment not found for disputed charge:', chargeId)
      return
    }

    await supabase
      .from('payments')
      .update({ status: 'disputed' })
      .eq('id', payment.id)
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    console.log('Processing completed checkout session:', session.id)
    // Implementation for checkout session completion
  }

  private async handleCheckoutSessionExpired(session: Stripe.Checkout.Session): Promise<void> {
    console.log('Processing expired checkout session:', session.id)
    // Implementation for checkout session expiration
  }
}