"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  DollarSign, 
  Calculator, 
  Building2, 
  Receipt,
  Shield,
  InfoIcon,
  Loader2
} from "lucide-react"
import type { FeeBreakdown } from "@/lib/payment/interfaces/types"

interface PaymentBreakdownProps {
  amount: number
  tradieId?: string
  fees?: FeeBreakdown
  currency?: string
  showDetails?: boolean
  showPlatformFee?: boolean // 是否显示平台费用
  showTradieEarnings?: boolean // 是否显示技师收入
  tradieInfo?: {
    name: string
    company?: string
    isAffiliate: boolean
    parentTradieName?: string
  }
  projectInfo?: {
    title: string
    description?: string
  }
  className?: string
}

export function PaymentBreakdown({
  amount,
  tradieId,
  fees: providedFees,
  currency = "NZD",
  showDetails = false,
  showPlatformFee = true, // 默认显示平台费用
  showTradieEarnings = true, // 默认显示技师收入
  tradieInfo,
  projectInfo,
  className = ""
}: PaymentBreakdownProps) {
  const [fees, setFees] = useState<FeeBreakdown | null>(providedFees || null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: currency
    }).format(value)
  }

  // Fetch fees if not provided and tradieId is available
  useEffect(() => {
    if (!providedFees && tradieId && showDetails) {
      setIsLoading(true)
      // For now, use default fee structure
      // In production, this would fetch from API
      const defaultFees: FeeBreakdown = {
        platformFee: amount * 0.10, // 10%
        affiliateFee: 0,
        taxAmount: amount * 0.15, // 15% GST
        netAmount: amount * 0.75,
        parentTradieId: null
      }
      setFees(defaultFees)
      setIsLoading(false)
    }
  }, [amount, tradieId, providedFees, showDetails])

  const feePercentage = fees ? {
    platform: ((fees.platformFee / amount) * 100).toFixed(1),
    affiliate: fees.affiliateFee > 0 ? ((fees.affiliateFee / amount) * 100).toFixed(1) : null,
    tax: ((fees.taxAmount / amount) * 100).toFixed(1)
  } : null

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Calculating fees...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="w-5 h-5 mr-2 text-blue-600" />
          Payment Summary
        </CardTitle>
        {projectInfo && (
          <div className="text-sm text-gray-600">
            <p className="font-medium">{projectInfo.title}</p>
            {projectInfo.description && (
              <p className="text-xs text-gray-500 mt-1">{projectInfo.description}</p>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Tradie Information */}
        {tradieInfo && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Building2 className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-900">{tradieInfo.name}</span>
              {tradieInfo.isAffiliate && (
                <Badge variant="secondary" className="text-xs">
                  Affiliate
                </Badge>
              )}
            </div>
            {tradieInfo.company && (
              <p className="text-sm text-gray-600">{tradieInfo.company}</p>
            )}
            {tradieInfo.isAffiliate && tradieInfo.parentTradieName && (
              <p className="text-xs text-gray-500">
                Managed by: {tradieInfo.parentTradieName}
              </p>
            )}
          </div>
        )}

        {/* Payment Amount */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-lg font-semibold">
            <span className="flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              Project Amount:
            </span>
            <span className="text-green-600">{formatAmount(amount)}</span>
          </div>
          {showDetails && fees && <Separator />}
        </div>

        {/* Fee Breakdown - only show if requested and fees available */}
        {showDetails && fees && feePercentage && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Receipt className="w-4 h-4 mr-2" />
              Fee Breakdown
            </h4>
            
            {/* Platform Fee - 只在允许时显示 */}
            {showPlatformFee && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Platform Service Fee</span>
                  <Badge variant="outline" className="text-xs">
                    {feePercentage.platform}%
                  </Badge>
                  <div className="group relative">
                    <InfoIcon className="w-3 h-3 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs p-2 rounded max-w-xs z-10">
                      Platform fee covers payment processing, dispute resolution, and platform maintenance
                    </div>
                  </div>
                </div>
                <span className="text-red-600">-{formatAmount(fees.platformFee)}</span>
              </div>
            )}

            {/* Affiliate Fee */}
            {fees.affiliateFee > 0 && feePercentage.affiliate && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Affiliate Management Fee</span>
                  <Badge variant="outline" className="text-xs">
                    {feePercentage.affiliate}%
                  </Badge>
                  <div className="group relative">
                    <InfoIcon className="w-3 h-3 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs p-2 rounded max-w-xs z-10">
                      Management fee paid to the parent tradie for overseeing this affiliate
                    </div>
                  </div>
                </div>
                <span className="text-red-600">-{formatAmount(fees.affiliateFee)}</span>
              </div>
            )}

            {/* Tax Withholding */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Tax Withholding</span>
                <Badge variant="outline" className="text-xs">
                  {feePercentage.tax}%
                </Badge>
                <div className="group relative">
                  <InfoIcon className="w-3 h-3 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs p-2 rounded max-w-xs z-10">
                    Tax withheld based on tradie's jurisdiction. Tax documentation will be provided.
                  </div>
                </div>
              </div>
              <span className="text-red-600">-{formatAmount(fees.taxAmount)}</span>
            </div>

            <Separator />

            {/* Net Amount to Tradie - 只在允许时显示 */}
            {showTradieEarnings && (
              <div className="flex items-center justify-between text-base font-semibold bg-green-50 p-3 rounded-lg">
                <span className="text-green-800">Tradie will receive:</span>
                <span className="text-green-600 text-lg">{formatAmount(fees.netAmount)}</span>
              </div>
            )}
          </div>
        )}

        {/* Security Information */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-800">Payment Protection</span>
          </div>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Funds are held securely in escrow until project completion</li>
            <li>• 15-day protection period after project completion</li>
            <li>• Full dispute resolution support</li>
            <li>• Automatic release or manual confirmation by owner</li>
          </ul>
        </div>

        {/* Total Payment */}
        <div className="border-2 border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-xl font-bold">
            <span className="text-gray-900">Total Payment:</span>
            <span className="text-green-600">{formatAmount(amount)}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            You pay the full project amount. {showDetails && fees ? 'Fees are deducted from tradie\'s payment.' : 'Fees will be calculated at checkout.'}
          </p>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}