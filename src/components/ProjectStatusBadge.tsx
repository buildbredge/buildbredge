"use client"

import { ProjectStatus, getStatusLabel, getStatusColor, getStatusDescription } from "@/types/project-status"

interface ProjectStatusBadgeProps {
  status: ProjectStatus
  language?: 'zh' | 'en'
  showDescription?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-2'
}

const colorVariants = {
  gray: 'bg-gray-100 text-gray-800 border-gray-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  teal: 'bg-teal-100 text-teal-800 border-teal-200',
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  lime: 'bg-lime-100 text-lime-800 border-lime-200',
  red: 'bg-red-100 text-red-800 border-red-200',
  slate: 'bg-slate-100 text-slate-800 border-slate-200'
}

export default function ProjectStatusBadge({ 
  status, 
  language = 'zh', 
  showDescription = false, 
  size = 'md' 
}: ProjectStatusBadgeProps) {
  const label = getStatusLabel(status, language)
  const description = getStatusDescription(status)
  const color = getStatusColor(status)
  
  const badgeClasses = `
    inline-flex items-center border rounded-full font-medium
    ${sizeClasses[size]}
    ${colorVariants[color as keyof typeof colorVariants] || colorVariants.gray}
  `.trim()

  return (
    <span 
      className={badgeClasses}
      title={showDescription ? description : undefined}
    >
      {label}
    </span>
  )
}