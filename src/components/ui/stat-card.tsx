import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
  }
  variant?: "default" | "success" | "warning" | "error" | "info"
  animate?: boolean
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ 
    className, 
    title, 
    value, 
    description, 
    icon: Icon, 
    trend,
    variant = "default",
    animate = true,
    ...props 
  }, ref) => {
    const variants = {
      default: "border-border/50",
      success: "border-success/30 bg-success/5",
      warning: "border-warning/30 bg-warning/5",
      error: "border-destructive/30 bg-destructive/5",
      info: "border-info/30 bg-info/5"
    }

    const iconVariants = {
      default: "text-muted-foreground",
      success: "text-success",
      warning: "text-warning",
      error: "text-destructive",
      info: "text-info"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "stat-card",
          variants[variant],
          animate && "animate-scale-in",
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="stat-card-value">
                {value}
              </p>
              {trend && (
                <span className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full",
                  trend.value > 0 ? "status-success" : trend.value < 0 ? "status-error" : "status-info"
                )}>
                  {trend.value > 0 ? "+" : ""}{trend.value}% {trend.label}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {Icon && (
            <div className={cn(
              "p-3 rounded-lg bg-muted/50 transition-transform duration-300 hover:scale-110",
              iconVariants[variant]
            )}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </div>
    )
  }
)
StatCard.displayName = "StatCard"

export { StatCard }
