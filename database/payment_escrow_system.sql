-- Migration: Complete Payment & Escrow System
-- Date: 2025-01-25
-- Description: Comprehensive payment, escrow, withdrawal, and affiliate system

-- =============================================================================
-- PHASE 1: CORE PAYMENT & ESCROW TABLES
-- =============================================================================

-- Payment transactions with full escrow lifecycle
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  payer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tradie_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Stripe integration fields
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  stripe_customer_id TEXT,
  
  -- Amount breakdown
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  platform_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  affiliate_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  net_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Payment details
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'disputed')),
  payment_method TEXT CHECK (payment_method IN ('stripe_card', 'stripe_bank', 'paypal', 'bank_transfer')),
  currency TEXT NOT NULL DEFAULT 'NZD',
  
  -- Metadata
  payment_metadata JSONB DEFAULT '{}',
  failure_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE
);

-- Escrow management with protection periods
CREATE TABLE IF NOT EXISTS escrow_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  tradie_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parent_tradie_id UUID REFERENCES users(id), -- For affiliate fees
  
  -- Amount breakdown in escrow
  gross_amount DECIMAL(10,2) NOT NULL CHECK (gross_amount > 0),
  platform_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  affiliate_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_withheld DECIMAL(10,2) NOT NULL DEFAULT 0,
  net_amount DECIMAL(10,2) NOT NULL CHECK (net_amount >= 0),
  
  -- Protection period management
  protection_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  protection_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  protection_days INTEGER NOT NULL DEFAULT 15,
  
  -- Release management
  status TEXT NOT NULL DEFAULT 'held' CHECK (status IN ('held', 'released', 'disputed', 'withdrawn')),
  release_trigger TEXT CHECK (release_trigger IN ('manual', 'automatic', 'dispute_resolution')),
  release_notes TEXT,
  released_by UUID REFERENCES users(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  released_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Withdrawal requests and processing
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tradie_id UUID REFERENCES users(id) ON DELETE CASCADE,
  escrow_account_id UUID REFERENCES escrow_accounts(id) ON DELETE CASCADE,
  
  -- Withdrawal amounts
  requested_amount DECIMAL(10,2) NOT NULL CHECK (requested_amount > 0),
  tax_deducted DECIMAL(10,2) NOT NULL DEFAULT 0,
  processing_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  final_amount DECIMAL(10,2) NOT NULL CHECK (final_amount >= 0),
  
  -- Bank details (encrypted)
  bank_details JSONB NOT NULL DEFAULT '{}', -- Will store encrypted bank account info
  withdrawal_method TEXT NOT NULL DEFAULT 'bank_transfer' CHECK (withdrawal_method IN ('bank_transfer', 'paypal', 'stripe')),
  
  -- Processing details
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'failed', 'cancelled')),
  reference_number TEXT UNIQUE,
  external_transaction_id TEXT,
  failure_reason TEXT,
  
  -- Admin processing
  approved_by UUID REFERENCES users(id),
  processed_by UUID REFERENCES users(id),
  
  -- Timestamps
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  processed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliate earnings tracking for parent tradies
CREATE TABLE IF NOT EXISTS affiliate_earnings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_tradie_id UUID REFERENCES users(id) ON DELETE CASCADE,
  child_tradie_id UUID REFERENCES users(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  escrow_account_id UUID REFERENCES escrow_accounts(id) ON DELETE CASCADE,
  
  -- Fee details
  base_amount DECIMAL(10,2) NOT NULL CHECK (base_amount > 0), -- The project amount this fee is based on
  fee_rate DECIMAL(5,4) NOT NULL DEFAULT 0.02, -- 2% default affiliate fee
  fee_amount DECIMAL(10,2) NOT NULL CHECK (fee_amount >= 0),
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'available', 'withdrawn', 'disputed')),
  availability_date TIMESTAMP WITH TIME ZONE, -- When this becomes available for withdrawal
  
  -- Timestamps
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  available_at TIMESTAMP WITH TIME ZONE,
  withdrawn_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System configuration for fees, rates, and business rules
CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default system configuration
INSERT INTO system_config (key, value, description) VALUES
('PLATFORM_FEE_RATE', '0.10', 'Platform service fee rate (10%)'),
('AFFILIATE_FEE_RATE', '0.02', 'Affiliate management fee rate (2%)'),
('PROTECTION_DAYS', '15', 'Escrow protection period in days'),
('MIN_WITHDRAWAL_AMOUNT', '50.00', 'Minimum withdrawal amount in NZD'),
('WITHDRAWAL_PROCESSING_FEE', '2.50', 'Fixed fee for withdrawal processing'),
('TAX_RATES', '{"NZ": 0.15, "AU": 0.10, "CA": 0.13, "US": 0.20}', 'Tax withholding rates by country'),
('SUPPORTED_CURRENCIES', '["NZD", "AUD", "USD", "CAD"]', 'Supported payment currencies'),
('NOTIFICATION_EMAILS', '{"payment_confirmed": true, "escrow_released": true, "withdrawal_completed": true}', 'Email notification settings')
ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Payment table indexes
CREATE INDEX IF NOT EXISTS idx_payments_project_id ON payments(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_tradie_id ON payments(tradie_id);
CREATE INDEX IF NOT EXISTS idx_payments_payer_id ON payments(payer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_intent ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Escrow table indexes
CREATE INDEX IF NOT EXISTS idx_escrow_payment_id ON escrow_accounts(payment_id);
CREATE INDEX IF NOT EXISTS idx_escrow_tradie_id ON escrow_accounts(tradie_id);
CREATE INDEX IF NOT EXISTS idx_escrow_parent_tradie ON escrow_accounts(parent_tradie_id);
CREATE INDEX IF NOT EXISTS idx_escrow_status ON escrow_accounts(status);
CREATE INDEX IF NOT EXISTS idx_escrow_protection_end ON escrow_accounts(protection_end_date);
CREATE INDEX IF NOT EXISTS idx_escrow_released_at ON escrow_accounts(released_at);

-- Withdrawal table indexes
CREATE INDEX IF NOT EXISTS idx_withdrawals_tradie_id ON withdrawals(tradie_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_escrow_id ON withdrawals(escrow_account_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_requested_at ON withdrawals(requested_at);
CREATE INDEX IF NOT EXISTS idx_withdrawals_reference ON withdrawals(reference_number);

-- Affiliate earnings indexes
CREATE INDEX IF NOT EXISTS idx_affiliate_parent_id ON affiliate_earnings(parent_tradie_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_child_id ON affiliate_earnings(child_tradie_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_payment_id ON affiliate_earnings(payment_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_status ON affiliate_earnings(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_available_date ON affiliate_earnings(availability_date);

-- =============================================================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- =============================================================================

-- Function to calculate fees based on amount and tradie relationship
CREATE OR REPLACE FUNCTION calculate_payment_fees(
  p_amount DECIMAL(10,2),
  p_tradie_id UUID,
  p_currency TEXT DEFAULT 'NZD'
)
RETURNS TABLE (
  platform_fee DECIMAL(10,2),
  affiliate_fee DECIMAL(10,2),
  tax_amount DECIMAL(10,2),
  net_amount DECIMAL(10,2),
  parent_tradie_id UUID
) AS $$
DECLARE
  v_platform_rate DECIMAL(5,4);
  v_affiliate_rate DECIMAL(5,4);
  v_tax_rate DECIMAL(5,4);
  v_parent_id UUID;
  v_tradie_country TEXT;
BEGIN
  -- Get system configuration rates
  SELECT (value::text)::DECIMAL INTO v_platform_rate FROM system_config WHERE key = 'PLATFORM_FEE_RATE';
  SELECT (value::text)::DECIMAL INTO v_affiliate_rate FROM system_config WHERE key = 'AFFILIATE_FEE_RATE';
  
  -- Check if tradie has a parent (affiliate relationship)
  SELECT parent_tradie_id INTO v_parent_id FROM users WHERE id = p_tradie_id;
  
  -- Get tradie's country for tax calculation
  SELECT COALESCE(address_country, 'NZ') INTO v_tradie_country FROM users WHERE id = p_tradie_id;
  
  -- Get tax rate for country
  SELECT COALESCE((value->v_tradie_country)::text::DECIMAL, 0.15) INTO v_tax_rate 
  FROM system_config WHERE key = 'TAX_RATES';
  
  -- Calculate fees
  platform_fee := ROUND(p_amount * v_platform_rate, 2);
  affiliate_fee := CASE WHEN v_parent_id IS NOT NULL THEN ROUND(p_amount * v_affiliate_rate, 2) ELSE 0 END;
  tax_amount := ROUND(p_amount * v_tax_rate, 2);
  net_amount := p_amount - platform_fee - affiliate_fee - tax_amount;
  parent_tradie_id := v_parent_id;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to create escrow account after successful payment
CREATE OR REPLACE FUNCTION create_escrow_account(
  p_payment_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_escrow_id UUID;
  v_payment payments%ROWTYPE;
  v_protection_days INTEGER;
  v_protection_end TIMESTAMP WITH TIME ZONE;
  v_parent_tradie_id UUID;
BEGIN
  -- Get payment details
  SELECT * INTO v_payment FROM payments WHERE id = p_payment_id;
  
  IF v_payment.id IS NULL THEN
    RAISE EXCEPTION 'Payment not found: %', p_payment_id;
  END IF;
  
  -- Get protection period configuration
  SELECT (value::text)::INTEGER INTO v_protection_days FROM system_config WHERE key = 'PROTECTION_DAYS';
  v_protection_end := NOW() + INTERVAL '1 day' * v_protection_days;
  
  -- Get parent tradie if exists
  SELECT parent_tradie_id INTO v_parent_tradie_id FROM users WHERE id = v_payment.tradie_id;
  
  -- Create escrow account
  INSERT INTO escrow_accounts (
    payment_id,
    tradie_id,
    parent_tradie_id,
    gross_amount,
    platform_fee,
    affiliate_fee,
    tax_withheld,
    net_amount,
    protection_end_date,
    protection_days
  ) VALUES (
    p_payment_id,
    v_payment.tradie_id,
    v_parent_tradie_id,
    v_payment.amount,
    v_payment.platform_fee,
    v_payment.affiliate_fee,
    v_payment.tax_amount,
    v_payment.net_amount,
    v_protection_end,
    v_protection_days
  ) RETURNING id INTO v_escrow_id;
  
  -- If there's an affiliate fee, create affiliate earnings record
  IF v_parent_tradie_id IS NOT NULL AND v_payment.affiliate_fee > 0 THEN
    INSERT INTO affiliate_earnings (
      parent_tradie_id,
      child_tradie_id,
      payment_id,
      escrow_account_id,
      base_amount,
      fee_amount,
      availability_date
    ) VALUES (
      v_parent_tradie_id,
      v_payment.tradie_id,
      p_payment_id,
      v_escrow_id,
      v_payment.amount,
      v_payment.affiliate_fee,
      v_protection_end
    );
  END IF;
  
  RETURN v_escrow_id;
END;
$$ LANGUAGE plpgsql;

-- Function to release escrow funds (manual or automatic)
CREATE OR REPLACE FUNCTION release_escrow_funds(
  p_escrow_id UUID,
  p_release_trigger TEXT DEFAULT 'manual',
  p_released_by UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_escrow escrow_accounts%ROWTYPE;
BEGIN
  -- Get escrow account details
  SELECT * INTO v_escrow FROM escrow_accounts WHERE id = p_escrow_id;
  
  IF v_escrow.id IS NULL THEN
    RAISE EXCEPTION 'Escrow account not found: %', p_escrow_id;
  END IF;
  
  IF v_escrow.status != 'held' THEN
    RAISE EXCEPTION 'Escrow account is not in held status: %', v_escrow.status;
  END IF;
  
  -- Update escrow account status
  UPDATE escrow_accounts 
  SET 
    status = 'released',
    release_trigger = p_release_trigger,
    released_by = p_released_by,
    release_notes = p_notes,
    released_at = NOW(),
    updated_at = NOW()
  WHERE id = p_escrow_id;
  
  -- Update affiliate earnings availability if exists
  UPDATE affiliate_earnings
  SET 
    status = 'available',
    available_at = NOW(),
    updated_at = NOW()
  WHERE escrow_account_id = p_escrow_id AND status = 'pending';
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to process automatic escrow releases (for cron job)
CREATE OR REPLACE FUNCTION process_automatic_escrow_releases()
RETURNS TABLE (
  escrow_id UUID,
  tradie_id UUID,
  amount DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  WITH released_escrows AS (
    UPDATE escrow_accounts
    SET 
      status = 'released',
      release_trigger = 'automatic',
      released_at = NOW(),
      updated_at = NOW()
    WHERE status = 'held' 
      AND protection_end_date <= NOW()
    RETURNING id, tradie_id, net_amount
  )
  SELECT r.id, r.tradie_id, r.net_amount FROM released_escrows r;
  
  -- Update corresponding affiliate earnings
  UPDATE affiliate_earnings
  SET 
    status = 'available',
    available_at = NOW(),
    updated_at = NOW()
  WHERE escrow_account_id IN (
    SELECT ea.id FROM escrow_accounts ea 
    WHERE ea.status = 'released' 
      AND ea.release_trigger = 'automatic' 
      AND ea.released_at > NOW() - INTERVAL '1 minute'
  ) AND status = 'pending';
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS FOR AUTOMATED WORKFLOWS
-- =============================================================================

-- Trigger to update timestamps on escrow_accounts
CREATE OR REPLACE FUNCTION update_escrow_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_escrow_updated_at ON escrow_accounts;
CREATE TRIGGER trigger_escrow_updated_at
  BEFORE UPDATE ON escrow_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_escrow_updated_at();

-- Trigger to update timestamps on withdrawals
CREATE OR REPLACE FUNCTION update_withdrawal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_withdrawal_updated_at ON withdrawals;
CREATE TRIGGER trigger_withdrawal_updated_at
  BEFORE UPDATE ON withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION update_withdrawal_updated_at();

-- Trigger to update timestamps on affiliate_earnings
CREATE OR REPLACE FUNCTION update_affiliate_earnings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_affiliate_earnings_updated_at ON affiliate_earnings;
CREATE TRIGGER trigger_affiliate_earnings_updated_at
  BEFORE UPDATE ON affiliate_earnings
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_earnings_updated_at();

-- =============================================================================
-- VIEWS FOR EASY DATA ACCESS
-- =============================================================================

-- View for tradie earnings summary
CREATE OR REPLACE VIEW tradie_earnings_summary AS
SELECT 
  t.id as tradie_id,
  t.name as tradie_name,
  COALESCE(SUM(CASE WHEN ea.status = 'held' THEN ea.net_amount ELSE 0 END), 0) as pending_escrow,
  COALESCE(SUM(CASE WHEN ea.status = 'released' THEN ea.net_amount ELSE 0 END), 0) as available_balance,
  COALESCE(SUM(CASE WHEN w.status = 'completed' THEN w.final_amount ELSE 0 END), 0) as withdrawn_total,
  COUNT(DISTINCT p.id) as total_payments,
  COUNT(DISTINCT CASE WHEN ea.status = 'held' THEN ea.id END) as active_escrows
FROM users t
LEFT JOIN payments p ON t.id = p.tradie_id AND p.status = 'completed'
LEFT JOIN escrow_accounts ea ON p.id = ea.payment_id
LEFT JOIN withdrawals w ON ea.id = w.escrow_account_id
INNER JOIN user_roles ur ON t.id = ur.user_id AND ur.role_type = 'tradie'
GROUP BY t.id, t.name;

-- View for affiliate earnings summary
CREATE OR REPLACE VIEW affiliate_earnings_summary AS
SELECT 
  pt.id as parent_tradie_id,
  pt.name as parent_tradie_name,
  COUNT(DISTINCT ct.id) as subordinate_count,
  COALESCE(SUM(CASE WHEN ae.status = 'pending' THEN ae.fee_amount ELSE 0 END), 0) as pending_fees,
  COALESCE(SUM(CASE WHEN ae.status = 'available' THEN ae.fee_amount ELSE 0 END), 0) as available_fees,
  COALESCE(SUM(CASE WHEN ae.status = 'withdrawn' THEN ae.fee_amount ELSE 0 END), 0) as withdrawn_fees,
  COALESCE(SUM(ae.fee_amount), 0) as total_fees_earned
FROM users pt
LEFT JOIN users ct ON pt.id = ct.parent_tradie_id
LEFT JOIN affiliate_earnings ae ON pt.id = ae.parent_tradie_id
INNER JOIN user_roles ur ON pt.id = ur.user_id AND ur.role_type = 'tradie'
WHERE pt.parent_tradie_id IS NULL  -- Only parent tradies
GROUP BY pt.id, pt.name;

-- =============================================================================
-- COMMENTS AND DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE payments IS 'Central payment transactions table with Stripe integration';
COMMENT ON TABLE escrow_accounts IS 'Escrow management with automatic protection period handling';
COMMENT ON TABLE withdrawals IS 'Withdrawal requests and processing for tradies';
COMMENT ON TABLE affiliate_earnings IS 'Affiliate fee tracking for parent-child tradie relationships';
COMMENT ON TABLE system_config IS 'System-wide configuration for fees, rates, and business rules';

COMMENT ON FUNCTION calculate_payment_fees(DECIMAL, UUID, TEXT) IS 'Calculate all fees for a payment including platform, affiliate, and tax';
COMMENT ON FUNCTION create_escrow_account(UUID) IS 'Create escrow account after successful payment confirmation';
COMMENT ON FUNCTION release_escrow_funds(UUID, TEXT, UUID, TEXT) IS 'Release escrow funds manually or automatically';
COMMENT ON FUNCTION process_automatic_escrow_releases() IS 'Process automatic escrow releases for cron job';

-- Migration complete
-- Next steps: Run this migration, then implement Stripe integration and API endpoints