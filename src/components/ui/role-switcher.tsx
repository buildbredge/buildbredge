"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Home, Wrench, ChevronDown, Check } from "lucide-react"

interface UserRole {
  role_type: 'owner' | 'tradie'
  is_primary: boolean
  created_at: string
}

interface RoleSwitcherProps {
  roles: UserRole[]
  currentRole: 'owner' | 'tradie'
  className?: string
  onRoleSwitch?: (role: 'owner' | 'tradie') => void
}

const roleConfig = {
  owner: {
    label: '业主工作台',
    icon: Home,
    color: 'bg-blue-100 text-blue-800',
    path: '/dashboard/owner'
  },
  tradie: {
    label: '技师工作台', 
    icon: Wrench,
    color: 'bg-green-100 text-green-800',
    path: '/dashboard/tradie'
  }
}

export function RoleSwitcher({ roles, currentRole, className = "", onRoleSwitch }: RoleSwitcherProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Don't show switcher if user only has one role
  if (roles.length <= 1) {
    return null
  }

  const handleRoleSwitch = async (newRole: 'owner' | 'tradie') => {
    if (newRole === currentRole) return
    
    setIsLoading(true)
    
    try {
      // Call the callback if provided
      if (onRoleSwitch) {
        await onRoleSwitch(newRole)
      }
      
      // Navigate to the new role's dashboard
      router.push(roleConfig[newRole].path)
    } catch (error) {
      console.error('Error switching roles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const currentConfig = roleConfig[currentRole]
  const CurrentIcon = currentConfig.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`${className} min-w-[140px] justify-between`}
          disabled={isLoading}
        >
          <div className="flex items-center space-x-2">
            <CurrentIcon className="w-4 h-4" />
            <span className="hidden sm:inline">切换身份</span>
            <span className="sm:hidden">切换</span>
          </div>
          <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">选择工作台</p>
            <p className="text-xs leading-none text-muted-foreground">
              切换到不同的身份视角
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {roles.map((role) => {
          const config = roleConfig[role.role_type]
          const Icon = config.icon
          const isActive = role.role_type === currentRole
          
          return (
            <DropdownMenuItem
              key={role.role_type}
              className="cursor-pointer"
              onClick={() => handleRoleSwitch(role.role_type)}
              disabled={isLoading}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4" />
                  <span>{config.label}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {role.is_primary && (
                    <Badge variant="secondary" className="text-xs">
                      主要
                    </Badge>
                  )}
                  {isActive && (
                    <Check className="w-4 h-4 text-green-600" />
                  )}
                </div>
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default RoleSwitcher