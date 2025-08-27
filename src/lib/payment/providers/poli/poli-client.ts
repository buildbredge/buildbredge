import type {
  PoliCreatePaymentRequest,
  PoliCreatePaymentResponse,
  PoliStatusRequest,
  PoliStatusResponse,
} from './poli-types'

export class PoliClient {
  private apiUrl: string
  private auth: string

  constructor() {
    this.apiUrl = process.env.POLI_API_URL || 'https://poliapi.apac.paywithpoli.com/api/v2'
    this.auth = process.env.POLI_AUTH || ''
    
    if (!this.auth) {
      const merchantCode = process.env.POLI_MERCHANT_CODE
      const authKey = process.env.POLI_AUTHENTICATION_KEY
      if (merchantCode && authKey) {
        this.auth = Buffer.from(`${merchantCode}:${authKey}`).toString('base64')
      }
    }
  }

  async createPayment(request: PoliCreatePaymentRequest): Promise<PoliCreatePaymentResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/Transaction/Initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.auth}`
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        throw new Error(`POLi API request failed: ${response.status} ${response.statusText}`)
      }

      const data: PoliCreatePaymentResponse = await response.json()
      
      if (!data.Success) {
        throw new Error(`POLi payment creation failed: ${data.ErrorMessage} (Code: ${data.ErrorCode})`)
      }

      return data
    } catch (error: any) {
      console.error('POLi create payment error:', error)
      throw new Error(`POLi payment creation failed: ${error.message}`)
    }
  }

  async getPaymentStatus(request: PoliStatusRequest): Promise<PoliStatusResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/Transaction/GetTransaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.auth}`
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        throw new Error(`POLi status request failed: ${response.status} ${response.statusText}`)
      }

      const data: PoliStatusResponse = await response.json()
      
      if (!data.Success) {
        throw new Error(`POLi status check failed: ${data.ErrorMessage} (Code: ${data.ErrorCode})`)
      }

      return data
    } catch (error: any) {
      console.error('POLi get status error:', error)
      throw new Error(`POLi status check failed: ${error.message}`)
    }
  }

  validateConfig(): boolean {
    return !!(this.auth && this.apiUrl)
  }

  validateNotification(notification: any): boolean {
    // Basic validation of notification structure
    return !!(
      notification &&
      notification.MerchantReference &&
      notification.TransactionRefNo &&
      typeof notification.TransactionStatus === 'string' &&
      typeof notification.Amount === 'number'
    )
  }
}

// Validate POLi configuration
export const validatePoliConfig = (): boolean => {
  return !!(
    (process.env.POLI_AUTH || 
     (process.env.POLI_MERCHANT_CODE && process.env.POLI_AUTHENTICATION_KEY)) &&
    process.env.POLI_API_URL
  )
}