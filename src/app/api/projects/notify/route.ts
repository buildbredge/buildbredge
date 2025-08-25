import { NextRequest, NextResponse } from 'next/server'
import { smtpEmailService, getMatchingTradieEmails } from '@/lib/smtp-email'
import { projectsApi, categoriesApi, professionsApi } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json()
    
    if (!projectId) {
      return NextResponse.json(
        { error: '缺少项目ID' },
        { status: 400 }
      )
    }

    // 获取项目详情
    const project = await projectsApi.getByIdWithCategory(projectId)
    if (!project) {
      return NextResponse.json(
        { error: '项目不存在' },
        { status: 404 }
      )
    }

    // 发送确认邮件给项目发布者
    await smtpEmailService.sendAnonymousProjectConfirmation({
      to: project.email,
      projectId: project.id,
      projectTitle: project.description,
      projectLocation: project.location,
      isAnonymous: !project.user_id
    })

    // 获取匹配的技师邮箱（基于分类、职业和位置）
    const location = project.latitude && project.longitude 
      ? { latitude: project.latitude, longitude: project.longitude, radius: 50 }
      : undefined

    const tradieEmails = await getMatchingTradieEmails(
      project.category_id || undefined,
      project.profession_id || undefined,
      location
    )

    // 批量发送技师通知邮件
    if (tradieEmails.length > 0) {
      // const notificationResults = await smtpEmailService.sendBatchTradieNotifications(
      //   {
      //     to: '', // 会在批量发送中覆盖
      //     projectId: project.id,
      //     projectTitle: project.description,
      //     projectLocation: project.location,
      //     contactEmail: project.email,
      //     userType: project.user_id ? 'registered' : 'anonymous'
      //   },
      //   tradieEmails
      // )

      return NextResponse.json({
        success: true,
        message: '邮件通知发送成功',
        data: {
          confirmationSent: true,
          // tradieNotificationsSent: notificationResults.results.length,
          // tradieNotificationErrors: notificationResults.errors.length,
          // details: notificationResults
          tradieNotificationsSent: 0,
          tradieNotificationErrors: 0
        }
      })
    } else {
      return NextResponse.json({
        success: true,
        message: '确认邮件发送成功，未找到匹配的技师',
        data: {
          confirmationSent: true,
          tradieNotificationsSent: 0,
          tradieNotificationErrors: 0
        }
      })
    }

  } catch (error) {
    console.error('❌ 发送邮件通知时出错:', error)
    return NextResponse.json(
      { 
        error: '发送邮件通知失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}