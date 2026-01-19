export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',

  // Leads
  LEADS: '/leads',
  LEAD_DETAIL: '/leads/:id',
  LEAD_IMPORT: '/leads/import',
  LEAD_ASSIGN: '/leads/assign',

  // Calls
  CALLS: '/calls',
  CALL_DETAIL: '/calls/:id',

  // Campaigns
  CAMPAIGNS: '/campaigns',
  CAMPAIGN_CREATE: '/campaigns/new',
  CAMPAIGN_EDIT: '/campaigns/:id/edit',
  CAMPAIGN_DETAIL: '/campaigns/:id',
  CAMPAIGN_TEMPLATES: '/campaigns/templates',

  // Integrations
  INTEGRATIONS: '/integrations',
  APPOINTMENTS: '/integrations/appointments',
  OAUTH_CALLBACK: '/integrations/:type/callback',

  // HR
  TIME_TRACKING: '/hr/time-tracking',
  LEAVE_MANAGEMENT: '/hr/leave',
  HOLIDAY_CALENDAR: '/hr/holidays',
  ONBOARDING: '/hr/onboarding',
  SALARY: '/hr/salary',
  TAX_DECLARATION: '/hr/tax',
  ATTENDANCE: '/hr/attendance',
  PERFORMANCE: '/hr/performance',

  // HR Admin
  HR_ADMIN: '/hr/admin',
  HR_ADMIN_ONBOARDING: '/hr/admin/onboarding',
  HR_ADMIN_LEAVES: '/hr/admin/leaves',
  HR_ADMIN_LEAVE_TYPES: '/hr/admin/leave-types',
  HR_ADMIN_ASSIGN_SALARY: '/hr/admin/assign-salary',
  HR_ADMIN_START_ONBOARDING: '/hr/admin/start-onboarding',
  HR_ADMIN_GENERATE_SLIPS: '/hr/admin/generate-slips',
  HR_ADMIN_SALARY_STRUCTURES: '/hr/admin/salary-structures',
  HR_ADMIN_MANAGE_HOLIDAYS: '/hr/admin/manage-holidays',
  HR_ADMIN_SALARY_COMPONENTS: '/hr/admin/salary-components',
  HR_ADMIN_DOCUMENT_VERIFICATION: '/hr/admin/document-verification',
  HR_ADMIN_ONBOARDING_TEMPLATES: '/hr/admin/onboarding-templates',
  HR_ADMIN_TAX_PROOF_VERIFICATION: '/hr/admin/tax-proof-verification',
  HR_ADMIN_PROCESS_INCREMENTS: '/hr/admin/process-increments',
  HR_ADMIN_BANK_DETAILS: '/hr/admin/bank-details',
  HR_ADMIN_GENERATE_FORM16: '/hr/admin/generate-form16',

  // Users
  USERS: '/users',
  USER_DETAIL: '/users/:id',
  PROFILE: '/profile',

  // Notifications
  NOTIFICATIONS: '/notifications',

  // Billing
  BILLING: '/billing',
  SUBSCRIPTIONS: '/billing/subscriptions',
  PAYMENTS: '/billing/payments',

  // Reporting
  REPORTS: '/reports',
  REPORT_DETAIL: '/reports/:id',

  // Customer Admin
  CUSTOMER_PROFILE: '/customer/profile',

  // Settings
  SETTINGS: '/settings',
  LICENSE_MANAGEMENT: '/settings/license',
} as const
