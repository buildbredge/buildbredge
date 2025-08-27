import { NextRequest, NextResponse } from 'next/server'
import { PaymentProviderFactory } from '@/lib/payment/PaymentProviderFactory'
import { PoliPaymentProvider } from '@/lib/payment/providers/poli/PoliPaymentProvider'

// Register POLi provider
PaymentProviderFactory.registerProvider('poli', () => new PoliPaymentProvider())

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionRefNo = searchParams.get('transaction_ref_no')

    if (!transactionRefNo) {
      return NextResponse.json(
        { error: 'Transaction reference number is required' },
        { status: 400 }
      )
    }

    // Get payment status using POLi provider
    const poliProvider = PaymentProviderFactory.createProvider('poli')
    const result = await poliProvider.getPaymentStatus(transactionRefNo)

    return NextResponse.json({
      success: true,
      result
    })

  } catch (error: any) {
    console.error('Error retrieving POLi payment status:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve payment status' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transactionRefNo } = body

    if (!transactionRefNo) {
      return NextResponse.json(
        { error: 'Transaction reference number is required' },
        { status: 400 }
      )
    }

    // Get payment status using POLi provider
    const poliProvider = PaymentProviderFactory.createProvider('poli')
    const result = await poliProvider.getPaymentStatus(transactionRefNo)

    return NextResponse.json({
      success: true,
      result
    })

  } catch (error: any) {
    console.error('Error retrieving POLi payment status:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve payment status' },
      { status: 500 }
    )
  }
}