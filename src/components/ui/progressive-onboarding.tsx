"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, ChevronRight, CheckCircle, Lightbulb } from "lucide-react"

interface OnboardingStep {
  id: string
  title: string
  description: string
  completed: boolean
  action?: {
    text: string
    href?: string
    onClick?: () => void
  }
}

interface ProgressiveOnboardingProps {
  userRoles: Array<{ role_type: 'owner' | 'tradie' }>
  projectCount: number
  profileComplete: boolean
  emailVerified: boolean
  className?: string
}

export function ProgressiveOnboarding({ 
  userRoles, 
  projectCount, 
  profileComplete, 
  emailVerified,
  className = "" 
}: ProgressiveOnboardingProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const hasOwnerRole = userRoles.some(r => r.role_type === 'owner')
  const hasTradieRole = userRoles.some(r => r.role_type === 'tradie')

  // 基础入门步骤
  const getOnboardingSteps = (): OnboardingStep[] => {
    const steps: OnboardingStep[] = []

    // 邮箱验证
    steps.push({
      id: 'email-verify',
      title: '验证邮箱地址',
      description: '完成邮箱验证以确保账户安全',
      completed: emailVerified,
      action: emailVerified ? undefined : {
        text: '重新发送验证邮件',
        onClick: () => {
          // TODO: 实现重新发送验证邮件
          console.log('Resend verification email')
        }
      }
    })

    // 完善个人资料
    steps.push({
      id: 'complete-profile',
      title: '完善个人资料',
      description: '填写完整的个人信息以获得更好的体验',
      completed: profileComplete,
      action: profileComplete ? undefined : {
        text: '编辑资料',
        href: '/profile'
      }
    })

    // 业主特定步骤
    if (hasOwnerRole) {
      steps.push({
        id: 'post-first-project',
        title: '发布第一个项目',
        description: '发布项目需求，开始寻找合适的技师',
        completed: projectCount > 0,
        action: projectCount > 0 ? undefined : {
          text: '发布项目',
          href: '/post-job'
        }
      })

      if (projectCount > 0) {
        steps.push({
          id: 'browse-tradies',
          title: '浏览技师资料',
          description: '查看技师的技能和评价，选择最合适的服务商',
          completed: false, // 这里可以根据实际浏览行为判断
          action: {
            text: '浏览技师',
            href: '/browse-tradies'
          }
        })
      }
    }

    // 技师特定步骤
    if (hasTradieRole) {
      steps.push({
        id: 'explore-projects',
        title: '浏览可接项目',
        description: '查看适合您技能的项目机会',
        completed: false, // 这里可以根据实际行为判断
        action: {
          text: '查看项目',
          href: '/browse-tradies' // 技师项目浏览页面
        }
      })

      steps.push({
        id: 'setup-services',
        title: '设置服务内容',
        description: '详细描述您的专业技能和服务范围',
        completed: false, // 根据服务设置情况判断
        action: {
          text: '设置服务',
          href: '/profile'
        }
      })
    }

    return steps
  }

  const steps = getOnboardingSteps()
  const completedSteps = steps.filter(step => step.completed).length
  const totalSteps = steps.length
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

  // 判断是否应该显示引导
  useEffect(() => {
    const shouldShow = progressPercentage < 100 && !localStorage.getItem('onboarding-dismissed')
    setIsVisible(shouldShow)
  }, [progressPercentage])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('onboarding-dismissed', 'true')
  }

  const handleStepAction = (step: OnboardingStep) => {
    if (step.action?.onClick) {
      step.action.onClick()
    } else if (step.action?.href) {
      window.location.href = step.action.href
    }
  }

  if (!isVisible || totalSteps === 0) {
    return null
  }

  return (
    <Card className={`border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg text-blue-800">完成账户设置</CardTitle>
            <Badge className="bg-blue-100 text-blue-700">
              {completedSteps}/{totalSteps}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.slice(0, 3).map((step, index) => (
            <div key={step.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/50 transition-colors">
              <div className="flex-shrink-0">
                {step.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`font-medium ${step.completed ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                    {step.title}
                  </h4>
                  {step.action && !step.completed && (
                    <Button 
                      size="sm" 
                      className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleStepAction(step)}
                    >
                      {step.action.text}
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
              </div>
            </div>
          ))}
          
          {steps.length > 3 && (
            <div className="text-center pt-2">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                查看更多步骤 ({steps.length - 3})
              </Button>
            </div>
          )}
        </div>
        
        {progressPercentage === 100 && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">恭喜！您已完成所有基础设置</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// 简化版本的进度提示组件
export function QuickProgressIndicator({ 
  completedSteps, 
  totalSteps,
  className = "" 
}: { 
  completedSteps: number; 
  totalSteps: number;
  className?: string;
}) {
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0
  
  if (progressPercentage === 100) {
    return null
  }

  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      <div className="w-20 bg-gray-200 rounded-full h-1">
        <div 
          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <span className="text-gray-600 text-xs">
        设置进度 {completedSteps}/{totalSteps}
      </span>
    </div>
  )
}