import nodemailer from 'nodemailer'

// SMTP 配置接口
interface SMTPConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

// 邮件接口
export interface EmailData {
  to: string
  subject: string
  html: string
  text: string
}

export interface ProjectConfirmationEmail {
  to: string
  projectId: string
  projectTitle: string
  projectLocation: string
  isAnonymous: boolean
}

export interface ProjectNotificationEmail {
  to: string
  projectId: string
  projectTitle: string
  projectLocation: string
  contactEmail: string
  userType: 'anonymous' | 'registered'
}

export interface VerificationCodeEmail {
  to: string
  code: string
  purpose: 'register' | 'login' | 'reset_password' | 'phone_verify'
  userName?: string
  expiresInMinutes?: number
}

export interface QuoteSubmissionEmail {
  to: string
  projectId: string
  projectTitle: string
  projectLocation: string
  tradieId: string
  tradieName: string
  tradieCompany?: string
  tradiePhone?: string
  quotePrice: number
  quoteDescription: string
  tradieRating?: number
  tradieReviewCount?: number
}

export interface QuoteAcceptanceEmail {
  to: string
  projectId: string
  projectTitle: string
  projectLocation: string
  ownerName?: string
  ownerEmail: string
  ownerPhone?: string
  quotePrice: number
}

export interface ProjectCompletionEmail {
  to: string
  projectId: string
  projectTitle: string
  tradieId: string
  tradieName: string
  tradieCompany?: string
}

export interface AnonymousProjectClaimEmail {
  to: string
  projectCount: number
  projectTitles: string[]
}

export interface QuoteUpdateEmail {
  to: string
  projectId: string
  projectTitle: string
  projectLocation: string
  tradieId: string
  tradieName: string
  tradieCompany?: string
  tradieEmail: string
  oldPrice: number
  newPrice: number
  quoteDescription: string
}

export interface QuoteDeletionEmail {
  to: string
  projectId: string
  projectTitle: string
  projectLocation: string
  tradieId: string
  tradieName: string
  tradieCompany?: string
  tradieEmail: string
  quotePrice: number
  quoteDescription: string
}

// 邮件模板
export const emailTemplates = {
  // 匿名用户项目确认邮件
  anonymousProjectConfirmation: (data: ProjectConfirmationEmail) => ({
    subject: `项目发布成功确认 - ${data.projectTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">项目发布成功！</h2>
        
        <p>您好，</p>
        
        <p>您的项目已成功发布到 BuildBridge 平台：</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">项目详情</h3>
          <p><strong>项目标题：</strong>${data.projectTitle}</p>
          <p><strong>项目位置：</strong>${data.projectLocation}</p>
          <p><strong>项目链接：</strong><a href="${process.env.NEXT_PUBLIC_APP_URL}/projects/${data.projectId}" style="color: #059669; text-decoration: none; font-weight: bold;">查看项目详情</a></p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/projects/${data.projectId}" 
             style="background-color: #059669; color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; border: 2px solid #059669; box-shadow: 0 4px 8px rgba(5, 150, 105, 0.3);">
            查看完整项目信息
          </a>
        </div>
        
        <h3 style="color: #374151;">接下来会发生什么？</h3>
        <ul style="color: #6b7280;">
          <li>符合条件的专业人士将会看到您的项目</li>
          <li>有兴趣的技师会通过邮件联系您</li>
          <li>您可以直接回复邮件与技师沟通</li>
          <li>选择合适的技师完成您的项目</li>
        </ul>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;">
            <strong>重要提醒：</strong>请保存此邮件作为项目凭证。如需修改或取消项目，请回复此邮件。
          </p>
        </div>
        
        <p>感谢您使用 BuildBridge！</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          BuildBridge - 连接业主与专业技师的平台<br>
          如有疑问，请回复此邮件或访问我们的网站。
        </p>
      </div>
    `,
    text: `
项目发布成功！

您好，

您的项目已成功发布到 BuildBridge 平台：

项目详情：
- 项目标题：${data.projectTitle}
- 项目位置：${data.projectLocation}
- 查看项目：${process.env.NEXT_PUBLIC_APP_URL}/projects/${data.projectId}

接下来会发生什么？
- 符合条件的专业人士将会看到您的项目
- 有兴趣的技师会通过邮件联系您
- 您可以直接回复邮件与技师沟通
- 选择合适的技师完成您的项目

重要提醒：请保存此邮件作为项目凭证。如需修改或取消项目，请回复此邮件。

感谢您使用 BuildBridge！

BuildBridge - 连接业主与专业技师的平台
如有疑问，请回复此邮件或访问我们的网站。
    `
  }),

  // 给技师的新项目通知邮件
  tradieProjectNotification: (data: ProjectNotificationEmail) => ({
    subject: `新项目机会 - ${data.projectTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">新项目机会</h2>
        
        <p>您好，</p>
        
        <p>有一个新的项目可能适合您：</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">项目详情</h3>
          <p><strong>项目标题：</strong>${data.projectTitle}</p>
          <p><strong>项目位置：</strong>${data.projectLocation}</p>
          <p><strong>联系邮箱：</strong>${data.contactEmail}</p>
          <p><strong>发布者类型：</strong>${data.userType === 'anonymous' ? '匿名用户' : '注册用户'}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/projects/${data.projectId}" 
             style="background-color: #059669; color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; border: 2px solid #059669; box-shadow: 0 4px 8px rgba(5, 150, 105, 0.3);">
            查看项目详情
          </a>
        </div>
        
        <h3 style="color: #374151;">如何联系客户？</h3>
        <p style="color: #6b7280;">
          如果您对此项目感兴趣，请直接回复客户邮箱：<strong>${data.contactEmail}</strong>
        </p>
        
        <p>祝您工作顺利！</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          BuildBridge - 连接业主与专业技师的平台<br>
          这是一封自动通知邮件，请勿直接回复。
        </p>
      </div>
    `,
    text: `
新项目机会

您好，

有一个新的项目可能适合您：

项目详情：
- 项目标题：${data.projectTitle}
- 项目位置：${data.projectLocation}
- 联系邮箱：${data.contactEmail}
- 发布者类型：${data.userType === 'anonymous' ? '匿名用户' : '注册用户'}

查看项目详情：${process.env.NEXT_PUBLIC_APP_URL}/projects/${data.projectId}

如何联系客户？
如果您对此项目感兴趣，请直接回复客户邮箱：${data.contactEmail}

祝您工作顺利！

BuildBridge - 连接业主与专业技师的平台
这是一封自动通知邮件，请勿直接回复。
    `
  }),

  // 技师报价提交通知邮件（发送给项目拥有者）
  quoteSubmissionNotification: (data: QuoteSubmissionEmail) => ({
    subject: `新报价通知 - ${data.projectTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">您收到新的项目报价！</h2>
        
        <p>您好，</p>
        
        <p>有技师对您的项目提交了报价：</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">项目信息</h3>
          <p><strong>项目标题：</strong>${data.projectTitle}</p>
          <p><strong>项目位置：</strong>${data.projectLocation}</p>
        </div>

        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
          <h3 style="margin-top: 0; color: #065f46;">技师报价详情</h3>
          <p><strong>技师姓名：</strong>${data.tradieName}</p>
          ${data.tradieCompany ? `<p><strong>公司：</strong>${data.tradieCompany}</p>` : ''}
          ${data.tradiePhone ? `<p><strong>联系电话：</strong>${data.tradiePhone}</p>` : ''}
          ${data.tradieRating ? `<p><strong>评分：</strong>${data.tradieRating}/5 (${data.tradieReviewCount || 0} 评价)</p>` : ''}
          <p><strong>报价金额：</strong><span style="font-size: 1.2em; color: #059669; font-weight: bold;">NZD $${data.quotePrice}</span></p>
          <div style="margin-top: 15px;">
            <p><strong>报价说明：</strong></p>
            <div style="background-color: white; padding: 15px; border-radius: 6px; border: 1px solid #d1d5db;">
              ${data.quoteDescription.replace(/\n/g, '<br>')}
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin: 40px 0; background-color: #f0f9f4; padding: 25px; border-radius: 12px;">
          <h3 style="margin: 0 0 15px 0; color: #059669; font-size: 18px;">📋 查看报价详情</h3>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/projects/${data.projectId}" 
             style="background: linear-gradient(135deg, #059669 0%, #047857 100%); 
                    color: white !important; 
                    padding: 18px 40px; 
                    text-decoration: none; 
                    border-radius: 12px; 
                    display: inline-block; 
                    font-weight: bold; 
                    font-size: 18px; 
                    border: none;
                    box-shadow: 0 8px 20px rgba(5, 150, 105, 0.4);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    transition: all 0.3s ease;
                    min-width: 200px;">
            🔍 查看完整报价详情
          </a>
          <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 14px;">
            点击上方按钮查看所有报价信息并选择最合适的技师
          </p>
        </div>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;">
            <strong>下一步：</strong>您可以在项目页面查看所有报价，选择最合适的技师。点击"接受报价"即可开始项目。
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          BuildBridge - 连接业主与专业技师的平台<br>
          这是一封自动通知邮件，如有疑问请访问我们的网站。
        </p>
      </div>
    `,
    text: `
您收到新的项目报价！

项目信息：
- 项目标题：${data.projectTitle}
- 项目位置：${data.projectLocation}

技师报价详情：
- 技师姓名：${data.tradieName}
${data.tradieCompany ? `- 公司：${data.tradieCompany}` : ''}
${data.tradiePhone ? `- 联系电话：${data.tradiePhone}` : ''}
${data.tradieRating ? `- 评分：${data.tradieRating}/5 (${data.tradieReviewCount || 0} 评价)` : ''}
- 报价金额：NZD $${data.quotePrice}
- 报价说明：${data.quoteDescription}

查看完整报价：${process.env.NEXT_PUBLIC_APP_URL}/projects/${data.projectId}

下一步：您可以在项目页面查看所有报价，选择最合适的技师。

BuildBridge - 连接业主与专业技师的平台
    `
  }),

  // 报价被接受通知邮件（发送给技师）
  quoteAcceptanceNotification: (data: QuoteAcceptanceEmail) => ({
    subject: `恭喜！您的报价已被接受 - ${data.projectTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">🎉 恭喜！您的报价已被接受</h2>
        
        <p>您好，</p>
        
        <p>我们很高兴通知您，您的项目报价已被客户接受！</p>
        
        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
          <h3 style="margin-top: 0; color: #065f46;">项目详情</h3>
          <p><strong>项目标题：</strong>${data.projectTitle}</p>
          <p><strong>项目位置：</strong>${data.projectLocation}</p>
          <p><strong>确认报价：</strong><span style="font-size: 1.2em; color: #059669; font-weight: bold;">NZD $${data.quotePrice}</span></p>
        </div>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">客户联系信息</h3>
          ${data.ownerName ? `<p><strong>客户姓名：</strong>${data.ownerName}</p>` : ''}
          <p><strong>联系邮箱：</strong><a href="mailto:${data.ownerEmail}" style="color: #059669;">${data.ownerEmail}</a></p>
          ${data.ownerPhone ? `<p><strong>联系电话：</strong><a href="tel:${data.ownerPhone}" style="color: #059669;">${data.ownerPhone}</a></p>` : ''}
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/projects/${data.projectId}" 
             style="background-color: #059669; color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; border: 2px solid #059669; box-shadow: 0 4px 8px rgba(5, 150, 105, 0.3);">
            查看项目详情
          </a>
        </div>
        
        <h3 style="color: #374151;">接下来需要做什么？</h3>
        <ol style="color: #6b7280; line-height: 1.6;">
          <li>请尽快联系客户确认项目细节和开始时间</li>
          <li>按照约定的时间和质量标准完成项目</li>
          <li>项目完成后在平台上标记"已完成"</li>
          <li>等待客户评价以提升您的信誉度</li>
        </ol>
        
        <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #1e40af;">
            <strong>温馨提示：</strong>保持良好的沟通和专业的服务品质，有助于获得更多客户和好评！
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          BuildBridge - 连接业主与专业技师的平台<br>
          祝您工作顺利！
        </p>
      </div>
    `,
    text: `
🎉 恭喜！您的报价已被接受

项目详情：
- 项目标题：${data.projectTitle}
- 项目位置：${data.projectLocation}
- 确认报价：NZD $${data.quotePrice}

客户联系信息：
${data.ownerName ? `- 客户姓名：${data.ownerName}` : ''}
- 联系邮箱：${data.ownerEmail}
${data.ownerPhone ? `- 联系电话：${data.ownerPhone}` : ''}

查看项目详情：${process.env.NEXT_PUBLIC_APP_URL}/projects/${data.projectId}

接下来需要做什么？
1. 请尽快联系客户确认项目细节和开始时间
2. 按照约定的时间和质量标准完成项目
3. 项目完成后在平台上标记"已完成"
4. 等待客户评价以提升您的信誉度

BuildBridge - 连接业主与专业技师的平台
祝您工作顺利！
    `
  }),

  // 项目完成通知邮件（发送给项目拥有者）
  projectCompletionNotification: (data: ProjectCompletionEmail) => ({
    subject: `项目已完成 - ${data.projectTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">✅ 项目已完成</h2>
        
        <p>您好，</p>
        
        <p>技师已将您的项目标记为完成状态：</p>
        
        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
          <h3 style="margin-top: 0; color: #065f46;">项目信息</h3>
          <p><strong>项目标题：</strong>${data.projectTitle}</p>
          <p><strong>完成技师：</strong>${data.tradieName}</p>
          ${data.tradieCompany ? `<p><strong>技师公司：</strong>${data.tradieCompany}</p>` : ''}
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/projects/${data.projectId}" 
             style="background-color: #059669; color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; border: 2px solid #059669; box-shadow: 0 4px 8px rgba(5, 150, 105, 0.3);">
            查看项目详情
          </a>
        </div>
        
        <h3 style="color: #374151;">请完成评价</h3>
        <p style="color: #6b7280;">
          为了帮助其他用户选择合适的技师，也为了提升平台服务质量，请您对本次服务进行评价。
        </p>
        
        <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;">
            <strong>评价内容包括：</strong><br>
            • 工作质量和专业水平<br>
            • 沟通效果和服务态度<br>
            • 按时完成情况<br>
            • 整体满意度评分
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/projects/${data.projectId}?tab=review" 
             style="background-color: #f59e0b; color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; border: 2px solid #f59e0b; box-shadow: 0 4px 8px rgba(245, 158, 11, 0.3);">
            立即评价
          </a>
        </div>
        
        <p>感谢您使用 BuildBridge 平台！</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          BuildBridge - 连接业主与专业技师的平台<br>
          如有疑问，请访问我们的网站。
        </p>
      </div>
    `,
    text: `
✅ 项目已完成

项目信息：
- 项目标题：${data.projectTitle}
- 完成技师：${data.tradieName}
${data.tradieCompany ? `- 技师公司：${data.tradieCompany}` : ''}

请完成评价：
为了帮助其他用户选择合适的技师，也为了提升平台服务质量，请您对本次服务进行评价。

评价内容包括：
• 工作质量和专业水平
• 沟通效果和服务态度
• 按时完成情况
• 整体满意度评分

查看项目并评价：${process.env.NEXT_PUBLIC_APP_URL}/projects/${data.projectId}?tab=review

感谢您使用 BuildBridge 平台！

BuildBridge - 连接业主与专业技师的平台
    `
  }),

  // 匿名项目认领成功邮件
  anonymousProjectClaimNotification: (data: AnonymousProjectClaimEmail) => ({
    subject: `项目认领成功 - 已找到 ${data.projectCount} 个匹配项目`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">🎉 项目认领成功！</h2>
        
        <p>您好，</p>
        
        <p>根据您的邮箱地址，我们为您找到了 <strong>${data.projectCount}</strong> 个之前发布的项目，现已自动归属到您的账户中。</p>
        
        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
          <h3 style="margin-top: 0; color: #065f46;">认领的项目：</h3>
          <ul style="margin: 10px 0; padding-left: 20px;">
            ${data.projectTitles.map(title => `<li style="margin: 5px 0; color: #374151;">${title}</li>`).join('')}
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/my-projects" 
             style="background-color: #059669; color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; border: 2px solid #059669; box-shadow: 0 4px 8px rgba(5, 150, 105, 0.3);">
            查看我的项目
          </a>
        </div>
        
        <h3 style="color: #374151;">接下来您可以：</h3>
        <ul style="color: #6b7280; line-height: 1.6;">
          <li>管理和查看所有项目状态</li>
          <li>查看技师报价和选择合适的技师</li>
          <li>与技师直接沟通项目细节</li>
          <li>跟踪项目进度</li>
          <li>对完成的项目进行评价</li>
        </ul>
        
        <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #1e40af;">
            <strong>温馨提示：</strong>注册用户享有更完善的项目管理功能，包括实时通知、项目历史记录等。
          </p>
        </div>
        
        <p>感谢您选择 BuildBridge！</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          BuildBridge - 连接业主与专业技师的平台<br>
          如有疑问，请访问我们的网站。
        </p>
      </div>
    `,
    text: `
🎉 项目认领成功！

根据您的邮箱地址，我们为您找到了 ${data.projectCount} 个之前发布的项目，现已自动归属到您的账户中。

认领的项目：
${data.projectTitles.map(title => `- ${title}`).join('\n')}

查看我的项目：${process.env.NEXT_PUBLIC_APP_URL}/my-projects

接下来您可以：
- 管理和查看所有项目状态
- 查看技师报价和选择合适的技师
- 与技师直接沟通项目细节
- 跟踪项目进度
- 对完成的项目进行评价

BuildBridge - 连接业主与专业技师的平台
    `
  }),

  // 报价更新通知邮件（发送给项目拥有者）
  quoteUpdateNotification: (data: QuoteUpdateEmail) => ({
    subject: `报价已更新 - ${data.projectTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">📝 报价已更新</h2>
        
        <p>您好，</p>
        
        <p>技师 <strong>${data.tradieName}</strong> 已更新了对您项目的报价：</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">项目信息</h3>
          <p><strong>项目：</strong>${data.projectTitle}</p>
          <p><strong>位置：</strong>${data.projectLocation}</p>
        </div>

        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h3 style="margin-top: 0; color: #92400e;">报价变更详情</h3>
          <div style="margin: 15px 0;">
            <p style="margin: 5px 0;"><strong>技师：</strong>${data.tradieName}${data.tradieCompany ? ` (${data.tradieCompany})` : ''}</p>
            <p style="margin: 5px 0; color: #dc2626;"><strong>原报价：</strong>NZD $${data.oldPrice}</p>
            <p style="margin: 5px 0; color: #059669;"><strong>新报价：</strong>NZD $${data.newPrice}</p>
            <p style="margin: 10px 0 5px 0;"><strong>报价说明：</strong></p>
            <div style="background-color: #fff; padding: 12px; border-radius: 6px; border: 1px solid #d1d5db;">
              ${data.quoteDescription.split('\n').map(line => `<p style="margin: 5px 0;">${line}</p>`).join('')}
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/projects/${data.projectId}" 
             style="background-color: #2563eb; color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; border: 2px solid #2563eb; box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);">
            查看更新的报价
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          BuildBridge - 连接业主与专业技师的平台<br>
          这是一封自动通知邮件，如有疑问请访问我们的网站。
        </p>
      </div>
    `,
    text: `报价已更新 - ${data.projectTitle}

您好，

技师 ${data.tradieName} 已更新了对您项目的报价：

项目信息：
- 项目：${data.projectTitle}
- 位置：${data.projectLocation}

报价变更详情：
- 技师：${data.tradieName}${data.tradieCompany ? ` (${data.tradieCompany})` : ''}
- 原报价：NZD $${data.oldPrice}
- 新报价：NZD $${data.newPrice}
- 报价说明：${data.quoteDescription}

查看更新的报价：${process.env.NEXT_PUBLIC_APP_URL}/projects/${data.projectId}

BuildBridge - 连接业主与专业技师的平台`
  }),

  // 报价删除通知邮件（发送给项目拥有者）
  quoteDeletionNotification: (data: QuoteDeletionEmail) => ({
    subject: `报价已撤回 - ${data.projectTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">🗑️ 报价已撤回</h2>
        
        <p>您好，</p>
        
        <p>技师 <strong>${data.tradieName}</strong> 已撤回了对您项目的报价：</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">项目信息</h3>
          <p><strong>项目：</strong>${data.projectTitle}</p>
          <p><strong>位置：</strong>${data.projectLocation}</p>
        </div>

        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="margin-top: 0; color: #991b1b;">已撤回的报价详情</h3>
          <div style="margin: 15px 0;">
            <p style="margin: 5px 0;"><strong>技师：</strong>${data.tradieName}${data.tradieCompany ? ` (${data.tradieCompany})` : ''}</p>
            <p style="margin: 5px 0;"><strong>原报价：</strong>NZD $${data.quotePrice}</p>
            <p style="margin: 10px 0 5px 0;"><strong>原报价说明：</strong></p>
            <div style="background-color: #fff; padding: 12px; border-radius: 6px; border: 1px solid #d1d5db;">
              ${data.quoteDescription.split('\n').map(line => `<p style="margin: 5px 0;">${line}</p>`).join('')}
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/projects/${data.projectId}" 
             style="background-color: #059669; color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; border: 2px solid #059669; box-shadow: 0 4px 8px rgba(5, 150, 105, 0.3);">
            查看项目详情
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          BuildBridge - 连接业主与专业技师的平台<br>
          这是一封自动通知邮件，如有疑问请访问我们的网站。
        </p>
      </div>
    `,
    text: `报价已撤回 - ${data.projectTitle}

您好，

技师 ${data.tradieName} 已撤回了对您项目的报价：

项目信息：
- 项目：${data.projectTitle}
- 位置：${data.projectLocation}

已撤回的报价详情：
- 技师：${data.tradieName}${data.tradieCompany ? ` (${data.tradieCompany})` : ''}
- 原报价：NZD $${data.quotePrice}
- 原报价说明：${data.quoteDescription}

查看项目详情：${process.env.NEXT_PUBLIC_APP_URL}/projects/${data.projectId}

BuildBridge - 连接业主与专业技师的平台`
  })
}

// SMTP 邮件服务类
class SMTPEmailService {
  private transporter: nodemailer.Transporter | null = null

  // 初始化 SMTP 传输器
  private async getTransporter() {
    if (this.transporter) {
      return this.transporter
    }

    // 从环境变量获取 SMTP 配置
    const smtpConfig: SMTPConfig = {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    }

    console.log('📧 SMTP 配置:', {
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      user: smtpConfig.auth.user
    })

    // 验证配置
    if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
      throw new Error('SMTP 配置不完整。请检查环境变量：SMTP_HOST, SMTP_USER, SMTP_PASS')
    }

    this.transporter = nodemailer.createTransport(smtpConfig)

    // 验证连接
    try {
      await this.transporter.verify()
      console.log('✅ SMTP 服务器连接成功')
    } catch (error) {
      console.error('❌ SMTP 服务器连接失败:', error)
      throw error
    }

    return this.transporter
  }

  // 发送邮件的通用方法
  async sendEmail(emailData: EmailData) {
    try {
      const transporter = await this.getTransporter()
      
      const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER
      
      const mailOptions = {
        from: `BuildBridge <${fromEmail}>`,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      }

      console.log('📤 发送邮件:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      })

      const result = await transporter.sendMail(mailOptions)
      console.log('✅ 邮件发送成功:', result.messageId)
      
      return {
        id: result.messageId,
        success: true
      }
    } catch (error) {
      console.error('❌ 邮件发送失败:', error)
      throw error
    }
  }

  // 发送匿名项目确认邮件
  async sendAnonymousProjectConfirmation(data: ProjectConfirmationEmail) {
    const template = emailTemplates.anonymousProjectConfirmation(data)
    return this.sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  // 发送技师项目通知邮件
  async sendTradieProjectNotification(data: ProjectNotificationEmail) {
    const template = emailTemplates.tradieProjectNotification(data)
    return this.sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  // 批量发送技师通知邮件
  async sendBatchTradieNotifications(
    projectData: ProjectNotificationEmail,
    tradieEmails: string[]
  ) {
    const results = []
    const errors = []

    for (const email of tradieEmails) {
      try {
        const result = await this.sendTradieProjectNotification({
          ...projectData,
          to: email
        })
        results.push({ email, result })
        
        // 避免邮件服务器限制，短暂延迟
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`❌ 发送给 ${email} 的邮件失败:`, error)
        errors.push({ email, error })
      }
    }

    return { results, errors }
  }

  // 发送报价提交通知邮件
  async sendQuoteSubmissionNotification(data: QuoteSubmissionEmail) {
    const template = emailTemplates.quoteSubmissionNotification(data)
    return this.sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  // 发送报价接受通知邮件
  async sendQuoteAcceptanceNotification(data: QuoteAcceptanceEmail) {
    const template = emailTemplates.quoteAcceptanceNotification(data)
    return this.sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  // 发送项目完成通知邮件
  async sendProjectCompletionNotification(data: ProjectCompletionEmail) {
    const template = emailTemplates.projectCompletionNotification(data)
    return this.sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  // 发送匿名项目认领通知邮件
  async sendAnonymousProjectClaimNotification(data: AnonymousProjectClaimEmail) {
    const template = emailTemplates.anonymousProjectClaimNotification(data)
    return this.sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  // 发送报价更新通知邮件
  async sendQuoteUpdateNotification(data: QuoteUpdateEmail) {
    const template = emailTemplates.quoteUpdateNotification(data)
    return this.sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  // 发送报价删除通知邮件
  async sendQuoteDeletionNotification(data: QuoteDeletionEmail) {
    const template = emailTemplates.quoteDeletionNotification(data)
    return this.sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }
}

// 导出单例实例
export const smtpEmailService = new SMTPEmailService()

// 获取匹配的技师邮箱列表（重用之前的逻辑）
export async function getMatchingTradieEmails(
  categoryId?: string,
  professionId?: string,
  location?: { latitude: number; longitude: number; radius?: number }
): Promise<string[]> {
  try {
    console.log('🔍 正在查找匹配的技师...', { categoryId, professionId, location })
    
    // 导入API函数
    const { tradiesApi } = await import('@/lib/api')
    
    // 如果有具体的专业ID，使用专业匹配
    if (professionId) {
      // 通过 tradie_professions 表匹配
      const { supabase } = await import('../../lib/supabase')
      
      const { data: tradieIds, error: professionError } = await supabase
        .from('tradie_professions')
        .select('tradie_id')
        .eq('profession_id', professionId)
      
      if (professionError) {
        console.error('❌ 查询技师职业关联失败:', professionError)
        return []
      }
      
      if (!tradieIds || tradieIds.length === 0) {
        console.log('📭 未找到匹配该职业的技师')
        return []
      }
      
      // 获取这些技师的详细信息
      const { data: tradies, error: tradiesError } = await supabase
        .from('users')
        .select('email')
        .in('id', tradieIds.map(t => t.tradie_id))
        .eq('status', 'approved')
      
      if (tradiesError) {
        console.error('❌ 查询技师信息失败:', tradiesError)
        return []
      }
      
      const emails = tradies?.map(t => t.email).filter(Boolean) || []
      console.log(`✅ 找到 ${emails.length} 个匹配的技师邮箱`)
      return emails
    }
    
    // 如果只有分类信息，通过specialty字段模糊匹配
    if (categoryId) {
      const { categoriesApi } = await import('@/lib/api')
      const category = await categoriesApi.getById(categoryId)
      
      if (category) {
        // 使用分类名称作为specialty进行模糊匹配
        const tradies = await tradiesApi.getBySpecialty(category.name_en)
        const emails = tradies.map(t => t.email).filter(Boolean)
        console.log(`✅ 通过分类找到 ${emails.length} 个匹配的技师邮箱`)
        return emails
      }
    }
    
    // 如果都没有，获取所有已认证的技师（限制数量）
    const allTradies = await tradiesApi.getApproved()
    const limitedTradies = allTradies.slice(0, 10) // 限制发送给前10个技师
    const emails = limitedTradies.map(t => t.email).filter(Boolean)
    
    console.log(`✅ 获取到 ${emails.length} 个技师邮箱（通用匹配）`)
    return emails
    
  } catch (error) {
    console.error('❌ 获取匹配技师邮箱时出错:', error)
    return []
  }
}