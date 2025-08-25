"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  DollarSign,
  Calendar,
  User,
  Building2,
  ChevronRight,
  Loader2
} from "lucide-react"
import { Database } from "@/lib/supabase"

type EscrowAccount = Database['public']['Tables']['escrow_accounts']['Row'] & {
  payment?: {
    id: string
    amount: number
    projects?: {
      id: string
      title: string
      description: string
    }
  }
  tradie?: {
    id: string
    name: string
    email: string
    company?: string
  }
}

interface EscrowTrackerProps {
  escrow: EscrowAccount
  userRole: 'owner' | 'tradie'
  userId: string
  onReleaseRequest?: () => void
  className?: string
}

export function EscrowTracker({
  escrow,
  userRole,
  userId,
  onReleaseRequest,
  className = ""
}: EscrowTrackerProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number
    hours: number
    minutes: number
  }>({ days: 0, hours: 0, minutes: 0 })
  
  const [isReleasing, setIsReleasing] = useState(false)

  // Calculate time remaining in protection period
  useEffect(() => {
    if (escrow.status !== 'held') return

    const calculateTimeRemaining = () => {
      const now = new Date()
      const endDate = new Date(escrow.protection_end_date)
      const diff = endDate.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0 })
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      setTimeRemaining({ days, hours, minutes })
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [escrow.status, escrow.protection_end_date])

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD'
    }).format(amount)
  }

  const getStatusInfo = () => {
    switch (escrow.status) {
      case 'held':
        return {
          label: 'Funds Escrowed',
          color: 'bg-blue-500',
          textColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          icon: Shield,
          description: 'Funds are securely held in escrow'
        }
      case 'released':
        return {
          label: 'Funds Released',
          color: 'bg-green-500',
          textColor: 'text-green-600',
          bgColor: 'bg-green-50',
          icon: CheckCircle,
          description: 'Funds have been released to tradie'
        }
      case 'disputed':
        return {
          label: 'Under Dispute',
          color: 'bg-red-500',
          textColor: 'text-red-600',
          bgColor: 'bg-red-50',
          icon: AlertCircle,
          description: 'Payment is under dispute resolution'
        }
      case 'withdrawn':
        return {
          label: 'Withdrawn',
          color: 'bg-gray-500',
          textColor: 'text-gray-600',
          bgColor: 'bg-gray-50',
          icon: DollarSign,
          description: 'Funds have been withdrawn by tradie'
        }
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-500',
          textColor: 'text-gray-600',
          bgColor: 'bg-gray-50',
          icon: AlertCircle,
          description: 'Status unknown'
        }
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  // Calculate progress for protection period
  const protectionProgress = (() => {
    if (escrow.status !== 'held') return 100
    
    const start = new Date(escrow.protection_start_date)
    const end = new Date(escrow.protection_end_date)
    const now = new Date()
    
    const total = end.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()
    
    return Math.max(0, Math.min(100, (elapsed / total) * 100))
  })()

  const handleReleaseRequest = async () => {
    if (!onReleaseRequest) return
    
    setIsReleasing(true)
    try {
      await onReleaseRequest()
    } finally {
      setIsReleasing(false)
    }
  }

  const isOwner = userRole === 'owner'
  const canRelease = isOwner && escrow.status === 'held'

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <StatusIcon className={`w-5 h-5 mr-2 ${statusInfo.textColor}`} />
            Escrow Status
          </div>
          <Badge 
            variant="outline" 
            className={`${statusInfo.bgColor} ${statusInfo.textColor} border-current`}
          >
            {statusInfo.label}
          </Badge>
        </CardTitle>
        
        {escrow.payment?.projects && (
          <div className="text-sm text-gray-600">
            <p className="font-medium">{escrow.payment.projects.title}</p>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Amount Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-3 rounded-lg ${statusInfo.bgColor}`}>
            <div className="text-sm text-gray-600">Gross Amount</div>
            <div className="font-semibold text-lg">{formatAmount(escrow.gross_amount)}</div>
          </div>
          <div className={`p-3 rounded-lg ${statusInfo.bgColor}`}>
            <div className="text-sm text-gray-600">Net to Tradie</div>
            <div className="font-semibold text-lg text-green-600">
              {formatAmount(escrow.net_amount)}
            </div>
          </div>
        </div>

        {/* Fee Breakdown (collapsed by default) */}
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Platform Fee:</span>
            <span>-{formatAmount(escrow.platform_fee)}</span>
          </div>
          {escrow.affiliate_fee > 0 && (
            <div className="flex justify-between">
              <span>Affiliate Fee:</span>
              <span>-{formatAmount(escrow.affiliate_fee)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Tax Withheld:</span>
            <span>-{formatAmount(escrow.tax_withheld)}</span>
          </div>
        </div>

        {/* Tradie Information */}
        {escrow.tradie && (
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <User className="w-4 h-4 text-gray-600" />
            <div className="flex-1">
              <div className="font-medium">{escrow.tradie.name}</div>
              {escrow.tradie.company && (
                <div className="text-sm text-gray-600 flex items-center">
                  <Building2 className="w-3 h-3 mr-1" />
                  {escrow.tradie.company}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Protection Period Status */}
        {escrow.status === 'held' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-blue-600" />
                Protection Period
              </span>
              <span className="font-medium">
                {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m remaining
              </span>
            </div>
            
            <Progress 
              value={protectionProgress} 
              className="h-2"
            />
            
            <div className="text-xs text-gray-500 flex items-center justify-between">
              <span>Started: {new Date(escrow.protection_start_date).toLocaleDateString()}</span>
              <span>Auto-release: {new Date(escrow.protection_end_date).toLocaleDateString()}</span>
            </div>

            {timeRemaining.days === 0 && timeRemaining.hours <= 24 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">
                    Protection period ending soon
                  </span>
                </div>
                <p className="text-xs text-orange-700 mt-1">
                  Funds will be automatically released in less than 24 hours unless disputed.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Release Information */}
        {escrow.status === 'released' && (
          <div className="space-y-2 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span>Released:</span>
              <span className="font-medium">
                {escrow.released_at ? new Date(escrow.released_at).toLocaleString() : 'Unknown'}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span>Method:</span>
              <Badge variant="outline" className="text-xs">
                {escrow.release_trigger === 'automatic' ? 'Auto Release' : 
                 escrow.release_trigger === 'manual' ? 'Owner Release' : 'Dispute Resolution'}
              </Badge>
            </div>
            
            {escrow.release_notes && (
              <div className="text-sm">
                <span className="text-gray-600">Notes:</span>
                <p className="text-gray-800 mt-1">{escrow.release_notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {canRelease && (
          <div className="pt-4 border-t">
            <Button 
              onClick={handleReleaseRequest}
              disabled={isReleasing}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isReleasing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Releasing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Complete & Release Funds
                </>
              )}
            </Button>
            
            <p className="text-xs text-gray-500 mt-2 text-center">
              By clicking release, you confirm the work is completed satisfactorily.
              This action cannot be undone.
            </p>
          </div>
        )}

        {/* Status Description */}
        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600 flex items-center">
            <ChevronRight className="w-3 h-3 mr-1" />
            {statusInfo.description}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}