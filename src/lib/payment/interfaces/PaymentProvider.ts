import type {
  PaymentRequest,
  PaymentResponse,
  PaymentResult,
  WebhookData,
  FeeBreakdown
} from './types'

export abstract class PaymentProvider {
  abstract provider: string
  abstract mode: 'embedded' | 'redirect'

  /**
   * Calculate fees for a payment amount
   */
  abstract calculateFees(amount: number, tradieId: string): Promise<FeeBreakdown>

  /**
   * Create a new payment
   */
  abstract createPayment(request: PaymentRequest): Promise<PaymentResponse>

  /**
   * Confirm/verify a payment after completion
   */
  abstract confirmPayment(providerTransactionId: string): Promise<PaymentResult>

  /**
   * Handle webhook notifications from payment provider
   */
  abstract handleWebhook(webhookData: WebhookData): Promise<void>

  /**
   * Get payment status from provider
   */
  abstract getPaymentStatus(providerTransactionId: string): Promise<PaymentResult>

  /**
   * Process refund for a payment
   */
  abstract refundPayment(
    paymentId: string,
    refundAmount?: number,
    reason?: string
  ): Promise<boolean>

  /**
   * Validate provider-specific configuration
   */
  abstract validateConfig(): boolean

  /**
   * Get provider display name
   */
  abstract getDisplayName(): string

  /**
   * Get supported currencies
   */
  abstract getSupportedCurrencies(): string[]

  /**
   * Check if provider is available for user/region
   */
  abstract isAvailableForUser(userRegion?: string): boolean
}