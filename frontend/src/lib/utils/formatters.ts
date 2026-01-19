import { format, formatDistanceToNow } from 'date-fns'

export const formatDate = (date: string | Date) => {
  return format(new Date(date), 'MMM dd, yyyy')
}

export const formatDateTime = (date: string | Date) => {
  return format(new Date(date), 'MMM dd, yyyy hh:mm a')
}

export const formatRelativeTime = (date: string | Date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US').format(num)
}

export const formatPercentage = (num: number) => {
  return `${num.toFixed(2)}%`
}
