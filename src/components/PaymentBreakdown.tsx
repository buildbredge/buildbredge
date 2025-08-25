"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  DollarSign, 
  Calculator, 
  Building2, 
  Receipt,
  Shield,
  InfoIcon
} from "lucide-react"
import { FeeBreakdown } from "@/lib/stripe"

interface PaymentBreakdownProps {
  amount: number
  fees: FeeBreakdown
  currency?: string
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
  fees,
  currency = "NZD",
  tradieInfo,
  projectInfo,
  className = ""
}: PaymentBreakdownProps) {
  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: currency
    }).format(value)
  }

  const feePercentage = {
    platform: ((fees.platformFee / amount) * 100).toFixed(1),
    affiliate: fees.affiliateFee > 0 ? ((fees.affiliateFee / amount) * 100).toFixed(1) : null,
    tax: ((fees.taxAmount / amount) * 100).toFixed(1)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="w-5 h-5 mr-2 text-blue-600" />
          Payment Breakdown
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
          <Separator />
        </div>

        {/* Fee Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Receipt className="w-4 h-4 mr-2" />
            Fee Breakdown
          </h4>
          
          {/* Platform Fee */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Platform Service Fee</span>
              <Badge variant="outline" className="text-xs">
                {feePercentage.platform}%
              </Badge>
              <div className="group relative">
                <InfoIcon className="w-3 h-3 text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs p-2 rounded max-w-xs">
                  Platform fee covers payment processing, dispute resolution, and platform maintenance
                </div>
              </div>
            </div>
            <span className="text-red-600">-{formatAmount(fees.platformFee)}</span>
          </div>

          {/* Affiliate Fee */}
          {fees.affiliateFee > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Affiliate Management Fee</span>
                <Badge variant="outline" className="text-xs">
                  {feePercentage.affiliate}%
                </Badge>
                <div className="group relative">
                  <InfoIcon className="w-3 h-3 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs p-2 rounded max-w-xs">
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
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs p-2 rounded max-w-xs">
                  Tax withheld based on tradie's jurisdiction. Tax documentation will be provided.
                </div>
              </div>
            </div>
            <span className="text-red-600">-{formatAmount(fees.taxAmount)}</span>
          </div>

          <Separator />

          {/* Net Amount to Tradie */}
          <div className="flex items-center justify-between text-base font-semibold bg-green-50 p-3 rounded-lg">
            <span className="text-green-800">Tradie will receive:</span>
            <span className="text-green-600 text-lg">{formatAmount(fees.netAmount)}</span>
          </div>
        </div>

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
            You pay the full project amount. Fees are deducted from tradie's payment.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}