export interface PoliCreatePaymentRequest {
  Amount: number
  CurrencyCode: string
  MerchantReference: string
  MerchantHomepageURL: string
  SuccessURL: string
  FailureURL: string
  CancellationURL: string
  NotificationURL: string
  MerchantData?: string
}

export interface PoliCreatePaymentResponse {
  Success: boolean
  NavigateURL?: string
  ErrorCode?: number
  ErrorMessage?: string
  TransactionRefNo?: string
}

export interface PoliNotificationData {
  MerchantReference: string
  TransactionRefNo: string
  CurrencyCode: string
  Amount: number
  AmountPaid: number
  TransactionStatus: 'Completed' | 'Failed' | 'Cancelled' | 'InProgress'
  TransactionStatusCode: number
  EstablishedDate: string
  PaymentDate?: string
  BankReceipt?: string
  BankReceiptDateTime?: string
  FinancialInstitutionCountryCode: string
  FinancialInstitutionShortName: string
  FinancialInstitutionCode: string
  UserIPAddress: string
  UserPlatform: string
  MerchantEstablishedDateTime: string
  ErrorCode?: number
  ErrorMessage?: string
}

export interface PoliStatusRequest {
  TransactionRefNo: string
}

export interface PoliStatusResponse {
  Success: boolean
  TransactionRefNo?: string
  CurrencyCode?: string
  Amount?: number
  AmountPaid?: number
  TransactionStatus?: 'Completed' | 'Failed' | 'Cancelled' | 'InProgress'
  TransactionStatusCode?: number
  MerchantReference?: string
  EstablishedDate?: string
  PaymentDate?: string
  BankReceipt?: string
  BankReceiptDateTime?: string
  FinancialInstitutionCountryCode?: string
  FinancialInstitutionShortName?: string
  FinancialInstitutionCode?: string
  UserIPAddress?: string
  UserPlatform?: string
  MerchantEstablishedDateTime?: string
  ErrorCode?: number
  ErrorMessage?: string
}

export const POLI_TRANSACTION_STATUS = {
  COMPLETED: 'Completed',
  FAILED: 'Failed', 
  CANCELLED: 'Cancelled',
  IN_PROGRESS: 'InProgress',
} as const

export type PoliTransactionStatus = typeof POLI_TRANSACTION_STATUS[keyof typeof POLI_TRANSACTION_STATUS]

// Status code mappings
export const POLI_STATUS_CODES = {
  0: 'Completed',
  1: 'InProgress', 
  2: 'Failed',
  3: 'Cancelled',
} as const