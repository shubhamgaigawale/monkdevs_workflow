import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Plus } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ROUTES } from '@/lib/constants/routes'

export function CampaignTemplatesPage() {
  const navigate = useNavigate()

  const templates = [
    {
      id: '1',
      name: 'Welcome Email',
      description: 'Welcome new customers or leads to your service',
      category: 'Onboarding',
      preview: 'Hi {{firstName}}, welcome to our service! We\'re excited to have you...',
    },
    {
      id: '2',
      name: 'Product Launch',
      description: 'Announce a new product or feature to your audience',
      category: 'Marketing',
      preview: 'Introducing our latest product! Get exclusive early access...',
    },
    {
      id: '3',
      name: 'Newsletter',
      description: 'Monthly newsletter template with updates and news',
      category: 'Newsletter',
      preview: 'This month\'s highlights: New features, success stories, and more...',
    },
    {
      id: '4',
      name: 'Event Invitation',
      description: 'Invite your audience to webinars or events',
      category: 'Events',
      preview: 'You\'re invited! Join us for an exclusive webinar on...',
    },
    {
      id: '5',
      name: 'Follow-up Email',
      description: 'Follow up with leads after initial contact',
      category: 'Sales',
      preview: 'Hi {{firstName}}, I wanted to follow up on our conversation...',
    },
    {
      id: '6',
      name: 'Abandoned Cart',
      description: 'Remind customers about items left in their cart',
      category: 'E-commerce',
      preview: 'You left something behind! Complete your purchase and get 10% off...',
    },
  ]

  const categories = Array.from(new Set(templates.map(t => t.category)))

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(ROUTES.CAMPAIGNS)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Campaign Templates</h1>
              <p className="text-muted-foreground mt-2">
                Choose from pre-built templates to get started quickly
              </p>
            </div>
          </div>
          <Button onClick={() => navigate(`${ROUTES.CAMPAIGNS}/new`)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Custom Campaign
          </Button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm">
            All Templates
          </Button>
          {categories.map((category) => (
            <Button key={category} variant="ghost" size="sm">
              {category}
            </Button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {template.category}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                  <p className="text-xs text-gray-600 italic line-clamp-2">
                    {template.preview}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      // TODO: Load template into campaign form
                      navigate(`${ROUTES.CAMPAIGNS}/new`, { state: { templateId: template.id } })
                    }}
                  >
                    Use Template
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // TODO: Show full template preview
                      alert('Template preview feature coming soon!')
                    }}
                  >
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
