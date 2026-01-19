import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { ROUTES } from '@/lib/constants/routes'
import { PERMISSIONS, ROLES } from '@/lib/constants/permissions'

// Auth Pages
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'

// Dashboard
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'

// Leads
import { LeadsListPage } from '@/features/leads/pages/LeadsListPage'
import { LeadCreatePage } from '@/features/leads/pages/LeadCreatePage'
import { LeadImportPage } from '@/features/leads/pages/LeadImportPage'
import { LeadDetailPage } from '@/features/leads/pages/LeadDetailPage'

// Calls
import { CallsListPage } from '@/features/calls/pages/CallsListPage'

// Campaigns
import { CampaignsListPage } from '@/features/campaigns/pages/CampaignsListPage'
import { CampaignCreatePage } from '@/features/campaigns/pages/CampaignCreatePage'
import { CampaignDetailPage } from '@/features/campaigns/pages/CampaignDetailPage'
import { CampaignTemplatesPage } from '@/features/campaigns/pages/CampaignTemplatesPage'

// HR
import { TimeTrackingPage } from '@/features/hr/pages/TimeTrackingPage'
import { LeaveManagementPageFixed as LeaveManagementPage } from '@/features/hr/pages/LeaveManagementPageFixed'
import { HolidayCalendarPage } from '@/features/hr/pages/HolidayCalendarPage'
import { OnboardingPage } from '@/features/hr/pages/OnboardingPage'
import SalaryPage from '@/features/hr/pages/SalaryPage'
import { TaxDeclarationPage } from '@/features/hr/pages/TaxDeclarationPage'
import { HRAdminDashboard } from '@/features/hr/pages/HRAdminDashboard'
import { ManageOnboardingsPage } from '@/features/hr/pages/ManageOnboardingsPage'
import { LeaveApprovalsPage } from '@/features/hr/pages/LeaveApprovalsPage'

// HR Admin Pages
import { LeaveTypesManagementPage } from '@/features/hr/pages/admin/LeaveTypesManagementPage'
import { AssignSalaryPage } from '@/features/hr/pages/admin/AssignSalaryPage'
import { StartOnboardingPage } from '@/features/hr/pages/admin/StartOnboardingPage'
import { GenerateSalarySlipsPage } from '@/features/hr/pages/admin/GenerateSalarySlipsPage'
import { SalaryStructureManagementPage } from '@/features/hr/pages/admin/SalaryStructureManagementPage'
import { ManageHolidaysPage } from '@/features/hr/pages/admin/ManageHolidaysPage'
import { SalaryComponentsPage } from '@/features/hr/pages/admin/SalaryComponentsPage'
import { DocumentVerificationPage } from '@/features/hr/pages/admin/DocumentVerificationPage'
import { OnboardingTemplatesPage } from '@/features/hr/pages/admin/OnboardingTemplatesPage'
import { TaxProofVerificationPage } from '@/features/hr/pages/admin/TaxProofVerificationPage'
import { ProcessIncrementsPage } from '@/features/hr/pages/admin/ProcessIncrementsPage'
import { BankDetailsManagementPage } from '@/features/hr/pages/admin/BankDetailsManagementPage'
import { GenerateForm16Page } from '@/features/hr/pages/admin/GenerateForm16Page'

// Integrations
import { IntegrationsPage } from '@/features/integrations/pages/IntegrationsPage'

// Users
import { UsersListPage } from '@/features/users/pages/UsersListPage'
import { ProfilePage } from '@/features/users/pages/ProfilePage'

// Notifications
import { NotificationsListPage } from '@/features/notifications/pages/NotificationsListPage'

// Billing
import { BillingPage } from '@/features/billing/pages/BillingPage'

// Reporting
import { ReportsListPage } from '@/features/reporting/pages/ReportsListPage'

// Customer Admin
import { CustomerProfilePage } from '@/features/customer-admin/pages/CustomerProfilePage'

// Settings
import { LicenseManagementPage } from '@/features/settings/pages/LicenseManagementPage'

// Protected Route Component
import { ProtectedRoute } from '@/components/common/ProtectedRoute'

export function AppRouter() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path={ROUTES.LOGIN}
        element={isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <LoginPage />}
      />
      <Route
        path={ROUTES.REGISTER}
        element={isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <RegisterPage />}
      />

      {/* Protected Routes */}
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Leads Routes */}
      <Route
        path={ROUTES.LEADS}
        element={
          <ProtectedRoute permission="leads:read">
            <LeadsListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${ROUTES.LEADS}/new`}
        element={
          <ProtectedRoute permission="leads:read">
            <LeadCreatePage />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${ROUTES.LEADS}/import`}
        element={
          <ProtectedRoute permission="leads:read">
            <LeadImportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${ROUTES.LEADS}/:id`}
        element={
          <ProtectedRoute permission="leads:read">
            <LeadDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Calls Routes */}
      <Route
        path={ROUTES.CALLS}
        element={
          <ProtectedRoute permission="calls:read">
            <CallsListPage />
          </ProtectedRoute>
        }
      />

      {/* Campaigns Routes */}
      <Route
        path={ROUTES.CAMPAIGNS}
        element={
          <ProtectedRoute permission="campaigns:read">
            <CampaignsListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${ROUTES.CAMPAIGNS}/new`}
        element={
          <ProtectedRoute permission="campaigns:read">
            <CampaignCreatePage />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${ROUTES.CAMPAIGNS}/templates`}
        element={
          <ProtectedRoute permission="campaigns:read">
            <CampaignTemplatesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${ROUTES.CAMPAIGNS}/:id`}
        element={
          <ProtectedRoute permission="campaigns:read">
            <CampaignDetailPage />
          </ProtectedRoute>
        }
      />

      {/* HR Routes - Accessible to all employees with hr:read */}
      <Route
        path={ROUTES.TIME_TRACKING}
        element={
          <ProtectedRoute permission="hr:read">
            <TimeTrackingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.LEAVE_MANAGEMENT}
        element={
          <ProtectedRoute permission="hr:read">
            <LeaveManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.HOLIDAY_CALENDAR}
        element={
          <ProtectedRoute permission="hr:read">
            <HolidayCalendarPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ONBOARDING}
        element={
          <ProtectedRoute permission="hr:read">
            <OnboardingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SALARY}
        element={
          <ProtectedRoute permission="hr:read">
            <SalaryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TAX_DECLARATION}
        element={
          <ProtectedRoute permission="hr:read">
            <TaxDeclarationPage />
          </ProtectedRoute>
        }
      />

      {/* HR Admin Routes - Only for HR Managers with hr:manage */}
      <Route
        path={ROUTES.HR_ADMIN}
        element={
          <ProtectedRoute permission="hr:manage">
            <HRAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.HR_ADMIN_ONBOARDING}
        element={
          <ProtectedRoute permission="hr:manage">
            <ManageOnboardingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.HR_ADMIN_LEAVES}
        element={
          <ProtectedRoute permission={["manager:access", "hr:manage"]}>
            <LeaveApprovalsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.HR_ADMIN_LEAVE_TYPES}
        element={
          <ProtectedRoute permission="hr:manage">
            <LeaveTypesManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.HR_ADMIN_ASSIGN_SALARY}
        element={
          <ProtectedRoute permission="hr:manage">
            <AssignSalaryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.HR_ADMIN_START_ONBOARDING}
        element={
          <ProtectedRoute permission="hr:manage">
            <StartOnboardingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.HR_ADMIN_GENERATE_SLIPS}
        element={
          <ProtectedRoute permission="hr:manage">
            <GenerateSalarySlipsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.HR_ADMIN_SALARY_STRUCTURES}
        element={
          <ProtectedRoute permission="hr:manage">
            <SalaryStructureManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.HR_ADMIN_MANAGE_HOLIDAYS}
        element={
          <ProtectedRoute permission="hr:manage">
            <ManageHolidaysPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.HR_ADMIN_SALARY_COMPONENTS}
        element={
          <ProtectedRoute permission="hr:manage">
            <SalaryComponentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.HR_ADMIN_DOCUMENT_VERIFICATION}
        element={
          <ProtectedRoute permission="hr:manage">
            <DocumentVerificationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.HR_ADMIN_ONBOARDING_TEMPLATES}
        element={
          <ProtectedRoute permission="hr:manage">
            <OnboardingTemplatesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.HR_ADMIN_TAX_PROOF_VERIFICATION}
        element={
          <ProtectedRoute permission="hr:manage">
            <TaxProofVerificationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.HR_ADMIN_PROCESS_INCREMENTS}
        element={
          <ProtectedRoute permission="hr:manage">
            <ProcessIncrementsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.HR_ADMIN_BANK_DETAILS}
        element={
          <ProtectedRoute permission="hr:manage">
            <BankDetailsManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.HR_ADMIN_GENERATE_FORM16}
        element={
          <ProtectedRoute permission="hr:manage">
            <GenerateForm16Page />
          </ProtectedRoute>
        }
      />

      {/* Integrations Routes */}
      <Route
        path={ROUTES.INTEGRATIONS}
        element={
          <ProtectedRoute permission="integrations:read">
            <IntegrationsPage />
          </ProtectedRoute>
        }
      />

      {/* Users Routes */}
      <Route
        path={ROUTES.USERS}
        element={
          <ProtectedRoute permission="users:read">
            <UsersListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PROFILE}
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Notifications Routes */}
      <Route
        path={ROUTES.NOTIFICATIONS}
        element={
          <ProtectedRoute>
            <NotificationsListPage />
          </ProtectedRoute>
        }
      />

      {/* Billing Routes */}
      <Route
        path={ROUTES.BILLING}
        element={
          <ProtectedRoute permission="billing:read">
            <BillingPage />
          </ProtectedRoute>
        }
      />

      {/* Reporting Routes */}
      <Route
        path={ROUTES.REPORTS}
        element={
          <ProtectedRoute permission="reports:read_own">
            <ReportsListPage />
          </ProtectedRoute>
        }
      />

      {/* Customer Admin Routes */}
      <Route
        path={ROUTES.CUSTOMER_PROFILE}
        element={
          <ProtectedRoute permission="settings:read">
            <CustomerProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Settings Route */}
      <Route
        path={ROUTES.SETTINGS}
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* License Management Route */}
      <Route
        path={ROUTES.LICENSE_MANAGEMENT}
        element={
          <ProtectedRoute role={ROLES.ADMIN}>
            <LicenseManagementPage />
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN} replace />}
      />

      {/* 404 */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN} replace />}
      />
    </Routes>
  )
}
