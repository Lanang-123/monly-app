import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { transactionService } from "@/services/transactionService";
import { Transaction } from "@/types";

interface TransactionStoreState {
  transactions: Transaction[];
  isLoading: boolean;   
  isRefetching: boolean; 
  
  fetchTransactions: () => Promise<void>;
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (id: string, tx: Transaction) => void;
  removeTransaction: (id: string) => void;
  reset: () => void;
}

const sortTransactionsByDate = (transactions: Transaction[]): Transaction[] => {
  return [...transactions].sort((a, b) => {
    const dateA = new Date(a.date_transaction).getTime();
    const dateB = new Date(b.date_transaction).getTime();
    if (dateA !== dateB) return dateB - dateA; 
    return Number(b.id) - Number(a.id);
  });
};

export const useTransactionStore = create<TransactionStoreState>()(
  persist(
    (set, get) => ({
      transactions: [],
      isLoading: true, 
      isRefetching: false,

      fetchTransactions: async () => {
        const { transactions } = get();
        
        if (transactions.length === 0) {
          set({ isLoading: true });
        } else {
          set({ isRefetching: true });
        }

        try {
          const allData = await transactionService.getAll();
          const sortedData = sortTransactionsByDate(allData);

          set({
            transactions: sortedData,
            isLoading: false,
            isRefetching: false
          });

        } catch (error) {
          console.error("Gagal fetch transactions:", error);
          set({ isLoading: false, isRefetching: false });
        }
      },

      addTransaction: (tx) =>
        set((state) => ({
          transactions: sortTransactionsByDate([tx, ...state.transactions]),
        })),

      updateTransaction: (id, updatedTx) =>
        set((state) => ({
          transactions: sortTransactionsByDate(
            state.transactions.map((tx) => (String(tx.id) === String(id) ? updatedTx : tx))
          ),
        })),

      removeTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((tx) => String(tx.id) !== String(id)),
        })),

      reset: () => set({ transactions: [], isLoading: false, isRefetching: false }),
    }),
    {
      name: "monly-transaction-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ transactions: state.transactions }),
    }
  )
);