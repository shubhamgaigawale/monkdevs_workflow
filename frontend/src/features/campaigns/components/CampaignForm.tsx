import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useLeads } from '@/features/leads/hooks/useLeads'
import type { Campaign } from '@/types/models'
import type { CreateCampaignDto } from '../api/campaignsApi'

interface CampaignFormProps {
  campaign?: Campaign
  onSubmit: (data: CreateCampaignDto) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function CampaignForm({ campaign, onSubmit, onCancel, isSubmitting }: CampaignFormProps) {
  const { data: leadsData } = useLeads(0, 100) // Fetch first 100 leads
  const [formData, setFormData] = useState<CreateCampaignDto>({
    name: campaign?.name || '',
    subject: campaign?.subject || '',
    previewText: campaign?.previewText || '',
    fromName: campaign?.fromName || '',
    replyTo: campaign?.replyTo || '',
    campaignType: campaign?.campaignType || 'EMAIL',
    content: campaign?.content || '',
    leadIds: [],
    scheduledAt: campaign?.scheduledAt || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name,
        subject: campaign.subject,
        previewText: campaign.previewText || '',
        fromName: campaign.fromName,
        replyTo: campaign.replyTo || '',
        campaignType: campaign.campaignType,
        content: campaign.content || '',
        leadIds: [],
        scheduledAt: campaign.scheduledAt || '',
      })
    }
  }, [campaign])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required'
    }
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    }
    if (!formData.fromName.trim()) {
      newErrors.fromName = 'From name is required'
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required'
    }
    if (!formData.leadIds || formData.leadIds.length === 0) {
      newErrors.leadIds = 'At least one recipient is required'
    }
    if (formData.replyTo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.replyTo)) {
      newErrors.replyTo = 'Invalid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      await onSubmit(formData)
    }
  }

  const handleChange = (field: keyof CreateCampaignDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{campaign ? 'Edit Campaign' : 'Create New Campaign'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Basic Information</h3>
            <div className="space-y-2">
              <Label htmlFor="name">
                Campaign Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
                placeholder="Summer Sale 2024"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaignType">Campaign Type</Label>
              <select
                id="campaignType"
                value={formData.campaignType}
                onChange={(e) => handleChange('campaignType', e.target.value as 'EMAIL' | 'SMS' | 'MIXED')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="EMAIL">Email</option>
                <option value="SMS">SMS</option>
                <option value="MIXED">Mixed</option>
              </select>
            </div>
          </div>

          {/* Email Details */}
          {(formData.campaignType === 'EMAIL' || formData.campaignType === 'MIXED') && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Email Details</h3>
              <div className="space-y-2">
                <Label htmlFor="subject">
                  Subject Line <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  className={errors.subject ? 'border-red-500' : ''}
                  placeholder="🎉 Summer Sale: Up to 50% Off!"
                />
                {errors.subject && (
                  <p className="text-sm text-red-500">{errors.subject}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="previewText">Preview Text</Label>
                <Input
                  id="previewText"
                  value={formData.previewText}
                  onChange={(e) => handleChange('previewText', e.target.value)}
                  placeholder="Limited time offer - don't miss out!"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromName">
                    From Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fromName"
                    value={formData.fromName}
                    onChange={(e) => handleChange('fromName', e.target.value)}
                    className={errors.fromName ? 'border-red-500' : ''}
                    placeholder="Your Company"
                  />
                  {errors.fromName && (
                    <p className="text-sm text-red-500">{errors.fromName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="replyTo">Reply To</Label>
                  <Input
                    id="replyTo"
                    type="email"
                    value={formData.replyTo}
                    onChange={(e) => handleChange('replyTo', e.target.value)}
                    className={errors.replyTo ? 'border-red-500' : ''}
                    placeholder="support@company.com"
                  />
                  {errors.replyTo && (
                    <p className="text-sm text-red-500">{errors.replyTo}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Recipients */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Recipients</h3>
            <div className="space-y-2">
              <Label htmlFor="leadIds">
                Select Recipients <span className="text-red-500">*</span>
              </Label>
              <select
                id="leadIds"
                multiple
                value={formData.leadIds}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value)
                  handleChange('leadIds', selected)
                }}
                className={`flex min-h-[150px] w-full rounded-md border ${errors.leadIds ? 'border-red-500' : 'border-input'} bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring`}
              >
                {leadsData?.content?.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.firstName} {lead.lastName} ({lead.email})
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Hold Ctrl/Cmd to select multiple recipients. {formData.leadIds.length} selected.
              </p>
              {errors.leadIds && (
                <p className="text-sm text-red-500">{errors.leadIds}</p>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">
              Content <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              rows={10}
              className={`flex min-h-[200px] w-full rounded-md border ${errors.content ? 'border-red-500' : 'border-input'} bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring`}
              placeholder="Email body or SMS message..."
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content}</p>
            )}
          </div>

          {/* Schedule */}
          <div className="space-y-2">
            <Label htmlFor="scheduledAt">Schedule (Optional)</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => handleChange('scheduledAt', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to save as draft
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : campaign
                  ? 'Update Campaign'
                  : 'Create Campaign'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
