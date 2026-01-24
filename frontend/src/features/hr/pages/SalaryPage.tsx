import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Wallet, TrendingUp, Coins, CreditCard } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatsCard } from '@/components/common/StatsCard';
import { ColumnDef } from '@tanstack/react-table'

import {
  useMySalary,
  useMySalarySlips,
  useDownloadSalarySlip,
} from '../hooks/useSalary';
import type { SalarySlip } from '../api/salaryApi';

const SalaryPage = () => {
  const { data: mySalary, isLoading: salaryLoading, error: salaryError } = useMySalary();
  const { data: salarySlips, isLoading: slipsLoading } = useMySalarySlips();
  const downloadSlip = useDownloadSalarySlip();

  const handleDownload = (slipId: string) => {
    downloadSlip.mutate(slipId);
  };

  if (salaryLoading) {
    return (
      <AppLayout title="Salary & Compensation" subtitle="View your salary details and download salary slips">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading salary information...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (salaryError) {
    const errorDetails = salaryError as any;
    const statusCode = errorDetails?.response?.status;
    const errorMessage = errorDetails?.response?.data?.message || errorDetails?.message || 'Unknown error';

    // If it's a 404, show "No Salary Information" state
    if (statusCode === 404) {
      return (
        <AppLayout title="Salary & Compensation" subtitle="View your salary details and download salary slips">
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Salary Information</h3>
                <p className="text-muted-foreground mt-2">
                  Your salary has not been configured yet. Please contact HR to set up your salary information.
                </p>
              </div>
            </CardContent>
          </Card>
        </AppLayout>
      );
    }

    // For other errors, show detailed error
    return (
      <AppLayout title="Salary & Compensation" subtitle="View your salary details and download salary slips">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Error Loading Salary Information</h3>
              <p className="text-muted-foreground mt-2">{errorMessage}</p>
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  if (!mySalary) {
    return (
      <AppLayout title="Salary & Compensation" subtitle="View your salary details and download salary slips">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Salary Information</h3>
              <p className="text-muted-foreground">
                Your salary information has not been configured yet. Please contact HR.
              </p>
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  // Calculate monthly amounts
  // const monthlyGross = mySalary.ctc / 12;
  const earnings = mySalary.components
    .filter(c => c.componentType === 'EARNING')
    .reduce((sum, c) => sum + c.amount, 0);
  const deductions = mySalary.components
    .filter(c => c.componentType === 'DEDUCTION')
    .reduce((sum, c) => sum + c.amount, 0);
  const netSalary = earnings - deductions;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      DRAFT: 'secondary',
      GENERATED: 'outline',
      PAID: 'default',
      CANCELLED: 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  export const columns: ColumnDef<SalarySlip>[] = [
    {
      header: 'Month/Year',
      accessorFn: (row) =>
        new Date(row.year, row.month - 1).toLocaleDateString('en-IN', {
          month: 'long',
          year: 'numeric',
        }),
    },
    {
      header: 'Gross Salary',
      accessorKey: 'grossSalary',
      cell: ({ getValue }) =>
        `₹${Number(getValue()).toLocaleString('en-IN')}`,
    },
    {
      header: 'Deductions',
      accessorKey: 'totalDeductions',
      cell: ({ getValue }) =>
        `₹${Number(getValue()).toLocaleString('en-IN')}`,
    },
    {
      header: 'Net Salary',
      accessorKey: 'netSalary',
      cell: ({ getValue }) => (
        <span className="font-semibold text-green-600">
          ₹{Number(getValue()).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ getValue }) => getStatusBadge(getValue() as SalarySlip['status']),
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDownload(row.original.id)}
          disabled={downloadSlip.isPending}
        >
          <Download className="h-4 w-4 mr-2" />
          PDF
        </Button>
      ),
    },
  ]

  return (
    <AppLayout title="Salary & Compensation" subtitle="View your salary details and download salary slips">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatsCard
          title="Annual CTC"
          value={`₹${mySalary.ctc.toLocaleString('en-IN')}`}
          icon={<TrendingUp className="h-5 w-5" />}
          description={mySalary.structureName}
          variant="primary"
        />
        <StatsCard
          title="Monthly Gross"
          value={`₹${earnings.toLocaleString('en-IN')}`}
          icon={<Coins className="h-5 w-5" />}
          description="Total earnings per month"
          variant="warning"
        />
        <StatsCard
          title="Net Salary"
          value={`₹${netSalary.toLocaleString('en-IN')}`}
          icon={<CreditCard className="h-5 w-5" />}
          description="After deductions"
          variant="success"
        />
      </div>

      {mySalary.components && mySalary.components.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Salary Components</CardTitle>
            <CardDescription>Monthly breakdown of earnings and deductions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-3">Earnings</h3>
                <div className="space-y-2">
                  {mySalary.components
                    .filter(c => c.componentType === 'EARNING')
                    .map((component) => (
                      <div key={component.componentId} className="flex justify-between py-2 border-b">
                        <span className="text-sm">{component.componentName}</span>
                        <span className="font-medium text-green-600">
                          +₹{component.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  <div className="flex justify-between py-2 font-semibold">
                    <span>Total Earnings</span>
                    <span className="text-green-600">₹{earnings.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-3">Deductions</h3>
                <div className="space-y-2">
                  {mySalary.components
                    .filter(c => c.componentType === 'DEDUCTION')
                    .map((component) => (
                      <div key={component.componentId} className="flex justify-between py-2 border-b">
                        <span className="text-sm">{component.componentName}</span>
                        <span className="font-medium text-red-600">
                          -₹{component.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  <div className="flex justify-between py-2 font-semibold">
                    <span>Total Deductions</span>
                    <span className="text-red-600">₹{deductions.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Salary Slips</CardTitle>
          <CardDescription>Download your monthly salary slips</CardDescription>
        </CardHeader>
        <CardContent>
          {slipsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading salary slips...</p>
              </div>
            </div>
          ) : salarySlips && salarySlips.length > 0 ? (
            <DataTable
              data={salarySlips}
              columns={columns}
              searchable={false}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No salary slips available yet
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default SalaryPage;
