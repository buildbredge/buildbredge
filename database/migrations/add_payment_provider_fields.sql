-- Migration: Add payment provider fields for modular payment system
-- This migration adds fields to support multiple payment providers (Stripe, POLi, etc.)

-- Add new columns to payments table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(20) DEFAULT 'stripe',
ADD COLUMN IF NOT EXISTS provider_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS merchant_reference VARCHAR(100),
ADD COLUMN IF NOT EXISTS redirect_url TEXT,
ADD COLUMN IF NOT EXISTS poli_bank_receipt TEXT,
ADD COLUMN IF NOT EXISTS poli_bank_name TEXT;

-- Update existing payment_method values to be more specific
UPDATE payments 
SET payment_method = 'stripe_card' 
WHERE payment_method = 'stripe' OR payment_method IS NULL;

-- Add index on payment_provider for efficient queries
CREATE INDEX IF NOT EXISTS idx_payments_provider ON payments(payment_provider);

-- Add index on provider_transaction_id for webhook lookups
CREATE INDEX IF NOT EXISTS idx_payments_provider_transaction_id ON payments(provider_transaction_id);

-- Add index on merchant_reference for POLi lookups
CREATE INDEX IF NOT EXISTS idx_payments_merchant_reference ON payments(merchant_reference);

-- Add check constraint for payment_provider values
ALTER TABLE payments 
ADD CONSTRAINT check_payment_provider 
CHECK (payment_provider IN ('stripe', 'poli', 'paypal', 'other'));

-- Add check constraint for payment_method values
ALTER TABLE payments 
DROP CONSTRAINT IF EXISTS check_payment_method;

ALTER TABLE payments 
ADD CONSTRAINT check_payment_method 
CHECK (payment_method IN (
  'stripe_card', 
  'stripe_checkout', 
  'poli_bank', 
  'paypal_checkout',
  'other'
));

-- Update escrow_accounts table to support different payment providers
ALTER TABLE escrow_accounts 
ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(20);

-- Update escrow accounts with provider info from payments
UPDATE escrow_accounts 
SET payment_provider = payments.payment_provider
FROM payments 
WHERE escrow_accounts.payment_id = payments.id;

-- Add index on escrow payment_provider
CREATE INDEX IF NOT EXISTS idx_escrow_accounts_provider ON escrow_accounts(payment_provider);

-- Create a view for payment provider statistics
CREATE OR REPLACE VIEW payment_provider_stats AS
SELECT 
  payment_provider,
  payment_method,
  COUNT(*) as total_payments,
  SUM(amount) as total_amount,
  AVG(amount) as average_amount,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_payments,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_payments,
  ROUND(
    (COUNT(CASE WHEN status = 'completed' THEN 1 END)::DECIMAL / COUNT(*) * 100), 2
  ) as success_rate
FROM payments 
GROUP BY payment_provider, payment_method
ORDER BY total_amount DESC;

-- Function to get payment provider configuration
CREATE OR REPLACE FUNCTION get_payment_provider_config(provider_name TEXT)
RETURNS TABLE(
  provider TEXT,
  display_name TEXT,
  supported_currencies TEXT[],
  available_regions TEXT[],
  requires_redirect BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN provider_name = 'stripe' THEN 'stripe'::TEXT
      WHEN provider_name = 'poli' THEN 'poli'::TEXT
      ELSE 'unknown'::TEXT
    END as provider,
    
    CASE 
      WHEN provider_name = 'stripe' THEN 'Credit/Debit Card (Stripe)'::TEXT
      WHEN provider_name = 'poli' THEN 'New Zealand Bank Transfer (POLi)'::TEXT
      ELSE 'Unknown Provider'::TEXT
    END as display_name,
    
    CASE 
      WHEN provider_name = 'stripe' THEN ARRAY['NZD', 'USD', 'AUD', 'CAD', 'EUR', 'GBP']::TEXT[]
      WHEN provider_name = 'poli' THEN ARRAY['NZD']::TEXT[]
      ELSE ARRAY[]::TEXT[]
    END as supported_currencies,
    
    CASE 
      WHEN provider_name = 'stripe' THEN ARRAY['NZ', 'US', 'AU', 'CA', 'GB', 'EU']::TEXT[]
      WHEN provider_name = 'poli' THEN ARRAY['NZ']::TEXT[]
      ELSE ARRAY[]::TEXT[]
    END as available_regions,
    
    CASE 
      WHEN provider_name = 'stripe' THEN FALSE
      WHEN provider_name = 'poli' THEN TRUE
      ELSE FALSE
    END as requires_redirect;
END;
$$ LANGUAGE plpgsql;

-- Function to get recommended payment provider for user
CREATE OR REPLACE FUNCTION get_recommended_payment_provider(user_region TEXT DEFAULT 'NZ')
RETURNS TEXT AS $$
BEGIN
  -- Prioritize POLi for New Zealand users
  IF user_region = 'NZ' OR user_region = 'NZL' THEN
    RETURN 'poli';
  END IF;
  
  -- Default to Stripe for other regions
  RETURN 'stripe';
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON COLUMN payments.payment_provider IS 'The payment service provider (stripe, poli, etc.)';
COMMENT ON COLUMN payments.provider_transaction_id IS 'Transaction ID from the payment provider';
COMMENT ON COLUMN payments.merchant_reference IS 'Merchant reference number for tracking';
COMMENT ON COLUMN payments.redirect_url IS 'Redirect URL for payment providers that require user redirection';
COMMENT ON COLUMN payments.poli_bank_receipt IS 'POLi bank receipt number';
COMMENT ON COLUMN payments.poli_bank_name IS 'POLi bank name for reference';

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT ON payment_provider_stats TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_payment_provider_config(TEXT) TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_recommended_payment_provider(TEXT) TO authenticated;