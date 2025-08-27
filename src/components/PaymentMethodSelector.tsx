'use client'

import { useState } from 'react'
import { CreditCard, Building2, CheckCircle, Info } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { PaymentProvider } from '@/lib/payment/interfaces/types'

interface PaymentMethod {
  provider: PaymentProvider
  name: string
  description: string
  icon: React.ReactNode
  recommended?: boolean
  supportedCurrencies: string[]
  processingTime: string
  features: string[]
  limitations?: string[]
}

interface PaymentMethodSelectorProps {
  onSelect: (provider: PaymentProvider) => void
  selectedProvider?: PaymentProvider
  userRegion?: string
  currency?: string
  disabled?: boolean
}

const paymentMethods: PaymentMethod[] = [
  {
    provider: 'stripe',
    name: 'Credit/Debit Card',
    description: 'Pay instantly with your Visa, Mastercard, or other cards',
    icon: <CreditCard className="h-6 w-6" />,
    supportedCurrencies: ['NZD', 'USD', 'AUD', 'CAD', 'EUR', 'GBP'],
    processingTime: 'Instant',
    features: [
      'Instant payment confirmation',
      'Secure card processing',
      'International cards supported',
      'Automatic currency conversion'
    ],
  },
  {
    provider: 'poli',
    name: 'Bank Transfer (POLi)',
    description: 'Pay directly from your New Zealand bank account',
    icon: <Building2 className="h-6 w-6" />,
    recommended: true,
    supportedCurrencies: ['NZD'],
    processingTime: '1-2 minutes',
    features: [
      'Direct bank account payment',
      'No card fees',
      'Works with major NZ banks',
      'Secure online banking'
    ],
    limitations: [
      'New Zealand banks only',
      'NZD currency only'
    ]
  }
]

export default function PaymentMethodSelector({
  onSelect,
  selectedProvider,
  userRegion = 'NZ',
  currency = 'NZD',
  disabled = false
}: PaymentMethodSelectorProps) {
  const [hoveredMethod, setHoveredMethod] = useState<PaymentProvider | null>(null)

  // Filter methods based on region and currency
  const availableMethods = paymentMethods.filter(method => {
    // Check currency support
    if (!method.supportedCurrencies.includes(currency)) {
      return false
    }

    // Check region availability
    if (method.provider === 'poli' && !['NZ', 'NZL'].includes(userRegion)) {
      return false
    }

    return true
  })

  const handleMethodSelect = (provider: PaymentProvider) => {
    if (disabled) return
    onSelect(provider)
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Payment Method</h2>
        <p className="text-gray-600">Select how you'd like to pay for this project</p>
      </div>

      {/* Regional recommendation */}
      {userRegion === 'NZ' && currency === 'NZD' && (
        <Alert className="border-green-200 bg-green-50">
          <Info className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            <strong>Recommended for New Zealand:</strong> POLi bank transfer offers direct payment from your bank account with no card fees.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {availableMethods.map((method) => {
          const isSelected = selectedProvider === method.provider
          const isHovered = hoveredMethod === method.provider

          return (
            <Card
              key={method.provider}
              className={`relative cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' 
                  : isHovered 
                    ? 'border-gray-300 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleMethodSelect(method.provider)}
              onMouseEnter={() => !disabled && setHoveredMethod(method.provider)}
              onMouseLeave={() => setHoveredMethod(null)}
            >
              {method.recommended && (
                <div className="absolute -top-2 left-4">
                  <Badge className="bg-green-500 hover:bg-green-500">
                    Recommended
                  </Badge>
                </div>
              )}

              {isSelected && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {method.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{method.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {method.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Processing time:</span>
                  <span className="font-medium">{method.processingTime}</span>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-800 mb-2">Features:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {method.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {method.limitations && method.limitations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-800 mb-2">Limitations:</h4>
                    <ul className="text-xs text-gray-500 space-y-1">
                      {method.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <Info className="h-3 w-3 text-orange-500 flex-shrink-0" />
                          <span>{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <div className="flex flex-wrap gap-1">
                    {method.supportedCurrencies.slice(0, 3).map((curr) => (
                      <Badge key={curr} variant="secondary" className="text-xs">
                        {curr}
                      </Badge>
                    ))}
                    {method.supportedCurrencies.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{method.supportedCurrencies.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {availableMethods.length === 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <Info className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-700">
            No payment methods are available for {currency} in {userRegion}. Please contact support for assistance.
          </AlertDescription>
        </Alert>
      )}

      {selectedProvider && (
        <div className="text-center pt-4">
          <Button 
            onClick={() => handleMethodSelect(selectedProvider)}
            disabled={disabled}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Continue with {availableMethods.find(m => m.provider === selectedProvider)?.name}
          </Button>
        </div>
      )}
    </div>
  )
}