import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { transactionService } from "@/services/transactionService";
import { Transaction } from "@/types";

interface TransactionStoreState {
  transactions: Transaction[];
  isLoading: boolean;
  isInitialized: boolean;
  lastFetchedAt: number | null;
  CACHE_TTL: number;

  fetchTransactions: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (id: string, tx: Transaction) => void;
  removeTransaction: (id: string) => void;
  optimisticRemove: (id: string) => Transaction | null;
  rollbackRemove: (tx: Transaction) => void;
  clearCache: () => void;
}


const sortTransactionsByDate = (transactions: Transaction[]): Transaction[] => {
  return [...transactions].sort((a, b) => {
    const dateA = new Date(a.date_transaction).getTime();
    const dateB = new Date(b.date_transaction).getTime();
    return dateB - dateA; 
  });
};

export const useTransactionStore = create<TransactionStoreState>()(
  persist(
    (set, get) => ({
      transactions: [],
      isLoading: false,
      isInitialized: false,
      lastFetchedAt: null,
      CACHE_TTL: 5 * 60 * 1000,

      fetchTransactions: async () => {
        const { isInitialized, lastFetchedAt, CACHE_TTL } = get();
        const now = Date.now();

        if (isInitialized && lastFetchedAt) {
          const isExpired = now - lastFetchedAt > CACHE_TTL;
          if (!isExpired) {
            return;
          }
        }

        set({ isLoading: true });

        try {
          const data = await transactionService.getAll();
          const sortedData = sortTransactionsByDate(data);

          set({
            transactions: sortedData,
            isInitialized: true,
            lastFetchedAt: now,
            isLoading: false,
          });

        } catch (error) {
          console.error("Error fetch transactions:", error);
          set({ isLoading: false });
        }
      },

      forceRefresh: async () => {
        set({ isLoading: true });

        try {
          const data = await transactionService.getAll();
          const sortedData = sortTransactionsByDate(data);

          set({
            transactions: sortedData,
            isInitialized: true,
            lastFetchedAt: Date.now(),
            isLoading: false,
          });

        } catch (error) {
          console.error("Error :", error);
          set({ isLoading: false });
        }
      },

      addTransaction: (tx) =>
        set((state) => {
          const newTransactions = [tx, ...state.transactions];
          const sortedTransactions = sortTransactionsByDate(newTransactions);
          return {
            transactions: sortedTransactions,
            lastFetchedAt: Date.now(),
          };
        }),

      updateTransaction: (id, updatedTx) =>
        set((state) => {
          const updatedTransactions = state.transactions.map((tx) =>
            String(tx.id) === String(id) ? updatedTx : tx
          );
          const sortedTransactions = sortTransactionsByDate(updatedTransactions);
          return {
            transactions: sortedTransactions,
            lastFetchedAt: Date.now(),
          };
        }),

      removeTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter(
            (tx) => String(tx.id) !== String(id)
          ),
          lastFetchedAt: Date.now(),
        })),

      optimisticRemove: (id) => {
        const current = get().transactions;
        const found = current.find((tx) => String(tx.id) === String(id));

        if (!found) return null;

        set({
          transactions: current.filter(
            (tx) => String(tx.id) !== String(id)
          ),
        });

        return found;
      },

      rollbackRemove: (tx) => {
        set((state) => {
          const newTransactions = [tx, ...state.transactions];
          const sortedTransactions = sortTransactionsByDate(newTransactions);
          return {
            transactions: sortedTransactions,
          };
        });
      },

      clearCache: () => {
        set({
          transactions: [],
          isInitialized: false,
          lastFetchedAt: null,
        });
      },
    }),
    {
      name: "transaction-cache",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        transactions: state.transactions,
        lastFetchedAt: state.lastFetchedAt,
        isInitialized: state.isInitialized,
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error("Error", error);
          } else if (state) {
            if (typeof window !== "undefined") {
              const handleStorageChange = (event: StorageEvent) => {
                if (event.key === "transaction-cache") {
                  try {
                    const latest = JSON.parse(event.newValue || "{}");
                    
                    if (latest.state) {
                      const store = useTransactionStore;
                      if (store) {
                        const currentState = store.getState();
                        if (latest.state.lastFetchedAt && 
                            (!currentState.lastFetchedAt || 
                             latest.state.lastFetchedAt > currentState.lastFetchedAt)) {
                          store.setState({
                            transactions: latest.state.transactions || [],
                            isInitialized: latest.state.isInitialized || false,
                            lastFetchedAt: latest.state.lastFetchedAt || null,
                          });
                        }
                      }
                    }
                  } catch (e) {
                    console.error("Error ", e);
                  }
                }
              };

              window.addEventListener("storage", handleStorageChange);
              
              return () => {
                window.removeEventListener("storage", handleStorageChange);
              };
            }
          }
        };
      },
    }
  )
);