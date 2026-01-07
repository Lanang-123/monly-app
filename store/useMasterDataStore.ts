import { create } from 'zustand';
import { Category, Wallet } from '@/types';
import { transactionService } from '@/services/transactionService';

interface MasterDataState {
  categories: Category[];
  wallets: Wallet[];
  isLoaded: boolean; 
  isLoading: boolean;
  fetchMasterData: () => Promise<void>; 
  refreshData: () => Promise<void>;   
}

export const useMasterDataStore = create<MasterDataState>((set, get) => ({
  categories: [],
  wallets: [],
  isLoaded: false,
  isLoading: false, 

  fetchMasterData: async () => {
    if (get().isLoaded) return;
    set({ isLoading: true });

    try {
      const [categories, wallets] = await Promise.all([
        transactionService.getCategories(),
        transactionService.getWallets(),
      ]);
      
      set({ categories, wallets, isLoaded: true });
    } catch (error) {
      console.error("Gagal caching master data:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  refreshData: async () => {
    set({ isLoaded: false }); 
    await get().fetchMasterData(); 
  }
}));