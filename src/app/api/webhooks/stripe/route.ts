import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent, STRIPE_WEBHOOK_EVENTS } from '@/lib/stripe'
import { PaymentService } from '@/lib/payment-service'
import { supabase } from '@/lib/supabase'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.error('Missing stripe-signature header')
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  try {
    // Construct the webhook event
    const event = constructWebhookEvent(body, signature)
    
    console.log(`Received Stripe webhook: ${event.type}`, {
      id: event.id,
      created: event.created
    })

    switch (event.type) {
      case STRIPE_WEBHOOK_EVENTS.PAYMENT_INTENT_SUCCEEDED:
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case STRIPE_WEBHOOK_EVENTS.PAYMENT_INTENT_PAYMENT_FAILED:
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case STRIPE_WEBHOOK_EVENTS.CHARGE_DISPUTE_CREATED:
        await handleChargeDisputeCreated(event.data.object as Stripe.Dispute)
        break

      default:
        console.log(`Unhandled webhook event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Webhook error:', error.message)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Processing successful payment intent:', paymentIntent.id)

    // Update payment status in database
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        confirmed_at: new Date().toISOString(),
        stripe_charge_id: paymentIntent.charges.data[0]?.id,
        stripe_customer_id: paymentIntent.customer as string
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)

    if (updateError) {
      console.error('Failed to update payment status:', updateError)
      return
    }

    // Create escrow account automatically
    try {
      const escrowAccount = await PaymentService.confirmPayment(paymentIntent.id)
      console.log('Escrow account created:', escrowAccount.id)

      // Send email notifications
      try {
        const { EmailNotificationService, getEmailRecipientData } = await import('@/lib/email-service')
        
        // Get payment details for email
        const paymentDetails = await PaymentService.getPaymentDetails(
          payment.id || paymentIntent.metadata?.paymentId
        )
        
        if (paymentDetails) {
          const tradieData = await getEmailRecipientData(paymentDetails.tradie_id)
          const ownerData = await getEmailRecipientData(paymentDetails.payer_id)
          
          if (tradieData && ownerData) {
            await EmailNotificationService.sendPaymentConfirmation({
              payment: paymentDetails,
              project: {
                title: paymentDetails.projects?.title || paymentDetails.projects?.description || 'Project',
                description: paymentDetails.projects?.description || ''
              },
              tradie: tradieData,
              owner: ownerData,
              escrow: escrowAccount,
              protectionEndDate: escrowAccount.protection_end_date,
              amount: parseFloat(paymentDetails.amount.toString()),
              netAmount: parseFloat(escrowAccount.net_amount.toString())
            })
          }
        }
      } catch (emailError) {
        console.error('Failed to send email notifications:', emailError)
        // Don't throw - email failures shouldn't break the flow
      }
      
    } catch (escrowError) {
      console.error('Failed to create escrow account:', escrowError)
      // Don't throw here - payment was successful, escrow creation can be retried
    }

  } catch (error: any) {
    console.error('Error handling payment intent succeeded:', error)
    throw error
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Processing failed payment intent:', paymentIntent.id)

    const failureReason = paymentIntent.last_payment_error?.message || 'Payment failed'

    // Update payment status in database
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

    // TODO: Send email notification about payment failure
    // TODO: Allow retry mechanism

  } catch (error: any) {
    console.error('Error handling payment intent failed:', error)
    throw error
  }
}

async function handleChargeDisputeCreated(dispute: Stripe.Dispute) {
  try {
    console.log('Processing charge dispute:', dispute.id)

    const chargeId = dispute.charge as string

    // Find the payment associated with this charge
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        id,
        project_id,
        tradie_id,
        payer_id,
        amount,
        escrow_accounts (
          id,
          status
        )
      `)
      .eq('stripe_charge_id', chargeId)
      .single()

    if (paymentError || !payment) {
      console.error('Payment not found for disputed charge:', chargeId)
      return
    }

    // Update payment status to disputed
    await supabase
      .from('payments')
      .update({
        status: 'disputed'
      })
      .eq('id', payment.id)

    // If there's an associated escrow account, mark it as disputed
    if (payment.escrow_accounts && payment.escrow_accounts.length > 0) {
      await supabase
        .from('escrow_accounts')
        .update({
          status: 'disputed'
        })
        .eq('payment_id', payment.id)
    }

    // Update project status to disputed
    await supabase
      .from('projects')
      .update({
        status: 'disputed'
      })
      .eq('id', payment.project_id)

    // TODO: Send notifications about dispute
    // TODO: Trigger admin review process

    console.log(`Dispute processed for payment ${payment.id}`)

  } catch (error: any) {
    console.error('Error handling charge dispute:', error)
    throw error
  }
}

// Disable body parsing to get raw body for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
}