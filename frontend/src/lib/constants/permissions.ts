export const PERMISSIONS = {
  // Leads
  LEADS_READ: 'leads:read',
  LEADS_WRITE: 'leads:write',
  LEADS_DELETE: 'leads:delete',
  LEADS_ASSIGN: 'leads:assign',
  LEADS_REASSIGN: 'leads:reassign',
  LEADS_IMPORT: 'leads:import',

  // Calls
  CALLS_READ: 'calls:read',
  CALLS_WRITE: 'calls:write',
  CALLS_DELETE: 'calls:delete',

  // Campaigns
  CAMPAIGNS_READ: 'campaigns:read',
  CAMPAIGNS_WRITE: 'campaigns:write',
  CAMPAIGNS_DELETE: 'campaigns:delete',
  CAMPAIGNS_SEND: 'campaigns:send',

  // Integrations
  INTEGRATIONS_READ: 'integrations:read',
  INTEGRATIONS_WRITE: 'integrations:write',

  // HR - General
  HR_READ: 'hr:read',
  HR_MANAGE: 'hr:manage',

  // IT Management
  IT_MANAGE: 'it:manage',

  // Manager Access
  MANAGER_ACCESS: 'manager:access',

  // Team Management
  TEAM_MANAGE: 'team:manage',

  // Reports
  REPORTS_READ_OWN: 'reports:read_own',
  REPORTS_READ_TEAM: 'reports:read_team',
  REPORTS_READ_ALL: 'reports:read_all',
  REPORTS_GENERATE: 'reports:generate',

  // Settings
  SETTINGS_READ: 'settings:read',
  SETTINGS_WRITE: 'settings:write',

  // Billing
  BILLING_READ: 'billing:read',
  BILLING_WRITE: 'billing:write',

  // Users
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',
} as const

export const ROLES = {
  ADMIN: 'ADMIN',
  SUPERVISOR: 'SUPERVISOR',
  AGENT: 'AGENT',
  MANAGER: 'MANAGER',
  HR_MANAGER: 'HR_MANAGER',
  IT_ADMIN: 'IT_ADMIN',
} as const
