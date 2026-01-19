import api from '@/lib/api/axios';
import type { AxiosResponse } from 'axios';

// ==================== Types ====================

export interface SalaryComponent {
  id: string;
  name: string;
  code: string;
  componentType: 'EARNING' | 'DEDUCTION';
  calculationType: 'FIXED' | 'PERCENTAGE' | 'FORMULA';
  percentage?: number;
  isTaxable: boolean;
  isFixed: boolean;
  displayOrder?: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface SalaryStructureComponent {
  componentId: string;
  componentName?: string;
  percentage?: number;
  fixedAmount?: number;
}

export interface SalaryStructure {
  id: string;
  name: string;
  description?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  status: 'ACTIVE' | 'INACTIVE';
  components: SalaryStructureComponent[];
}

export interface EmployeeSalaryComponent {
  componentId: string;
  componentName: string;
  componentType: 'EARNING' | 'DEDUCTION';
  amount: number;
}

export interface EmployeeSalary {
  id: string;
  userId: string;
  userName?: string;
  structureId: string;
  structureName: string;
  ctc: number;
  effectiveFrom: string;
  effectiveTo?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  components: EmployeeSalaryComponent[];
}

export interface ComponentBreakdown {
  name: string;
  amount: number;
}

export interface SalarySlip {
  id: string;
  userId: string;
  userName?: string;
  month: number;
  year: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  paidDays?: number;
  lopDays?: number;
  status: 'DRAFT' | 'GENERATED' | 'PAID' | 'CANCELLED';
  generatedDate?: string;
  paidDate?: string;
  filePath?: string;
  earnings: ComponentBreakdown[];
  deductions: ComponentBreakdown[];
}

export interface BankDetails {
  id: string;
  userId: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName?: string;
  accountHolderName: string;
  accountType?: string;
  isPrimary: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface CreateStructureRequest {
  name: string;
  description?: string;
  effectiveFrom: string;
  components: {
    componentId: string;
    percentage?: number;
    fixedAmount?: number;
  }[];
}

export interface AssignSalaryRequest {
  userId: string;
  structureId: string;
  ctc: number;
  effectiveFrom: string;
}

export interface GenerateSlipRequest {
  userId: string;
  month: number;
  year: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// ==================== API Methods ====================

const salaryApi = {
  // Salary Structures
  getAllStructures: (): Promise<AxiosResponse<{ data: SalaryStructure[] }>> => {
    return api.get('/salary/structures');
  },

  getStructureById: (id: string): Promise<AxiosResponse<{ data: SalaryStructure }>> => {
    return api.get(`/salary/structures/${id}`);
  },

  createStructure: (
    data: CreateStructureRequest
  ): Promise<AxiosResponse<{ data: SalaryStructure }>> => {
    return api.post('/salary/structures', data);
  },

  // Employee Salaries
  getMySalary: (): Promise<AxiosResponse<{ data: EmployeeSalary }>> => {
    return api.get('/salary/my-salary');
  },

  assignSalary: (
    data: AssignSalaryRequest
  ): Promise<AxiosResponse<{ data: EmployeeSalary }>> => {
    return api.post('/salary/assign', data);
  },

  // Salary Slips
  getMySalarySlips: (): Promise<AxiosResponse<{ data: SalarySlip[] }>> => {
    return api.get('/salary/slips');
  },

  getMySalarySlipsPaginated: (
    page: number = 0,
    size: number = 10
  ): Promise<AxiosResponse<{ data: PaginatedResponse<SalarySlip> }>> => {
    return api.get('/salary/slips/paginated', {
      params: { page, size },
    });
  },

  getSalarySlipById: (id: string): Promise<AxiosResponse<{ data: SalarySlip }>> => {
    return api.get(`/salary/slips/${id}`);
  },

  generateSalarySlip: (
    userId: string,
    month: number,
    year: number
  ): Promise<AxiosResponse<{ data: SalarySlip }>> => {
    return api.post('/salary/slips/generate', null, {
      params: { userId, month, year },
    });
  },

  markSlipAsPaid: (
    id: string,
    paidDate?: string
  ): Promise<AxiosResponse<{ data: SalarySlip }>> => {
    return api.post(`/salary/slips/${id}/mark-paid`, null, {
      params: { paidDate },
    });
  },

  downloadSalarySlip: (id: string): Promise<AxiosResponse<Blob>> => {
    return api.get(`/salary/slips/${id}/download`, {
      responseType: 'blob',
    });
  },

  // Bank Details
  getMyBankDetails: (): Promise<AxiosResponse<{ data: BankDetails }>> => {
    return api.get('/salary/bank-details');
  },

  saveBankDetails: (data: Partial<BankDetails>): Promise<AxiosResponse<{ data: BankDetails }>> => {
    return api.post('/salary/bank-details', data);
  },
};

export default salaryApi;
