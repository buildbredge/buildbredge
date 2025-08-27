import { NextRequest, NextResponse } from 'next/server'
import { PaymentProviderFactory } from '@/lib/payment/PaymentProviderFactory'
import { PoliPaymentProvider } from '@/lib/payment/providers/poli/PoliPaymentProvider'

// Register POLi provider
PaymentProviderFactory.registerProvider('poli', () => new PoliPaymentProvider())

export async function POST(request: NextRequest) {
  try {
    const notificationData = await request.json()
    
    console.log('POLi notification received:', {
      transactionRef: notificationData.TransactionRefNo,
      merchantRef: notificationData.MerchantReference,
      status: notificationData.TransactionStatus,
      amount: notificationData.Amount
    })

    // Handle webhook using POLi provider
    const poliProvider = PaymentProviderFactory.createProvider('poli')
    await poliProvider.handleWebhook({
      provider: 'poli',
      eventType: 'transaction_notification',
      data: notificationData
    })

    return NextResponse.json({ 
      success: true,
      message: 'Notification processed successfully' 
    })

  } catch (error: any) {
    console.error('Error handling POLi notification:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process notification' },
      { status: 500 }
    )
  }
}