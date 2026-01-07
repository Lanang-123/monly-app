import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { transactionService } from "@/services/transactionService";
import { Category, Wallet } from "@/types";

interface MasterDataState {
  categories: Category[];
  wallets: Wallet[];
  isLoading: boolean;
  
  fetchMasterData: () => Promise<void>;
}

export const useMasterDataStore = create<MasterDataState>()(
  persist(
    (set, get) => ({
      categories: [],
      wallets: [],
      isLoading: false,

      fetchMasterData: async () => {
        const { categories } = get();
        if (categories.length === 0) {
            set({ isLoading: true });
        }

        try {
          const [categoriesData, walletsData] = await Promise.all([
            transactionService.getCategories(),
            transactionService.getWallets()
          ]);

          set({
            categories: categoriesData,
            wallets: walletsData,
            isLoading: false,
          });

        } catch (error) {
          console.error("Gagal fetch master data:", error);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "monly-master-data",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        categories: state.categories, 
        wallets: state.wallets 
      }),
    }
  )
);