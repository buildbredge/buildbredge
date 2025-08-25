const { createClient } = require('@supabase/supabase-js')

// 配置Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key'
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// 假数据
const tradieData = [
  {"website":"www.brotherwood.co.nz","address":"67 Waimauku Station Road 奥克兰 新西兰 0812","category_id":"9737f262-7a3c-428d-aa28-ae81e8c8388d","profession_id":"437b1240-033e-4d49-a2ec-b0f65e7583e1","name":"Matthew John PRIESTLEY","bio":"树桩研磨、小树移除服务、覆盖、土地清理、树艺师/树木移除服务","company":"BROTHERWOOD LIMITED","service_area":"奥克兰市区及郊区"},
  {"website":"","address":"55 Shortland Street Auckland New Zealand 1010","category_id":"1eabc95f-fe6a-4278-ac38-e838ee0d2289","profession_id":"2aec8b34-dba8-4eed-a6ba-640484689a8a","name":"Mark Geoffrey ANDREWS","bio":"*水箱清洁 - 满水箱和空水箱清洁。 *水箱维修 - 混凝土水箱修复。 *过滤 - 确保饮用水安全。 *水泵 - 维修、保养和销售","company":"S-TEC HEALTHY WATER SOLUTIONS LIMITED","service_area":"奥克兰市区及郊区"},
  {"website":"www.blackoutelectric.co.nz","address":"5 Muriwai Road Waimauku Waimauku New Zealand 0812","category_id":"cef36b28-de63-4520-a225-d46c78ce306c","profession_id":"ea84bb34-8b04-4865-8ce4-a3648aff15ff","name":"Toni Louise WEAVER","bio":"您值得信赖的 Waimauku 电工。我们拥有超过 17 年的经验，提供一流的住宅和商业电力服务，确保您的房产安全高效。","company":"BLACKOUT ELECTRIC LIMITED","service_area":"奥克兰市区及郊区"},
  {"website":"https://www.krelectrical.co.nz","address":"19 Vinistra Road Kumeu Kumeu New Zealand 0810","category_id":"cef36b28-de63-4520-a225-d46c78ce306c","profession_id":"ea84bb34-8b04-4865-8ce4-a3648aff15ff","name":"Kristopher James ROBERTS","bio":"提供全方位的电气服务，包括安装、维修和维护。无论项目大小，我们都会以同样的专注、专业和客户关怀为您服务。从基础照明和电源到完整的房屋布线、供暖、调光和控制，我们都能满足您的需求","company":"KR Electrical","service_area":"奥克兰市区及郊区"},
  {"website":"https://grounduplandscaping.co.nz/","address":"16 Pititi Lane Kumeu Kumeu New Zealand 0810","category_id":"9737f262-7a3c-428d-aa28-ae81e8c8388d","profession_id":"901a03b9-f167-46d0-98a1-68c289ae63a9","name":"Andrew McQuoid","bio":"Ground Up Landscaping Ltd 是一家值得信赖的景观设计公司，成立于 2012 年，服务范围覆盖奥克兰西区、奥克兰西北部和奥克兰中部地区。我们专注于根据您的需求打造美观实用的户外空间。","company":"Ground Up Landscaping Ltd","service_area":"奥克兰市区及郊区"}
]

// 生成随机邮箱
function generateRandomEmail(name) {
  const cleanName = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '')
  const randomNum = Math.floor(Math.random() * 1000)
  return `${cleanName}${randomNum}@example.com`
}

// 生成随机手机号
function generateRandomPhone() {
  const prefix = '+64'
  const number = Math.floor(Math.random() * 900000000) + 100000000
  return `${prefix}${number}`
}

// 插入用户数据
async function insertTradieUsers() {
  console.log('开始插入技师用户数据...')
  
  for (let i = 0; i < tradieData.length; i++) {
    const tradie = tradieData[i]
    console.log(`\n处理第 ${i + 1} 个技师: ${tradie.name}`)
    
    try {
      // 1. 插入用户基本信息
      const userInsertData = {
        name: tradie.name || '未知用户',
        email: generateRandomEmail(tradie.name || `user${i}`),
        phone: generateRandomPhone(),
        address: tradie.address || '',
        website: tradie.website || null,
        service_area: tradie.service_area || null,
        bio: tradie.bio || null,
        company: tradie.company || null,
        status: 'approved', // 设置为已批准状态
        balance: 0,
        rating: 5.0,
        review_count: 0,
        service_radius: 50, // 默认服务半径50公里
        phone_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert(userInsertData)
        .select('id')
        .single()
      
      if (userError) {
        console.error(`插入用户失败:`, userError)
        continue
      }
      
      console.log(`✓ 用户插入成功，ID: ${newUser.id}`)
      
      // 2. 插入用户角色信息
      const roleInsertData = {
        user_id: newUser.id,
        role_type: 'tradie',
        is_primary: true,
        created_at: new Date().toISOString()
      }
      
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert(roleInsertData)
      
      if (roleError) {
        console.error(`插入用户角色失败:`, roleError)
        continue
      }
      
      console.log(`✓ 用户角色插入成功`)
      
      // 3. 插入技师专业信息
      if (tradie.category_id && tradie.profession_id) {
        const professionInsertData = {
          tradie_id: newUser.id,
          category_id: tradie.category_id,
          profession_id: tradie.profession_id,
          created_at: new Date().toISOString()
        }
        
        const { error: professionError } = await supabase
          .from('tradie_professions')
          .insert(professionInsertData)
        
        if (professionError) {
          console.error(`插入技师专业信息失败:`, professionError)
          continue
        }
        
        console.log(`✓ 技师专业信息插入成功`)
      }
      
      console.log(`✓ 技师 ${tradie.name} 数据插入完成`)
      
    } catch (error) {
      console.error(`处理技师 ${tradie.name} 时出错:`, error)
    }
  }
  
  console.log('\n所有技师数据插入完成！')
}

// 执行插入
insertTradieUsers().catch(console.error)