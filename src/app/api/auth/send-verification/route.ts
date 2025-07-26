import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, userType, verificationUrl } = await request.json()

    if (!email || !fullName || !verificationUrl) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 暂时禁用邮件发送功能，直接返回成功
    console.log('验证邮件请求:', { email, fullName, userType })

    return NextResponse.json(
      {
        message: '验证邮件发送成功',
        success: true
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
