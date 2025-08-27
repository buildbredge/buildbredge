import { PaymentProvider } from '../../interfaces/PaymentProvider'
import type {
  PaymentRequest,
  PaymentResponse,
  PaymentResult,
  WebhookData,
  FeeBreakdown,
} from '../../interfaces/types'
import { supabase } from '@/lib/supabase'
import { PoliClient, validatePoliConfig } from './poli-client'
import type {
  PoliCreatePaymentRequest,
  PoliNotificationData,
} from './poli-types'
import { POLI_TRANSACTION_STATUS } from './poli-types'

export class PoliPaymentProvider extends PaymentProvider {
  provider = 'poli'
  mode: 'embedded' | 'redirect' = 'redirect'
  private poliClient: PoliClient

  constructor() {
    super()
    this.poliClient = new PoliClient()
  }

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
          payment_method: 'poli_bank',
          payment_provider: 'poli'
        })
        .select()
        .single()

      if (paymentError || !payment) {
        throw new Error(`Failed to create payment record: ${paymentError?.message}`)
      }

      // Generate merchant reference
      const merchantReference = `BB-${payment.id}-${Date.now()}`
      
      // Create POLi payment request
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const poliRequest: PoliCreatePaymentRequest = {
        Amount: request.amount,
        CurrencyCode: request.currency,
        MerchantReference: merchantReference,
        MerchantHomepageURL: baseUrl,
        SuccessURL: `${baseUrl}/poli/success?ref=${merchantReference}`,
        FailureURL: `${baseUrl}/poli/failure?ref=${merchantReference}`,
        CancellationURL: `${baseUrl}/poli/cancel?ref=${merchantReference}`,
        NotificationURL: `${baseUrl}/api/poli/notify`,
        MerchantData: JSON.stringify({
          paymentId: payment.id,
          projectId: request.projectId,
          quoteId: request.quoteId,
        })
      }

      const poliResponse = await this.poliClient.createPayment(poliRequest)

      // Update payment record with POLi details
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          provider_transaction_id: poliResponse.TransactionRefNo,
          merchant_reference: merchantReference,
          redirect_url: poliResponse.NavigateURL,
          status: 'processing'
        })
        .eq('id', payment.id)

      if (updateError) {
        throw new Error(`Failed to update payment with POLi details: ${updateError.message}`)
      }

      return {
        paymentId: payment.id,
        redirectUrl: poliResponse.NavigateURL,
        fees,
        provider: 'poli',
        mode: 'redirect'
      }
    } catch (error: any) {
      console.error('Error creating POLi payment:', error)
      throw new Error(`POLi payment creation failed: ${error.message}`)
    }
  }

  async confirmPayment(providerTransactionId: string): Promise<PaymentResult> {
    try {
      const statusResponse = await this.poliClient.getPaymentStatus({
        TransactionRefNo: providerTransactionId
      })

      const status = this.mapPoliStatus(statusResponse.TransactionStatus)
      const success = statusResponse.TransactionStatus === POLI_TRANSACTION_STATUS.COMPLETED

      return {
        success,
        paymentId: statusResponse.MerchantReference || providerTransactionId,
        providerTransactionId,
        status,
        errorMessage: success ? undefined : statusResponse.ErrorMessage
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
      const notification = webhookData.data as PoliNotificationData
      
      if (!this.poliClient.validateNotification(notification)) {
        throw new Error('Invalid POLi notification data')
      }

      console.log(`Received POLi notification for transaction: ${notification.TransactionRefNo}`, {
        status: notification.TransactionStatus,
        merchantRef: notification.MerchantReference,
        amount: notification.Amount
      })

      // Update payment status based on POLi notification
      const status = this.mapPoliStatus(notification.TransactionStatus)
      const updateData: any = {
        status,
      }

      if (notification.TransactionStatus === POLI_TRANSACTION_STATUS.COMPLETED) {
        updateData.confirmed_at = new Date().toISOString()
        updateData.poli_bank_receipt = notification.BankReceipt
        updateData.poli_bank_name = notification.FinancialInstitutionShortName
      } else if (notification.TransactionStatus === POLI_TRANSACTION_STATUS.FAILED) {
        updateData.failed_at = new Date().toISOString()
        updateData.failure_reason = notification.ErrorMessage || 'Payment failed'
      }

      const { error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('provider_transaction_id', notification.TransactionRefNo)

      if (error) {
        console.error('Failed to update payment from POLi notification:', error)
        throw error
      }

      // If payment completed, trigger escrow creation
      if (notification.TransactionStatus === POLI_TRANSACTION_STATUS.COMPLETED) {
        await this.createEscrowForCompletedPayment(notification.TransactionRefNo)
      }

    } catch (error: any) {
      console.error('POLi webhook handling error:', error)
      throw error
    }
  }

  async getPaymentStatus(providerTransactionId: string): Promise<PaymentResult> {
    return this.confirmPayment(providerTransactionId)
  }

  async refundPayment(paymentId: string, refundAmount?: number, reason?: string): Promise<boolean> {
    // POLi doesn't support automatic refunds through API
    // Mark payment as refunded in database for manual processing
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'refunded',
          refunded_at: new Date().toISOString(),
          refund_reason: reason || 'Manual refund requested'
        })
        .eq('id', paymentId)

      if (error) {
        throw new Error(`Failed to mark payment as refunded: ${error.message}`)
      }

      console.log(`POLi payment ${paymentId} marked for manual refund processing`)
      return true
    } catch (error: any) {
      console.error('Error processing POLi refund:', error)
      throw new Error(`POLi refund failed: ${error.message}`)
    }
  }

  validateConfig(): boolean {
    return validatePoliConfig() && this.poliClient.validateConfig()
  }

  getDisplayName(): string {
    return 'New Zealand Bank Transfer (POLi)'
  }

  getSupportedCurrencies(): string[] {
    return ['NZD']
  }

  isAvailableForUser(userRegion?: string): boolean {
    // POLi is primarily for New Zealand users
    return userRegion === 'NZ' || userRegion === 'NZL'
  }

  // Private helper methods
  private mapPoliStatus(poliStatus?: string): 'completed' | 'failed' | 'cancelled' | 'pending' {
    switch (poliStatus) {
      case POLI_TRANSACTION_STATUS.COMPLETED:
        return 'completed'
      case POLI_TRANSACTION_STATUS.FAILED:
        return 'failed'
      case POLI_TRANSACTION_STATUS.CANCELLED:
        return 'cancelled'
      case POLI_TRANSACTION_STATUS.IN_PROGRESS:
      default:
        return 'pending'
    }
  }

  private async createEscrowForCompletedPayment(transactionRefNo: string): Promise<void> {
    try {
      // Get payment details
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('id')
        .eq('provider_transaction_id', transactionRefNo)
        .single()

      if (paymentError || !payment) {
        console.error('Payment not found for escrow creation:', transactionRefNo)
        return
      }

      // Create escrow account
      const { data: escrowId, error: escrowError } = await supabase
        .rpc('create_escrow_account', { p_payment_id: payment.id })

      if (escrowError) {
        console.error('Failed to create escrow account for POLi payment:', escrowError)
        return
      }

      console.log(`Escrow account created for POLi payment: ${escrowId}`)

      // Update project status
      const { data: paymentData, error: projectPaymentError } = await supabase
        .from('payments')
        .select('project_id')
        .eq('id', payment.id)
        .single()

      if (!projectPaymentError && paymentData?.project_id) {
        const { error: projectError } = await supabase
          .from('projects')
          .update({ status: 'escrowed' })
          .eq('id', paymentData.project_id)

        if (projectError) {
          console.warn('Failed to update project status for POLi payment:', projectError)
        }
      } else if (projectPaymentError) {
        console.warn('Failed to fetch payment project_id for POLi payment:', projectPaymentError)
      }

    } catch (error: any) {
      console.error('Error creating escrow for POLi payment:', error)
    }
  }
}