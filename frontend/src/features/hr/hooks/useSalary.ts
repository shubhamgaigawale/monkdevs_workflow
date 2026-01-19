import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import salaryApi from '../api/salaryApi';
import type {
  CreateStructureRequest,
  AssignSalaryRequest,
  BankDetails,
} from '../api/salaryApi';
import { toast } from 'sonner';

// Query Keys
export const salaryKeys = {
  all: ['salary'] as const,
  structures: () => [...salaryKeys.all, 'structures'] as const,
  structure: (id: string) => [...salaryKeys.structures(), id] as const,
  mySalary: () => [...salaryKeys.all, 'my-salary'] as const,
  slips: () => [...salaryKeys.all, 'slips'] as const,
  slipsPaginated: (page: number, size: number) =>
    [...salaryKeys.slips(), 'paginated', page, size] as const,
  slip: (id: string) => [...salaryKeys.slips(), id] as const,
  bankDetails: () => [...salaryKeys.all, 'bank-details'] as const,
};

// ==================== Salary Structures ====================

export const useAllStructures = () => {
  return useQuery({
    queryKey: salaryKeys.structures(),
    queryFn: async () => {
      const response = await salaryApi.getAllStructures();
      return response.data.data;
    },
  });
};

export const useStructure = (id: string) => {
  return useQuery({
    queryKey: salaryKeys.structure(id),
    queryFn: async () => {
      const response = await salaryApi.getStructureById(id);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateStructure = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStructureRequest) => salaryApi.createStructure(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salaryKeys.structures() });
      toast.success('Salary structure created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create salary structure');
    },
  });
};

// ==================== Employee Salaries ====================

export const useMySalary = () => {
  return useQuery({
    queryKey: salaryKeys.mySalary(),
    queryFn: async () => {
      const response = await salaryApi.getMySalary();
      return response.data.data;
    },
  });
};

export const useAssignSalary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignSalaryRequest) => salaryApi.assignSalary(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salaryKeys.mySalary() });
      toast.success('Salary assigned successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign salary');
    },
  });
};

// ==================== Salary Slips ====================

export const useMySalarySlips = () => {
  return useQuery({
    queryKey: salaryKeys.slips(),
    queryFn: async () => {
      const response = await salaryApi.getMySalarySlips();
      return response.data.data;
    },
  });
};

export const useMySalarySlipsPaginated = (page: number = 0, size: number = 10) => {
  return useQuery({
    queryKey: salaryKeys.slipsPaginated(page, size),
    queryFn: async () => {
      const response = await salaryApi.getMySalarySlipsPaginated(page, size);
      return response.data.data;
    },
  });
};

export const useSalarySlip = (id: string) => {
  return useQuery({
    queryKey: salaryKeys.slip(id),
    queryFn: async () => {
      const response = await salaryApi.getSalarySlipById(id);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useGenerateSalarySlip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, month, year }: { userId: string; month: number; year: number }) =>
      salaryApi.generateSalarySlip(userId, month, year),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salaryKeys.slips() });
      toast.success('Salary slip generated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate salary slip');
    },
  });
};

export const useMarkSlipAsPaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, paidDate }: { id: string; paidDate?: string }) =>
      salaryApi.markSlipAsPaid(id, paidDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salaryKeys.slips() });
      toast.success('Salary slip marked as paid');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to mark slip as paid');
    },
  });
};

export const useDownloadSalarySlip = () => {
  return useMutation({
    mutationFn: (id: string) => salaryApi.downloadSalarySlip(id),
    onSuccess: (response, id) => {
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `salary-slip-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Salary slip downloaded');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to download salary slip');
    },
  });
};

// ==================== Bank Details ====================

export const useMyBankDetails = () => {
  return useQuery({
    queryKey: salaryKeys.bankDetails(),
    queryFn: async () => {
      const response = await salaryApi.getMyBankDetails();
      return response.data.data;
    },
  });
};

export const useSaveBankDetails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<BankDetails>) => salaryApi.saveBankDetails(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salaryKeys.bankDetails() });
      toast.success('Bank details saved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save bank details');
    },
  });
};
