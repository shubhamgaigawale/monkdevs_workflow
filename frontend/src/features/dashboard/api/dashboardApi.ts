import { leadServiceAPI, callServiceAPI, campaignServiceAPI } from '@/lib/api/services'

export interface DashboardStats {
  totalLeads: number
  leadsGrowth: number
  activeCampaigns: number
  scheduledCampaigns: number
  callsToday: number
  callsGrowth: number
  conversionRate: number
  conversionGrowth: number
}

export interface LeadPipelineData {
  status: string
  count: number
}

export interface CampaignPerformanceData {
  date: string
  opens: number
  clicks: number
}

export interface CallVolumeData {
  date: string
  calls: number
}

export interface LeadSourceData {
  source: string
  count: number
}

export interface ActivityItem {
  id: string
  type: 'lead' | 'call' | 'campaign' | 'integration'
  title: string
  description: string
  timestamp: string
  user?: string
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      // Fetch data from all services in parallel
      const [leadsResponse, campaignsResponse, callsResponse] = await Promise.all([
        leadServiceAPI.get('/api/leads?page=0&size=1000'),
        campaignServiceAPI.get('/api/campaigns?page=0&size=1000'),
        callServiceAPI.get('/api/calls?page=0&size=1000'),
      ])

      const leads = leadsResponse.data?.data?.content || []
      const campaigns = campaignsResponse.data?.data?.content || []
      const calls = callsResponse.data?.data?.content || []

      // Calculate stats
      const totalLeads = leads.length
      const activeCampaigns = campaigns.filter((c: any) => c.status === 'SENT' || c.status === 'SCHEDULED').length
      const scheduledCampaigns = campaigns.filter((c: any) => c.status === 'SCHEDULED').length

      // Get today's calls
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const callsToday = calls.filter((c: any) => {
        const callDate = new Date(c.createdAt)
        return callDate >= today
      }).length

      // Calculate conversion rate (CONVERTED leads / total leads)
      const convertedLeads = leads.filter((l: any) => l.status === 'CONVERTED').length
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0

      return {
        totalLeads,
        leadsGrowth: 12.5, // Mock growth data
        activeCampaigns,
        scheduledCampaigns,
        callsToday,
        callsGrowth: 8.3, // Mock growth data
        conversionRate,
        conversionGrowth: 3.2, // Mock growth data
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      throw error
    }
  },

  getLeadPipeline: async (): Promise<LeadPipelineData[]> => {
    try {
      const response = await leadServiceAPI.get('/api/leads?page=0&size=1000')
      const leads = response.data?.data?.content || []

      // Count leads by status
      const statusCounts = leads.reduce((acc: any, lead: any) => {
        const status = lead.status || 'UNKNOWN'
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {})

      return Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count: count as number,
      }))
    } catch (error) {
      console.error('Error fetching lead pipeline:', error)
      return []
    }
  },

  getCampaignPerformance: async (): Promise<CampaignPerformanceData[]> => {
    try {
      const response = await campaignServiceAPI.get('/api/campaigns?page=0&size=1000')
      const campaigns = response.data?.data?.content || []

      // Group by date and sum metrics
      const performanceMap = new Map<string, { opens: number; clicks: number }>()

      campaigns.forEach((campaign: any) => {
        if (campaign.sentAt) {
          const date = new Date(campaign.sentAt).toISOString().split('T')[0]
          const existing = performanceMap.get(date) || { opens: 0, clicks: 0 }
          performanceMap.set(date, {
            opens: existing.opens + (campaign.opens || 0),
            clicks: existing.clicks + (campaign.clicks || 0),
          })
        }
      })

      return Array.from(performanceMap.entries())
        .map(([date, metrics]) => ({
          date,
          ...metrics,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
    } catch (error) {
      console.error('Error fetching campaign performance:', error)
      return []
    }
  },

  getCallVolume: async (days: number = 7): Promise<CallVolumeData[]> => {
    try {
      const response = await callServiceAPI.get('/api/calls?page=0&size=1000')
      const calls = response.data?.data?.content || []

      // Group calls by date
      const volumeMap = new Map<string, number>()

      calls.forEach((call: any) => {
        if (call.createdAt) {
          const date = new Date(call.createdAt).toISOString().split('T')[0]
          volumeMap.set(date, (volumeMap.get(date) || 0) + 1)
        }
      })

      return Array.from(volumeMap.entries())
        .map(([date, calls]) => ({
          date,
          calls,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-days) // Get last N days
    } catch (error) {
      console.error('Error fetching call volume:', error)
      return []
    }
  },

  getLeadSources: async (): Promise<LeadSourceData[]> => {
    try {
      const response = await leadServiceAPI.get('/api/leads?page=0&size=1000')
      const leads = response.data?.data?.content || []

      // Count leads by source
      const sourceCounts = leads.reduce((acc: any, lead: any) => {
        const source = lead.source || 'Unknown'
        acc[source] = (acc[source] || 0) + 1
        return acc
      }, {})

      return Object.entries(sourceCounts).map(([source, count]) => ({
        source,
        count: count as number,
      }))
    } catch (error) {
      console.error('Error fetching lead sources:', error)
      return []
    }
  },

  getRecentActivity: async (limit: number = 10): Promise<ActivityItem[]> => {
    try {
      // Fetch recent leads, calls, and campaigns
      const [leadsResponse, callsResponse, campaignsResponse] = await Promise.all([
        leadServiceAPI.get('/api/leads?page=0&size=5'),
        callServiceAPI.get('/api/calls?page=0&size=5'),
        campaignServiceAPI.get('/api/campaigns?page=0&size=5'),
      ])

      const activities: ActivityItem[] = []

      // Add lead activities
      const leads = leadsResponse.data?.data?.content || []
      leads.forEach((lead: any) => {
        activities.push({
          id: lead.id,
          type: 'lead',
          title: 'New Lead',
          description: `${lead.firstName} ${lead.lastName} from ${lead.company || 'Unknown Company'}`,
          timestamp: lead.createdAt,
        })
      })

      // Add call activities
      const calls = callsResponse.data?.data?.content || []
      calls.forEach((call: any) => {
        activities.push({
          id: call.id,
          type: 'call',
          title: 'Call Logged',
          description: `${call.direction} call - ${call.outcome || 'No outcome'}`,
          timestamp: call.createdAt,
        })
      })

      // Add campaign activities
      const campaigns = campaignsResponse.data?.data?.content || []
      campaigns.forEach((campaign: any) => {
        activities.push({
          id: campaign.id,
          type: 'campaign',
          title: 'Campaign Activity',
          description: `${campaign.name} - ${campaign.status}`,
          timestamp: campaign.createdAt,
        })
      })

      // Sort by timestamp and limit
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit)
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      return []
    }
  },
}
