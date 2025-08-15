"use client"

import * as React from "react"

interface CollapsibleContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null)

interface CollapsibleProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ open = false, onOpenChange, children }, ref) => {
    const [isOpen, setIsOpen] = React.useState(open)

    React.useEffect(() => {
      setIsOpen(open)
    }, [open])

    const handleToggle = (newOpen: boolean) => {
      setIsOpen(newOpen)
      onOpenChange?.(newOpen)
    }

    return (
      <CollapsibleContext.Provider value={{ open: isOpen, onOpenChange: handleToggle }}>
        <div ref={ref}>
          {children}
        </div>
      </CollapsibleContext.Provider>
    )
  }
)

Collapsible.displayName = "Collapsible"

interface CollapsibleTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  ({ asChild = false, children, ...props }, ref) => {
    const context = React.useContext(CollapsibleContext)
    
    if (!context) {
      throw new Error("CollapsibleTrigger must be used within a Collapsible")
    }

    const handleClick = () => {
      context.onOpenChange(!context.open)
    }

    if (asChild) {
      // Clone the child element and add the onClick handler
      return React.cloneElement(
        children as React.ReactElement,
        {
          ...props,
          ref,
          onClick: handleClick,
        }
      )
    }

    return (
      <button
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  }
)

CollapsibleTrigger.displayName = "CollapsibleTrigger"

interface CollapsibleContentProps {
  children: React.ReactNode
  className?: string
}

const CollapsibleContent = React.forwardRef<HTMLDivElement, CollapsibleContentProps>(
  ({ children, className }, ref) => {
    const context = React.useContext(CollapsibleContext)
    
    if (!context) {
      throw new Error("CollapsibleContent must be used within a Collapsible")
    }

    if (!context.open) {
      return null
    }

    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    )
  }
)

CollapsibleContent.displayName = "CollapsibleContent"

export { Collapsible, CollapsibleTrigger, CollapsibleContent }