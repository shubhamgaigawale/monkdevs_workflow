import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive'
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
  variant = 'default'
}: StatsCardProps) {
  const variantStyles = {
    default: 'bg-card hover:shadow-md',
    primary: 'gradient-primary text-primary-foreground border-0',
    success: 'gradient-success text-white border-0',
    warning: 'gradient-warning text-white border-0',
    destructive: 'gradient-destructive text-white border-0',
  }

  return (
    <Card className={cn(
      'card-hover animate-fade-in',
      variantStyles[variant],
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn(
          "text-sm font-medium",
          variant !== 'default' && 'text-white/90'
        )}>
          {title}
        </CardTitle>
        {icon && (
          <div className={cn(
            "h-10 w-10 flex items-center justify-center rounded-lg",
            variant === 'default' ? 'bg-primary/10 text-primary' : 'bg-white/20 text-white'
          )}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        {description && (
          <p className={cn(
            "text-xs mt-1",
            variant === 'default' ? 'text-muted-foreground' : 'text-white/80'
          )}>
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center text-sm mt-2">
            {trend.isPositive ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            <span className="font-semibold">
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </span>
            <span className={cn(
              "ml-1",
              variant === 'default' ? 'text-muted-foreground' : 'text-white/70'
            )}>
              from last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
