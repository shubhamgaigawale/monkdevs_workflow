export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  tenantId: string
  tenantName: string
  roles: string[]
  permissions: string[]
  isActive: boolean
  createdAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  tenantName: string
  tenantSubdomain?: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  userId: string
  email: string
  firstName: string
  lastName: string
  tenantId: string
  tenantName: string
  roles: string[]
  permissions: string[]
}

export interface Lead {
  id: string
  tenantId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  company?: string
  source?: string
  status: LeadStatus
  priority: LeadPriority
  customFields?: Record<string, any>
  notes?: string
  assignedTo?: string
  assignedToName?: string
  createdAt: string
  updatedAt: string
}

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'NEGOTIATION' | 'WON' | 'LOST'

export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface Call {
  id: string
  tenantId: string
  leadId?: string
  userId: string
  phoneNumber: string
  direction: 'INBOUND' | 'OUTBOUND'
  status: string
  duration: number
  callStartTime?: string
  callEndTime?: string
  recordingUrl?: string
  notes?: string
  outcome?: string
  followUpRequired: boolean
  followUpDate?: string
  createdAt: string
  updatedAt: string
}

export interface Campaign {
  id: string
  tenantId: string
  userId: string
  name: string
  subject: string
  previewText?: string
  fromName: string
  replyTo?: string
  status: CampaignStatus
  campaignType: 'EMAIL' | 'SMS' | 'MIXED'
  mailchimpCampaignId?: string
  scheduledAt?: string
  sentAt?: string
  totalRecipients: number
  emailsSent: number
  opens: number
  uniqueOpens: number
  clicks: number
  uniqueClicks: number
  bounces: number
  unsubscribes: number
  content?: string
  openRate: number
  clickRate: number
  bounceRate: number
  unsubscribeRate: number
  createdAt: string
  updatedAt: string
}

export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'PAUSED' | 'CANCELLED'

export interface Integration {
  id: string
  tenantId: string
  integrationType: IntegrationType
  isEnabled: boolean
  isConnected: boolean
  lastSyncedAt?: string
  configData?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export type IntegrationType = 'CALENDLY' | 'RINGCENTRAL' | 'PANDADOC' | 'DOCUSIGN' | 'MAILCHIMP'

export interface TimeEntry {
  id: string
  tenantId: string
  userId: string
  entryType: 'LOGIN' | 'LOGOUT' | 'BREAK_START' | 'BREAK_END'
  timestamp: string
  locationData?: string
  deviceInfo?: string
  notes?: string
  createdAt: string
}
