// Email notification service for payment and escrow events
// Uses the existing email infrastructure mentioned in CLAUDE.md

import { Database } from '@/lib/supabase'

type Payment = Database['public']['Tables']['payments']['Row']
type EscrowAccount = Database['public']['Tables']['escrow_accounts']['Row']
type Withdrawal = Database['public']['Tables']['withdrawals']['Row']

interface EmailRecipient {
  email: string
  name: string
}

interface PaymentConfirmedData {
  payment: Payment
  project: {
    title: string
    description: string
  }
  tradie: EmailRecipient
  owner: EmailRecipient
  escrow: EscrowAccount
  protectionEndDate: string
  amount: number
  netAmount: number
}

interface EscrowReleasedData {
  escrow: EscrowAccount
  payment: Payment
  project: {
    title: string
  }
  tradie: EmailRecipient
  owner: EmailRecipient
  releaseMethod: 'manual' | 'automatic'
  amount: number
}

interface WithdrawalData {
  withdrawal: Withdrawal
  tradie: EmailRecipient
  amount: number
  referenceNumber: string
  estimatedProcessingTime: string
}

export class EmailNotificationService {
  
  // Send payment confirmation emails
  static async sendPaymentConfirmation(data: PaymentConfirmedData) {
    try {
      // Email to tradie about escrow creation
      await this.sendTradiePaymentConfirmation(data)
      
      // Email to owner about payment confirmation
      await this.sendOwnerPaymentConfirmation(data)
      
      console.log('Payment confirmation emails sent successfully')
    } catch (error) {
      console.error('Failed to send payment confirmation emails:', error)
      // Don't throw - email failures shouldn't break payment flow
    }
  }

  // Send escrow release notifications
  static async sendEscrowReleaseNotification(data: EscrowReleasedData) {
    try {
      // Email to tradie about funds being released
      await this.sendTradieEscrowReleased(data)
      
      // Email to owner confirming release
      await this.sendOwnerEscrowReleased(data)
      
      console.log('Escrow release emails sent successfully')
    } catch (error) {
      console.error('Failed to send escrow release emails:', error)
    }
  }

  // Send withdrawal notifications
  static async sendWithdrawalNotification(data: WithdrawalData) {
    try {
      // Email to tradie about withdrawal request
      await this.sendTradieWithdrawalConfirmation(data)
      
      console.log('Withdrawal notification email sent successfully')
    } catch (error) {
      console.error('Failed to send withdrawal notification email:', error)
    }
  }

  // Send protection period reminders
  static async sendProtectionPeriodReminder(data: {
    escrow: EscrowAccount
    tradie: EmailRecipient
    owner: EmailRecipient
    project: { title: string }
    daysRemaining: number
    amount: number
  }) {
    try {
      // Email to owner about upcoming automatic release
      await this.sendOwnerProtectionReminder(data)
      
      console.log('Protection period reminder sent successfully')
    } catch (error) {
      console.error('Failed to send protection period reminder:', error)
    }
  }

  // Private methods for sending specific emails
  private static async sendTradiePaymentConfirmation(data: PaymentConfirmedData) {
    const subject = `Payment Received - ${data.project.title}`
    
    const htmlContent = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #16a34a;">Payment Received!</h2>
        
        <p>Hi ${data.tradie.name},</p>
        
        <p>Great news! The client has paid for your project and the funds are now securely held in escrow.</p>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0369a1;">Project Details</h3>
          <p><strong>Project:</strong> ${data.project.title}</p>
          <p><strong>Payment Amount:</strong> NZD $${data.amount.toFixed(2)}</p>
          <p><strong>Your Net Amount:</strong> NZD $${data.netAmount.toFixed(2)}</p>
          <p><strong>Client:</strong> ${data.owner.name}</p>
        </div>
        
        <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #059669;">What happens next:</h3>
          <ul>
            <li>Begin work on the project as agreed</li>
            <li>Keep the client updated on progress</li>
            <li>Mark project as complete when finished</li>
            <li>Funds will be released after the 15-day protection period</li>
          </ul>
        </div>
        
        <p><strong>Protection Period:</strong> Funds will be automatically released on ${new Date(data.protectionEndDate).toLocaleDateString()} unless there are any disputes.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Project Dashboard
          </a>
        </div>
        
        <p>Best regards,<br>The BuildBridge Team</p>
      </div>
    `
    
    await this.sendEmail(data.tradie.email, subject, htmlContent)
  }

  private static async sendOwnerPaymentConfirmation(data: PaymentConfirmedData) {
    const subject = `Payment Confirmed - ${data.project.title}`
    
    const htmlContent = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #16a34a;">Payment Confirmed!</h2>
        
        <p>Hi ${data.owner.name},</p>
        
        <p>Your payment has been successfully processed and is now securely held in escrow.</p>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0369a1;">Payment Details</h3>
          <p><strong>Project:</strong> ${data.project.title}</p>
          <p><strong>Amount Paid:</strong> NZD $${data.amount.toFixed(2)}</p>
          <p><strong>Tradie:</strong> ${data.tradie.name}</p>
        </div>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #d97706;">Escrow Protection</h3>
          <p>Your funds are protected by our 15-day escrow period. You can:</p>
          <ul>
            <li>Release funds early once work is completed to your satisfaction</li>
            <li>Funds will be automatically released on ${new Date(data.protectionEndDate).toLocaleDateString()}</li>
            <li>Raise a dispute if there are any issues</li>
          </ul>
        </div>
        
        <p>The tradie has been notified and can now begin work on your project.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Project Dashboard
          </a>
        </div>
        
        <p>Best regards,<br>The BuildBridge Team</p>
      </div>
    `
    
    await this.sendEmail(data.owner.email, subject, htmlContent)
  }

  private static async sendTradieEscrowReleased(data: EscrowReleasedData) {
    const subject = `Funds Released - ${data.project.title}`
    const releaseMethod = data.releaseMethod === 'automatic' ? 'automatically after the protection period' : 'by the client'
    
    const htmlContent = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #16a34a;">Funds Released!</h2>
        
        <p>Hi ${data.tradie.name},</p>
        
        <p>Great news! The funds for your project have been released ${releaseMethod} and are now available for withdrawal.</p>
        
        <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #059669;">Release Details</h3>
          <p><strong>Project:</strong> ${data.project.title}</p>
          <p><strong>Amount Released:</strong> NZD $${data.amount.toFixed(2)}</p>
          <p><strong>Release Method:</strong> ${data.releaseMethod === 'automatic' ? 'Automatic' : 'Manual'}</p>
          <p><strong>Release Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0369a1;">Next Steps</h3>
          <p>You can now request a withdrawal of these funds to your bank account. Processing typically takes 1-3 business days.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Request Withdrawal
          </a>
        </div>
        
        <p>Best regards,<br>The BuildBridge Team</p>
      </div>
    `
    
    await this.sendEmail(data.tradie.email, subject, htmlContent)
  }

  private static async sendOwnerEscrowReleased(data: EscrowReleasedData) {
    const subject = `Payment Released - ${data.project.title}`
    
    const htmlContent = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #16a34a;">Payment Released</h2>
        
        <p>Hi ${data.owner.name},</p>
        
        <p>The funds for your project have been released to the tradie as ${data.releaseMethod === 'automatic' ? 'the protection period has ended' : 'requested'}.</p>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0369a1;">Project Completed</h3>
          <p><strong>Project:</strong> ${data.project.title}</p>
          <p><strong>Tradie:</strong> ${data.tradie.name}</p>
          <p><strong>Amount Released:</strong> NZD $${data.amount.toFixed(2)}</p>
        </div>
        
        <p>We hope you're satisfied with the completed work. If you have any feedback or concerns, please don't hesitate to contact us.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Leave a Review
          </a>
        </div>
        
        <p>Thank you for using BuildBridge!</p>
        
        <p>Best regards,<br>The BuildBridge Team</p>
      </div>
    `
    
    await this.sendEmail(data.owner.email, subject, htmlContent)
  }

  private static async sendTradieWithdrawalConfirmation(data: WithdrawalData) {
    const subject = `Withdrawal Request Received - ${data.referenceNumber}`
    
    const htmlContent = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #16a34a;">Withdrawal Request Received</h2>
        
        <p>Hi ${data.tradie.name},</p>
        
        <p>We've received your withdrawal request and are processing it.</p>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0369a1;">Withdrawal Details</h3>
          <p><strong>Reference Number:</strong> ${data.referenceNumber}</p>
          <p><strong>Amount:</strong> NZD $${data.amount.toFixed(2)}</p>
          <p><strong>Estimated Processing Time:</strong> ${data.estimatedProcessingTime}</p>
        </div>
        
        <p>You'll receive another email once the funds have been successfully transferred to your account.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Withdrawal Status
          </a>
        </div>
        
        <p>Best regards,<br>The BuildBridge Team</p>
      </div>
    `
    
    await this.sendEmail(data.tradie.email, subject, htmlContent)
  }

  private static async sendOwnerProtectionReminder(data: {
    escrow: EscrowAccount
    tradie: EmailRecipient
    owner: EmailRecipient
    project: { title: string }
    daysRemaining: number
    amount: number
  }) {
    const subject = `Payment Auto-Release in ${data.daysRemaining} days - ${data.project.title}`
    
    const htmlContent = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #d97706;">Payment Auto-Release Reminder</h2>
        
        <p>Hi ${data.owner.name},</p>
        
        <p>This is a reminder that the payment for your project will be automatically released in ${data.daysRemaining} days.</p>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #d97706;">Project Details</h3>
          <p><strong>Project:</strong> ${data.project.title}</p>
          <p><strong>Tradie:</strong> ${data.tradie.name}</p>
          <p><strong>Amount:</strong> NZD $${data.amount.toFixed(2)}</p>
          <p><strong>Auto-Release Date:</strong> ${new Date(data.escrow.protection_end_date).toLocaleDateString()}</p>
        </div>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0369a1;">Your Options</h3>
          <ul>
            <li><strong>Release Early:</strong> If you're satisfied with the work, you can release the payment now</li>
            <li><strong>Wait for Auto-Release:</strong> Payment will be automatically released on the scheduled date</li>
            <li><strong>Raise a Dispute:</strong> If there are issues, contact us immediately</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
            Release Payment Now
          </a>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/support" 
             style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Report Issue
          </a>
        </div>
        
        <p>Best regards,<br>The BuildBridge Team</p>
      </div>
    `
    
    await this.sendEmail(data.owner.email, subject, htmlContent)
  }

  // Generic email sending method
  private static async sendEmail(to: string, subject: string, htmlContent: string) {
    try {
      // This would integrate with the existing email system mentioned in CLAUDE.md
      // For now, we'll log the email content
      console.log('Email would be sent:', {
        to,
        subject,
        preview: htmlContent.substring(0, 100) + '...'
      })

      // TODO: Integrate with actual email service (Resend, SendGrid, etc.)
      // Example with Resend:
      /*
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'BuildBridge <noreply@buildbridge.co.nz>',
          to: [to],
          subject,
          html: htmlContent
        })
      })

      if (!response.ok) {
        throw new Error(`Email API error: ${response.statusText}`)
      }
      */

    } catch (error) {
      console.error('Email sending failed:', error)
      throw error
    }
  }
}

// Helper function to get user data for emails
export async function getEmailRecipientData(userId: string): Promise<EmailRecipient | null> {
  try {
    const { supabase } = await import('@/lib/supabase')
    
    const { data: user, error } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', userId)
      .single()

    if (error || !user) {
      console.error('Failed to fetch user for email:', error)
      return null
    }

    return {
      email: user.email,
      name: user.name
    }
  } catch (error) {
    console.error('Error getting email recipient data:', error)
    return null
  }
}