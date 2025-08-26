-- Migration: Add Stripe Checkout Session support
-- Date: 2025-08-26
-- Description: Add stripe_checkout_session_id column to payments table and update payment_method options

-- Add Stripe checkout session ID column
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT UNIQUE;

-- Update payment_method enum to include checkout
ALTER TABLE payments 
DROP CONSTRAINT IF EXISTS payments_payment_method_check;

ALTER TABLE payments 
ADD CONSTRAINT payments_payment_method_check 
CHECK (payment_method IN ('stripe_card', 'stripe_checkout', 'stripe_bank', 'paypal', 'bank_transfer'));

-- Add status for expired sessions
ALTER TABLE payments 
DROP CONSTRAINT IF EXISTS payments_status_check;

ALTER TABLE payments 
ADD CONSTRAINT payments_status_check 
CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'disputed', 'expired'));

-- Add expired_at timestamp
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS expired_at TIMESTAMP WITH TIME ZONE;

-- Create index for checkout session lookups
CREATE INDEX IF NOT EXISTS idx_payments_stripe_checkout_session 
ON payments(stripe_checkout_session_id) WHERE stripe_checkout_session_id IS NOT NULL;

-- Create index for session status lookups
CREATE INDEX IF NOT EXISTS idx_payments_status_created 
ON payments(status, created_at);

COMMENT ON COLUMN payments.stripe_checkout_session_id IS 'Stripe Checkout Session ID for embedded checkout payments';
COMMENT ON COLUMN payments.expired_at IS 'Timestamp when payment session expired';