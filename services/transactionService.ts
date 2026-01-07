import api from '@/lib/axios';
import { Transaction, Category, Wallet } from '@/types';

interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: boolean;
}

export const transactionService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<Transaction[]>>('/transactions');
    return response.data.data; 
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Transaction>>(`/transactions/${id}`);
    return response.data.data;
  },

  create: async (payload: FormData) => {
    const response = await api.post('/transactions', payload);
    return response.data;
  },

  update: async (id: string, payload: FormData) => {
    console.log(id);
  
    const response = await api.put(`/transactions/${id}`, payload);
    return response.data;
  },


  delete: async (id: string) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const [resIn, resOut] = await Promise.all([
      api.get<ApiResponse<Category[]>>('/tx-categories?type=in'),
      api.get<ApiResponse<Category[]>>('/tx-categories?type=out')
    ]);
    return [...resIn.data.data, ...resOut.data.data];
  },

  getWallets: async () => {
    const response = await api.get<ApiResponse<Wallet[]>>('/wallets?type=all');
    return response.data.data;
  },
};