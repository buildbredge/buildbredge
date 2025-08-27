export type PaymentProvider = 'stripe' | 'poli'
export type PaymentMethod = 'stripe_card' | 'poli_bank'
export type PaymentMode = 'embedded' | 'redirect'

export interface FeeBreakdown {
  platformFee: number
  affiliateFee: number
  taxAmount: number
  netAmount: number
  parentTradieId?: string | null
}

export interface PaymentRequest {
  projectId: string
  quoteId: string
  payerId: string
  tradieId: string
  amount: number
  currency: string
  metadata?: Record<string, any>
}

export interface PaymentResponse {
  paymentId: string
  clientSecret?: string
  redirectUrl?: string
  fees: FeeBreakdown
  provider: PaymentProvider
  mode: PaymentMode
}

export interface PaymentResult {
  success: boolean
  paymentId: string
  providerTransactionId: string
  status: 'completed' | 'failed' | 'cancelled' | 'pending'
  errorMessage?: string
}

export interface WebhookData {
  provider: PaymentProvider
  eventType: string
  data: any
  signature?: string
}

export interface PaymentProviderConfig {
  stripe?: {
    secretKey: string
    publishableKey: string
    webhookSecret: string
  }
  poli?: {
    merchantCode: string
    authenticationKey: string
    apiUrl: string
    auth: string
  }
}