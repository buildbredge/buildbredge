import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

// GET: 获取从属技师列表或父技师信息
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const tradieId = searchParams.get('tradieId')

    if (!tradieId) {
      return NextResponse.json({
        success: false,
        error: "缺少技师ID"
      }, { status: 400 })
    }

    if (action === 'subordinates') {
      // 获取从属技师列表
      const { data: initialSubordinates, error } = await supabase
        .rpc('get_subordinate_tradies', { parent_id: tradieId })

      let subordinates = initialSubordinates

      if (error) {
        console.error('Error fetching subordinate tradies with function:', error)
        
        // 如果是函数不存在错误，使用备用查询
        if (error.message && (error.message.includes('function get_subordinate_tradies') || error.message.includes('Could not find the function'))) {
          console.warn('Database function get_subordinate_tradies not found, using fallback query')
          
          // 备用查询：简单查询用户信息，然后获取专业技能
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('users')
            .select(`
              id,
              name,
              email,
              phone,
              company,
              status,
              created_at,
              rating,
              review_count
            `)
            .eq('parent_tradie_id', tradieId)
            .order('created_at', { ascending: false })

          if (fallbackError) {
            console.error('Fallback query also failed:', fallbackError)
            return NextResponse.json({
              success: true,
              data: []
            })
          }

          // 为每个用户获取专业技能信息
          const usersWithSpecialties = []
          if (fallbackData && fallbackData.length > 0) {
            for (const user of fallbackData) {
              // 获取用户的专业技能
              const { data: professions } = await supabase
                .from('tradie_professions')
                .select(`
                  categories (
                    name_zh
                  )
                `)
                .eq('tradie_id', user.id)
              
              const specialty = professions?.map(p => (Array.isArray(p.categories) ? p.categories[0] : p.categories)?.name_zh).filter(Boolean).join(', ') || null
              
              usersWithSpecialties.push({
                ...user,
                specialty
              })
            }
          }
          subordinates = usersWithSpecialties
        } else {
          console.error('Unexpected error:', error)
          return NextResponse.json({
            success: false,
            error: `获取从属技师列表失败: ${error.message}`
          }, { status: 500 })
        }
      }

      return NextResponse.json({
        success: true,
        data: subordinates || []
      })
    } else if (action === 'parent') {
      // 获取父技师信息
      const { data: initialParent, error } = await supabase
        .rpc('get_parent_tradie', { child_id: tradieId })

      let parent = initialParent

      if (error) {
        console.error('Error fetching parent tradie with function:', error)
        
        // 如果是函数不存在错误，使用备用查询
        if (error.message && (error.message.includes('function get_parent_tradie') || error.message.includes('Could not find the function'))) {
          console.warn('Database function get_parent_tradie not found, using fallback query')
          
          // 备用查询：先查询当前用户获取parent_tradie_id，然后查询父技师信息
          const { data: currentUser, error: currentUserError } = await supabase
            .from('users')
            .select('parent_tradie_id')
            .eq('id', tradieId)
            .not('parent_tradie_id', 'is', null)
            .single()

          if (currentUserError) {
            // 如果是没找到记录（PGRST116），说明该用户没有父技师，这是正常情况
            if (currentUserError.code === 'PGRST116') {
              return NextResponse.json({
                success: true,
                data: null
              })
            }
            // 其他错误才记录
            console.error('Current user query error:', currentUserError)
            return NextResponse.json({
              success: true,
              data: null
            })
          }

          if (!currentUser?.parent_tradie_id) {
            return NextResponse.json({
              success: true,
              data: null
            })
          }

          // 查询父技师基本信息
          const { data: parentTradie, error: parentError } = await supabase
            .from('users')
            .select('id, name, email, company')
            .eq('id', currentUser.parent_tradie_id)
            .single()

          if (parentError) {
            console.error('Parent tradie query failed:', parentError)
            return NextResponse.json({
              success: true,
              data: null
            })
          }

          // 获取父技师的专业技能信息
          if (parentTradie) {
            // 获取父技师的专业技能
            const { data: professions } = await supabase
              .from('tradie_professions')
              .select(`
                categories (
                  name_zh
                )
              `)
              .eq('tradie_id', parentTradie.id)
            
            const specialty = professions?.map(p => (Array.isArray(p.categories) ? p.categories[0] : p.categories)?.name_zh).filter(Boolean).join(', ') || null
            
            parent = [{
              ...parentTradie,
              specialty
            }]
          } else {
            parent = []
          }
        } else {
          console.error('Unexpected parent tradie error:', error)
          return NextResponse.json({
            success: false,
            error: `获取父技师信息失败: ${error.message}`
          }, { status: 500 })
        }
      }

      return NextResponse.json({
        success: true,
        data: parent && parent.length > 0 ? parent[0] : null
      })
    } else {
      return NextResponse.json({
        success: false,
        error: "无效的操作类型"
      }, { status: 400 })
    }

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({
      success: false,
      error: "服务器内部错误"
    }, { status: 500 })
  }
}
