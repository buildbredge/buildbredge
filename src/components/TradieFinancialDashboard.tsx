"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  DollarSign,
  Clock,
  TrendingUp,
  Download,
  CreditCard,
  Users,
  Shield,
  AlertCircle,
  CheckCircle,
  Building2,
  Calendar,
  ExternalLink,
  Loader2
} from "lucide-react"
import { EscrowTracker } from "./EscrowTracker"

interface TradieEarnings {
  summary: {
    tradie_id: string
    tradie_name: string
    pending_escrow: number
    available_balance: number
    withdrawn_total: number
    total_payments: number
    active_escrows: number
  }
  availableBalance: number
  escrowAccounts: any[]
  withdrawals: any[]
  protectionPeriodStatus: any[]
  affiliateEarnings?: {
    subordinate_count: number
    pending_fees: number
    available_fees: number
    withdrawn_fees: number
    total_fees_earned: number
    details: any[]
  }
}

interface TradieFinancialDashboardProps {
  tradieId: string
  tradie: {
    id: string
    name: string
    email: string
    company?: string
    isAffiliate: boolean
  }
}

export function TradieFinancialDashboard({ tradieId, tradie }: TradieFinancialDashboardProps) {
  const [earnings, setEarnings] = useState<TradieEarnings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchEarnings()
  }, [tradieId])

  const fetchEarnings = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      
      setError("")

      const response = await fetch(`/api/tradies/${tradieId}/earnings`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch earnings')
      }

      setEarnings(data.earnings)
    } catch (err: any) {
      console.error('Error fetching earnings:', err)
      setError(err.message || 'Failed to fetch earnings')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD'
    }).format(amount)
  }

  const getEscrowStatusBadge = (status: string) => {
    const statusConfig = {
      held: { label: 'Held', variant: 'default' as const, color: 'text-blue-600' },
      released: { label: 'Released', variant: 'default' as const, color: 'text-green-600' },
      disputed: { label: 'Disputed', variant: 'destructive' as const, color: 'text-red-600' },
      withdrawn: { label: 'Withdrawn', variant: 'secondary' as const, color: 'text-gray-600' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig]
    return config || { label: status, variant: 'outline' as const, color: 'text-gray-600' }
  }

  const getWithdrawalStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
      approved: { label: 'Approved', variant: 'default' as const, icon: CheckCircle },
      processing: { label: 'Processing', variant: 'default' as const, icon: Loader2 },
      completed: { label: 'Completed', variant: 'default' as const, icon: CheckCircle },
      failed: { label: 'Failed', variant: 'destructive' as const, icon: AlertCircle },
      cancelled: { label: 'Cancelled', variant: 'outline' as const, icon: AlertCircle }
    }
    
    return statusConfig[status as keyof typeof statusConfig] || 
           { label: status, variant: 'outline' as const, icon: AlertCircle }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-3" />
          <span>Loading financial information...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => fetchEarnings()} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!earnings) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-gray-500">No earnings data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Financial Dashboard</h2>
          <div className="flex items-center space-x-2 mt-1">
            <p className="text-gray-600">{tradie.name}</p>
            {tradie.company && (
              <>
                <span className="text-gray-400">•</span>
                <div className="flex items-center text-gray-600">
                  <Building2 className="w-3 h-3 mr-1" />
                  {tradie.company}
                </div>
              </>
            )}
            {tradie.isAffiliate && (
              <Badge variant="secondary" className="ml-2">Affiliate</Badge>
            )}
          </div>
        </div>
        <Button 
          onClick={() => fetchEarnings(true)}
          disabled={refreshing}
          variant="outline"
        >
          {refreshing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <TrendingUp className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Available Balance */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Balance</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatAmount(earnings.availableBalance)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Ready for withdrawal
            </p>
          </CardContent>
        </Card>

        {/* Pending Escrow */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Escrow</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatAmount(earnings.summary?.pending_escrow || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {earnings.summary?.active_escrows || 0} active escrow{earnings.summary?.active_escrows !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        {/* Total Withdrawn */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Withdrawn</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatAmount(earnings.summary?.withdrawn_total || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Download className="w-6 h-6 text-gray-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Lifetime withdrawals
            </p>
          </CardContent>
        </Card>

        {/* Total Payments */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-purple-600">
                  {earnings.summary?.total_payments || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Completed projects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Affiliate Earnings (if applicable) */}
      {earnings.affiliateEarnings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-indigo-600" />
              Affiliate Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {earnings.affiliateEarnings.subordinate_count}
                </div>
                <div className="text-sm text-gray-600">Subordinates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {formatAmount(earnings.affiliateEarnings.available_fees)}
                </div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {formatAmount(earnings.affiliateEarnings.withdrawn_fees)}
                </div>
                <div className="text-sm text-gray-600">Withdrawn</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatAmount(earnings.affiliateEarnings.total_fees_earned)}
                </div>
                <div className="text-sm text-gray-600">Total Earned</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Tabs */}
      <Tabs defaultValue="escrows" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="escrows">Escrow Accounts</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawal History</TabsTrigger>
          <TabsTrigger value="protection">Protection Status</TabsTrigger>
        </TabsList>

        {/* Escrow Accounts Tab */}
        <TabsContent value="escrows" className="space-y-4">
          {earnings.escrowAccounts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No escrow accounts found</p>
              </CardContent>
            </Card>
          ) : (
            earnings.escrowAccounts.map((escrow) => (
              <EscrowTracker
                key={escrow.id}
                escrow={escrow}
                userRole="tradie"
                userId={tradieId}
              />
            ))
          )}
        </TabsContent>

        {/* Withdrawals Tab */}
        <TabsContent value="withdrawals" className="space-y-4">
          {earnings.withdrawals.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No withdrawal history</p>
                <Button>Request Withdrawal</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {earnings.withdrawals.map((withdrawal) => {
                const statusBadge = getWithdrawalStatusBadge(withdrawal.status)
                const StatusIcon = statusBadge.icon
                
                return (
                  <Card key={withdrawal.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge variant={statusBadge.variant}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusBadge.label}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {withdrawal.reference_number}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Requested:</span>
                              <div className="font-medium">
                                {formatAmount(withdrawal.requested_amount)}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Processing Fee:</span>
                              <div className="font-medium">
                                -{formatAmount(withdrawal.processing_fee)}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Final Amount:</span>
                              <div className="font-medium text-green-600">
                                {formatAmount(withdrawal.final_amount)}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Date:</span>
                              <div className="font-medium">
                                {new Date(withdrawal.requested_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Protection Status Tab */}
        <TabsContent value="protection" className="space-y-4">
          {earnings.protectionPeriodStatus.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No active protection periods</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {earnings.protectionPeriodStatus.map((status, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{status.projectTitle}</h4>
                        <p className="text-sm text-gray-600">
                          Amount: {formatAmount(status.amount)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {status.daysRemaining} days
                        </div>
                        <div className="text-sm text-gray-500">remaining</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      Auto-release: {new Date(status.autoReleaseDate).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}