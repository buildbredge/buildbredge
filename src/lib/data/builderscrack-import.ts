// BuildersCrack技师数据导入模块
export interface BuildersCrackTradie {
  id: string
  companyName: string
  category: string
  location: string
  rating: number
  reviewCount?: number
  description: string
  specialties: string[]
  experience?: string
  verified: boolean
  licenseNumber?: string
  profileUrl: string
  contactUrl: string
  imageUrl?: string
}

export interface ImportedTradieData {
  id: string
  name: string
  company: string
  category: string
  avatar: string
  rating: number
  reviewCount: number
  jobsCompleted: number
  location: string
  responseTime: string
  verified: boolean
  premium: boolean
  priceRange: string
  specialties: string[]
  description: string
  yearsExperience: number
  certifications: string[]
  availableNow: boolean
  contact: {
    phone: string
    email: string
    website?: string
  }
}

// BuildersCrack 技师分类映射
export const TRADIES_CATEGORIES = {
  // 建筑相关
  'builders': '建筑师傅',
  'concrete-layers': '混凝土工',
  'bricklayers': '砌砖工',
  'renovation': '翻新专家',
  'foundations': '地基专家',

  // 水电相关
  'plumbers': '水管工',
  'electricians': '电工技师',
  'gasfitters': '燃气工',
  'heating': '暖通工程师',

  // 装修装饰
  'painters-and-decorators': '油漆装饰工',
  'flooring': '地板工',
  'tiler': '瓷砖工',
  'plasterers': '抹灰工',
  'cabinet-makers': '橱柜制作',

  // 屋顶和外部
  'roofers': '屋顶工',
  'glaziers': '玻璃工',
  'fencing-and-gates': '围栏安装',
  'exterior-cleaners': '外墙清洁',

  // 园艺景观
  'landscapers': '园艺师',
  'gardeners': '花园工',
  'arborists': '树艺师',
  'irrigation': '灌溉专家',

  // 维修保养
  'handymen': '多能工',
  'pest-control': '害虫防治',
  'cleaners': '清洁服务',
  'movers-and-removalists': '搬家服务',

  // 专业服务
  'architects-and-designers': '建筑师设计师',
  'project-managers': '项目经理',
  'surveyors': '测量师',
  'inspectors-and-valuers': '检查评估师'
}

// 地区映射 - 新西兰地区到中文
export const LOCATION_MAPPING = {
  // 北岛主要城市
  'Auckland': '奥克兰',
  'Wellington': '惠灵顿',
  'Hamilton': '汉密尔顿',
  'Tauranga': '陶朗加',
  'Napier': '内皮尔',
  'Hastings': '黑斯廷斯',
  'New Plymouth': '新普利茅斯',
  'Rotorua': '罗托鲁瓦',
  'Whangarei': '旺阿雷',
  'Palmerston North': '北帕默斯顿',

  // 奥克兰区域
  'North Shore': '奥克兰北岸',
  'Manukau': '马努考',
  'Waitakere': '怀塔克雷',
  'Papakura': '帕帕库拉',
  'Rodney': '罗德尼',
  'Franklin': '富兰克林',

  // 惠灵顿区域
  'Hutt Valley': '哈特谷',
  'Lower Hutt': '下哈特',
  'Upper Hutt': '上哈特',
  'Porirua': '波里鲁阿',
  'Kapiti Coast': '卡皮蒂海岸',

  // 南岛主要城市
  'Christchurch': '基督城',
  'Dunedin': '但尼丁',
  'Invercargill': '因弗卡吉尔',
  'Nelson': '尼尔森',
  'Queenstown': '皇后镇',
  'Timaru': '蒂玛鲁',
  'Ashburton': '阿什伯顿',

  // 其他地区
  'Central Otago': '中奥塔哥',
  'Marlborough': '马尔堡',
  'West Coast': '西海岸',
  'Southland': '南地',
  'Canterbury': '坎特伯雷',
  'Otago': '奥塔哥'
}

// 模拟的BuildersCrack技师数据
export const BUILDERSCRACK_TRADIES: BuildersCrackTradie[] = [
  // 建筑师傅
  {
    id: '4bkptb18',
    companyName: 'Toa Civil Construction Limited',
    category: 'builders',
    location: 'Napier',
    rating: 5.0,
    reviewCount: 15,
    description: 'Toa Building is a division of Toa Civil Construction which was established in 2021 by engineers who are passionate about general construction, civil construction and engineering.',
    specialties: ['新建住宅', '土木工程', '一般建筑'],
    experience: '5年以上',
    verified: true,
    licenseNumber: 'LBP-12345',
    profileUrl: '/tradies/4bkptb18/toa-civil-construction-limited',
    contactUrl: '/post-job/direct/4bkptb18'
  },
  {
    id: '4k48sov0',
    companyName: 'QA Construction Group Ltd',
    category: 'builders',
    location: 'Hutt Valley',
    rating: 5.0,
    reviewCount: 28,
    description: 'LBP with over 20 years experience in residential and light commercial building. From cafes and retail stores to multilevel residential renovations.',
    specialties: ['住宅翻新', '商业建筑', '多层建筑'],
    experience: '20年以上',
    verified: true,
    licenseNumber: 'LBP-23456',
    profileUrl: '/tradies/4k48sov0/qa-construction-group-ltd',
    contactUrl: '/post-job/direct/4k48sov0'
  },
  {
    id: '5a3yh0nw',
    companyName: 'RCH Construction',
    category: 'builders',
    location: 'Christchurch',
    rating: 5.0,
    reviewCount: 22,
    description: 'LBP & Certified builder from Christchurch. I specialize in Residential new builds, large/small renovations, decks and fences.',
    specialties: ['新建住宅', '大小翻新', '甲板围栏'],
    experience: '15年以上',
    verified: true,
    licenseNumber: 'LBP-34567',
    profileUrl: '/tradies/5a3yh0nw/rch-construction',
    contactUrl: '/post-job/direct/5a3yh0nw'
  }
]

// 将BuildersCrack数据转换为BUILDBRIDGE格式
export function convertToBuildBridgeFormat(tradieData: BuildersCrackTradie): ImportedTradieData {
  const locationChinese = LOCATION_MAPPING[tradieData.location as keyof typeof LOCATION_MAPPING] || tradieData.location
  const categoryChinese = TRADIES_CATEGORIES[tradieData.category as keyof typeof TRADIES_CATEGORIES] || tradieData.category

  // 生成头像缩写
  const companyWords = tradieData.companyName.split(' ')
  const avatar = companyWords.length >= 2
    ? companyWords[0].charAt(0) + companyWords[1].charAt(0)
    : companyWords[0].substring(0, 2)

  // 估算工作完成数量
  const estimatedJobs = Math.floor((tradieData.reviewCount || 10) * (1.5 + tradieData.rating * 0.3))

  // 估算经验年数
  const experienceYears = tradieData.experience ?
    parseInt(tradieData.experience.match(/\d+/)?.[0] || '5') :
    Math.max(5, Math.floor((tradieData.reviewCount || 5) / 3))

  // 生成认证信息
  const certifications = []
  if (tradieData.verified) certifications.push('平台认证')
  if (tradieData.licenseNumber) certifications.push('持证专业人士')
  certifications.push('质量保证')

  return {
    id: tradieData.id,
    name: tradieData.companyName.split(' ')[0] + '师傅',
    company: tradieData.companyName,
    category: categoryChinese,
    avatar: avatar.toUpperCase(),
    rating: tradieData.rating,
    reviewCount: tradieData.reviewCount || Math.floor(Math.random() * 50) + 10,
    jobsCompleted: estimatedJobs,
    location: locationChinese,
    responseTime: `${Math.floor(Math.random() * 4) + 1}小时内回复`,
    verified: tradieData.verified,
    premium: tradieData.rating >= 4.8,
    priceRange: generatePriceRange(tradieData.category),
    specialties: tradieData.specialties,
    description: tradieData.description,
    yearsExperience: experienceYears,
    certifications: certifications,
    availableNow: Math.random() > 0.3,
    contact: {
      phone: generatePhoneNumber(),
      email: generateEmail(tradieData.companyName),
      website: tradieData.companyName.toLowerCase().includes('ltd') || tradieData.companyName.toLowerCase().includes('limited')
        ? `www.${tradieData.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.co.nz`
        : undefined
    }
  }
}

// 生成价格范围
function generatePriceRange(category: string): string {
  const priceRanges: Record<string, string> = {
    'builders': '$85-150/小时',
    'plumbers': '$90-140/小时',
    'electricians': '$85-130/小时',
    'painters-and-decorators': '$70-110/小时',
    'landscapers': '$65-95/小时',
    'handymen': '$60-85/小时',
    'roofers': '$100-160/小时',
    'flooring': '$75-120/小时'
  }

  return priceRanges[category] || '$70-120/小时'
}

// 生成新西兰电话号码
function generatePhoneNumber(): string {
  const areaCode = ['+64 9', '+64 4', '+64 3', '+64 21', '+64 22', '+64 27'][Math.floor(Math.random() * 6)]
  const number = Math.floor(Math.random() * 9000000) + 1000000
  return `${areaCode} ${number.toString().substring(0, 3)} ${number.toString().substring(3)}`
}

// 生成邮箱地址
function generateEmail(companyName: string): string {
  const domain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '')
  return `info@${domain}.co.nz`
}

// 获取所有转换后的技师数据
export function getAllImportedTradies(): ImportedTradieData[] {
  return BUILDERSCRACK_TRADIES.map(convertToBuildBridgeFormat)
}
