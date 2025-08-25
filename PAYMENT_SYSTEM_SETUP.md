# Payment & Escrow System Setup Guide

This guide provides step-by-step instructions to set up the complete payment and escrow system for BuildBridge.

## 🗄️ Database Setup

### 1. Run the Database Migration

Execute the comprehensive migration script to set up all payment-related tables:

```bash
# Connect to your Supabase database and run:
psql -h your-supabase-host -U postgres -d postgres -f database/payment_escrow_system.sql
```

Or through the Supabase Dashboard:
1. Go to SQL Editor
2. Copy the contents of `database/payment_escrow_system.sql`
3. Execute the script

### 2. Verify Database Setup

Check that all tables and functions were created successfully:

```sql
-- Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'payments', 'escrow_accounts', 'withdrawals', 
    'affiliate_earnings', 'system_config'
);

-- Verify functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'calculate_payment_fees', 'create_escrow_account', 
    'release_escrow_funds', 'process_automatic_escrow_releases'
);

-- Check system configuration
SELECT * FROM system_config;
```

## 🔐 Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Existing Supabase vars
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Cron Job Security
CRON_SECRET=your_secure_cron_secret_for_automatic_releases

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🔧 Stripe Setup

### 1. Create Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create an account or sign in
3. Switch to **Test Mode** for development

### 2. Get API Keys
1. Go to Developers → API keys
2. Copy your **Publishable key** (pk_test_...)
3. Copy your **Secret key** (sk_test_...)

### 3. Configure Webhooks
1. Go to Developers → Webhooks
2. Click "Add endpoint"
3. Set endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.dispute.created`
5. Copy the **Signing secret** (whsec_...)

## 📦 Dependencies

Install the required packages:

```bash
npm install stripe @stripe/stripe-js
```

## 🚀 System Configuration

### 1. Fee Rates Configuration

The system comes with default configurations, but you can modify them:

```sql
-- Update platform fee (default: 10%)
UPDATE system_config 
SET value = '0.12' 
WHERE key = 'PLATFORM_FEE_RATE';

-- Update affiliate fee (default: 2%)
UPDATE system_config 
SET value = '0.025' 
WHERE key = 'AFFILIATE_FEE_RATE';

-- Update protection period (default: 15 days)
UPDATE system_config 
SET value = '21' 
WHERE key = 'PROTECTION_DAYS';
```

### 2. Tax Rates Configuration

Configure tax rates by region:

```sql
-- Update tax rates
UPDATE system_config 
SET value = '{"NZ": 0.15, "AU": 0.10, "CA": 0.13, "US": 0.20, "UK": 0.20}' 
WHERE key = 'TAX_RATES';
```

## 🔄 Cron Job Setup

Set up automatic escrow releases for funds that have passed the protection period.

### Option 1: Vercel Cron (Recommended for Vercel deployments)

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/escrow-releases",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### Option 2: GitHub Actions

Create `.github/workflows/escrow-releases.yml`:

```yaml
name: Daily Escrow Releases
on:
  schedule:
    - cron: '0 9 * * *'  # Daily at 9 AM UTC
  workflow_dispatch:

jobs:
  release-escrow:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Escrow Release
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-domain.com/api/cron/escrow-releases
```

### Option 3: External Cron Service

Use a service like cron-job.org or EasyCron:
- URL: `https://your-domain.com/api/cron/escrow-releases`
- Method: POST
- Headers: `Authorization: Bearer your_cron_secret`
- Schedule: Daily at 9 AM

## 🧪 Testing

### 1. Test Fee Calculation

```bash
# Test the fee calculation function
curl -X POST http://localhost:3000/api/test/fees \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "tradieId": "your_tradie_id"
  }'
```

### 2. Test Payment Flow

1. Create a test quote in your system
2. Navigate to: `http://localhost:3000/payment/enhanced?projectId=PROJECT_ID&quoteId=QUOTE_ID&amount=AMOUNT`
3. Use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0000 0000 3220`

### 3. Test Webhook

```bash
# Install Stripe CLI
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
```

## 🔍 Monitoring & Debugging

### 1. Check Payment Status

```sql
-- View recent payments
SELECT 
  p.*,
  proj.description as project_title,
  u.name as tradie_name
FROM payments p
JOIN projects proj ON p.project_id = proj.id
JOIN users u ON p.tradie_id = u.id
ORDER BY p.created_at DESC
LIMIT 10;
```

### 2. Check Escrow Accounts

```sql
-- View active escrow accounts
SELECT 
  ea.*,
  u.name as tradie_name,
  p.amount as payment_amount
FROM escrow_accounts ea
JOIN users u ON ea.tradie_id = u.id
JOIN payments p ON ea.payment_id = p.id
WHERE ea.status = 'held'
ORDER BY ea.protection_end_date;
```

### 3. Monitor Automatic Releases

```sql
-- Check escrow accounts ready for release
SELECT 
  ea.*,
  u.name as tradie_name,
  (ea.protection_end_date < NOW()) as is_ready_for_release
FROM escrow_accounts ea
JOIN users u ON ea.tradie_id = u.id
WHERE ea.status = 'held'
ORDER BY ea.protection_end_date;
```

## 🚨 Security Considerations

### 1. Environment Security
- Never commit API keys to version control
- Use different keys for development and production
- Rotate webhook secrets periodically

### 2. Database Security
- Enable Row Level Security (RLS) on all payment tables
- Limit database access to service accounts only
- Regular backups of payment data

### 3. Webhook Security
- Always verify webhook signatures
- Use HTTPS for all webhook endpoints
- Log webhook events for auditing

## 📊 Analytics & Reporting

### 1. Financial Dashboard Queries

```sql
-- Monthly payment volume
SELECT 
  DATE_TRUNC('month', confirmed_at) as month,
  COUNT(*) as payment_count,
  SUM(amount) as total_amount,
  SUM(platform_fee) as platform_revenue
FROM payments 
WHERE status = 'completed'
GROUP BY month
ORDER BY month DESC;

-- Affiliate earnings summary
SELECT 
  u.name as parent_tradie,
  COUNT(DISTINCT ae.child_tradie_id) as subordinates,
  SUM(ae.fee_amount) as total_fees_earned
FROM affiliate_earnings ae
JOIN users u ON ae.parent_tradie_id = u.id
GROUP BY u.id, u.name
ORDER BY total_fees_earned DESC;
```

## 🛠️ Maintenance

### 1. Regular Tasks
- Monitor failed payments and retry
- Review disputed payments
- Process withdrawal requests
- Update tax rates as needed
- Monitor system performance

### 2. Database Maintenance
- Vacuum payment tables monthly
- Archive old completed transactions
- Monitor disk usage
- Update statistics

## 🆘 Troubleshooting

### Common Issues

1. **Payments not confirming**: Check webhook configuration and SSL certificates
2. **Fee calculations wrong**: Verify system_config values
3. **Escrow not releasing**: Check cron job setup and protection period settings
4. **Stripe errors**: Verify API keys and webhook secrets

### Support Contacts
- Technical issues: Check GitHub Issues
- Payment processing: Stripe Support
- Database issues: Supabase Support

---

## ✅ Setup Checklist

- [ ] Database migration completed
- [ ] Environment variables configured
- [ ] Stripe account setup and keys obtained
- [ ] Webhook endpoint configured
- [ ] Dependencies installed
- [ ] Cron job for automatic releases setup
- [ ] Test payment completed successfully
- [ ] Webhook events tested
- [ ] Monitoring queries verified
- [ ] Security measures implemented

After completing this checklist, your payment and escrow system should be fully operational!