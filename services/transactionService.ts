import api from '@/lib/axios';
import { Transaction, Category, Wallet } from '@/types';

interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: boolean;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const transactionService = {
  getAll: async () => {
    let allData: Transaction[] = [];
    let currentPage = 1;
    let lastPage = 1;

    do {
      const response = await api.get<ApiResponse<Transaction[]>>('/transactions', {
        params: {
          page: currentPage,      
          per_page: 10,           
          sort: 'desc',
          _t: new Date().getTime() 
        }
      });

      const { data, meta } = response.data;

      if (Array.isArray(data)) {
        allData = [...allData, ...data];
      }

      if (meta) {
        lastPage = meta.last_page;
      } else {
        lastPage = 1; 
      }

      currentPage++; 

    } while (currentPage <= lastPage);

    return allData;
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
    const response = await api.put(`/transactions/${id}`, payload);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const [resIn, resOut] = await Promise.all([
      api.get<ApiResponse<Category[]>>('/tx-categories', { params: { type: 'in' } }),
      api.get<ApiResponse<Category[]>>('/tx-categories', { params: { type: 'out' } })
    ]);
    return [...resIn.data.data, ...resOut.data.data];
  },

  getWallets: async () => {
    const response = await api.get<ApiResponse<Wallet[]>>('/wallets', { 
      params: { type: 'all' } 
    });
    return response.data.data;
  },
};