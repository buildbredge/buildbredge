// Mock data for services when database is not available
// This provides fallback data to ensure the application works during development

export interface MockProfession {
  id: string
  name_en: string
  name_zh: string
  icon: string
  description: string
}

export interface MockCategory {
  id: string
  name_en: string
  name_zh: string
  description: string
  professions: MockProfession[]
}

export function getMockServices(): MockCategory[] {
  return [
    {
      id: '1',
      name_en: 'Home Maintenance',
      name_zh: '住房维护',
      description: '专业的住房维护和修缮服务',
      professions: [
        {
          id: '1-1',
          name_en: 'Plumber',
          name_zh: '水管工',
          icon: 'Droplet',
          description: '专业水管安装、维修和疏通服务'
        },
        {
          id: '1-2',
          name_en: 'Electrician',
          name_zh: '电工',
          icon: 'Zap',
          description: '住宅和商业电气安装与维修'
        },
        {
          id: '1-3',
          name_en: 'Carpenter',
          name_zh: '木工',
          icon: 'Hammer',
          description: '定制家具、装修和木工修缮'
        },
        {
          id: '1-4',
          name_en: 'Painter',
          name_zh: '油漆工',
          icon: 'Paintbrush',
          description: '室内外油漆和装饰服务'
        },
        {
          id: '1-5',
          name_en: 'HVAC Technician',
          name_zh: '空调技师',
          icon: 'Wind',
          description: '空调、暖气系统安装和维修'
        }
      ]
    },
    {
      id: '2',
      name_en: 'Construction & Building',
      name_zh: '建筑施工',
      description: '专业建筑和施工服务',
      professions: [
        {
          id: '2-1',
          name_en: 'Builder',
          name_zh: '建筑师',
          icon: 'HardHat',
          description: '房屋建造和结构施工'
        },
        {
          id: '2-2',
          name_en: 'Roofer',
          name_zh: '屋顶工',
          icon: 'Building',
          description: '屋顶安装、维修和防水'
        },
        {
          id: '2-3',
          name_en: 'Tiler',
          name_zh: '瓷砖工',
          icon: 'Bath',
          description: '瓷砖铺设和浴室装修'
        }
      ]
    },
    {
      id: '3',
      name_en: 'Garden & Landscaping',
      name_zh: '园艺景观',
      description: '园艺美化和景观设计服务',
      professions: [
        {
          id: '3-1',
          name_en: 'Gardener',
          name_zh: '园艺师',
          icon: 'Leaf',
          description: '花园维护和植物种植'
        },
        {
          id: '3-2',
          name_en: 'Tree Surgeon',
          name_zh: '树木医生',
          icon: 'TreePine',
          description: '树木修剪和移除服务'
        }
      ]
    },
    {
      id: '4',
      name_en: 'New Services',
      name_zh: '新增服务',
      description: '全新的生活服务类别',
      professions: [
        {
          id: '4-1',
          name_en: 'Mobile Car Wash',
          name_zh: '上门洗车',
          icon: 'Car',
          description: '专业上门汽车清洗和美容服务'
        },
        {
          id: '4-2',
          name_en: 'Housekeeping',
          name_zh: '家政服务',
          icon: 'Sparkles',
          description: '专业家庭清洁和家政服务'
        },
        {
          id: '4-3',
          name_en: 'Airport Transfer',
          name_zh: '机场接送',
          icon: 'Plane',
          description: '安全可靠的机场接送服务'
        },
        {
          id: '4-4',
          name_en: 'Moving Service',
          name_zh: '搬家运输',
          icon: 'Truck',
          description: '专业搬家和物品运输服务'
        },
        {
          id: '4-5',
          name_en: 'Maternity Care',
          name_zh: '月嫂陪护',
          icon: 'Baby',
          description: '专业月嫂和产后护理服务'
        },
        {
          id: '4-6',
          name_en: 'Property Rental',
          name_zh: '房屋出租',
          icon: 'KeyRound',
          description: '房屋出租和物业管理服务'
        },
        {
          id: '4-7',
          name_en: 'Massage Therapy',
          name_zh: '按摩保健',
          icon: 'Heart',
          description: '专业按摩和健康理疗服务'
        },
        {
          id: '4-8',
          name_en: 'Auto Repair',
          name_zh: '汽车维修',
          icon: 'Settings',
          description: '专业汽车维修和保养服务'
        },
        {
          id: '4-9',
          name_en: 'Education Training',
          name_zh: '教育培训',
          icon: 'GraduationCap',
          description: '各类教育培训和技能提升服务'
        },
        {
          id: '4-10',
          name_en: 'Team Building',
          name_zh: '团建年会',
          icon: 'Users',
          description: '企业团建和年会活动策划服务'
        }
      ]
    },
    {
      id: '5',
      name_en: 'Technology & Security',
      name_zh: '科技安防',
      description: '现代科技和安全服务',
      professions: [
        {
          id: '5-1',
          name_en: 'Security System Installer',
          name_zh: '安防安装师',
          icon: 'Shield',
          description: '安防监控系统安装和维护'
        },
        {
          id: '5-2',
          name_en: 'Network Technician',
          name_zh: '网络技师',
          icon: 'Wifi',
          description: '网络安装和IT技术支持'
        },
        {
          id: '5-3',
          name_en: 'Smart Home Installer',
          name_zh: '智能家居安装师',
          icon: 'Lightbulb',
          description: '智能家居系统安装和配置'
        }
      ]
    }
  ]
}