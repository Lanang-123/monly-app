"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  Calendar, 
  Wallet, 
  Tag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { transactionService } from "@/services/transactionService";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { useDisclosure } from "@/hooks/useDisclosure";
import { useMasterDataStore } from "@/store/useMasterDataStore";
import { useTransactionStore } from "@/store/useTransactionStore";

export default function TransactionPage() {
  const { 
    transactions, 
    fetchTransactions, 
    removeTransaction, 
    isLoading: txLoading,
  } = useTransactionStore();
  
  const { 
    categories, 
    wallets, 
    fetchMasterData, 
    isLoading: masterLoading 
  } = useMasterDataStore();
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  const { isOpen, open, close } = useDisclosure();

  const loading = txLoading || masterLoading;

  useEffect(() => {
    fetchMasterData();
    fetchTransactions();
  }, [fetchMasterData, fetchTransactions]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    open();
  };

  const confirmDelete = async () => {
    if (!selectedId) return;
    
    try {
      await transactionService.delete(selectedId);
      removeTransaction(selectedId);
      close();
      
    } catch (error: any) {
      console.error("❌ Delete error:", error);
      alert("Gagal menghapus data: " + (error.message || "Unknown error"));
    }
  };


  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      const rawDate = dateString.split('T')[0]; 
      const [year, month, day] = rawDate.split('-');
      const date = new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0);

      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric", 
        month: "long", 
        year: "numeric",
      }).format(date);
    } catch (e) { 
      return dateString; 
    }
  };

  const getCategoryName = (id: number | string) => {
    const found = categories.find((c) => String(c.id) === String(id));
    return found ? found.category_name : "Unknown"; 
  };

  const getWalletName = (id: number | string) => {
    const found = wallets.find((w) => String(w.id) === String(id));
    return found ? found.wallet_name : "Unknown";
  };

  const filteredData = [...transactions]
  .filter(tx =>
    tx.description.toLowerCase().includes(search.toLowerCase())
  )
  .sort((a, b) => {
    return new Date(b.date_transaction).getTime() - 
           new Date(a.date_transaction).getTime();
  });


  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  
  const getPageNumbers = () => {
    const pages = [];
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Daftar Transaksi</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola pemasukan dan pengeluaran Anda
          </p>
        </div>
        
        <div className="flex gap-2">
          <Link href="/transactions/create">
            <Button className="bg-blue-600 hover:bg-blue-700 hover:cursor-pointer text-white shadow-lg shadow-blue-600/20">
              <Plus size={18} className="mr-2" /> Tambah Transaksi
            </Button>
          </Link>
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-3.5 top-3 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Cari transaksi..." 
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Card className="overflow-hidden border border-gray-200 shadow-sm bg-white rounded-2xl flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 border-b border-gray-100">
              <tr>
                <th className="p-4 pl-6 font-semibold text-gray-600 whitespace-nowrap">Tanggal</th>
                <th className="p-4 font-semibold text-gray-600">Keterangan</th>
                <th className="p-4 font-semibold text-gray-600">Wallet</th>
                <th className="p-4 font-semibold text-gray-600">Kategori</th>
                <th className="p-4 font-semibold text-gray-600 text-right">Nominal</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && transactions.length === 0 ? (
                [...Array(5)].map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="p-4 pl-6"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-48 bg-gray-200 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                    <td className="p-4"><div className="h-6 w-28 bg-gray-200 rounded-full" /></td>
                    <td className="p-4 text-right"><div className="h-4 w-24 bg-gray-200 rounded ml-auto" /></td>
                    <td className="p-4"><div className="flex justify-center gap-2"><div className="h-8 w-8 bg-gray-200 rounded-lg" /></div></td>
                  </tr>
                ))
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                       <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                         <Tag size={24} />
                       </div>
                       <p>Tidak ada data ditemukan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((tx) => (
                  <tr key={tx.id} className="group hover:bg-blue-50/40 transition-colors">
                    <td className="p-4 pl-6 whitespace-nowrap text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        {formatDate(tx.date_transaction)}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-gray-900">{tx.description}</td>
                    <td className="p-4 text-gray-500">
                       <div className="flex items-center gap-1.5">
                          <Wallet size={14} className="text-gray-300" />
                          {getWalletName(tx.wallet_id)}
                       </div>
                    </td>
                    <td className="p-4">
                       <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {getCategoryName(tx.category_id)}
                       </span>
                    </td>
                    <td className="p-4 text-right font-bold text-gray-800">
                       {formatRupiah(Number(tx.total))}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/transactions/${tx.id}/edit`}>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors hover:cursor-pointer">
                             <Pencil size={14} />
                          </Button>
                        </Link>
                        <Button 
                           variant="danger" 
                           size="sm" 
                           className="h-8 w-8 p-0 bg-white text-red-400 border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors hover:cursor-pointer" 
                           onClick={() => handleDeleteClick(tx.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filteredData.length > 0 && (
          <div className="border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Selanjutnya
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Menampilkan <span className="font-bold text-gray-900">{startIndex + 1}</span> sampai <span className="font-bold text-gray-900">{Math.min(startIndex + ITEMS_PER_PAGE, filteredData.length)}</span> dari <span className="font-bold text-gray-900">{filteredData.length}</span> data
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  {getPageNumbers().map((pageNum) => (
                     <button
                       key={pageNum}
                       onClick={() => setCurrentPage(pageNum)}
                       className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold 
                         ${currentPage === pageNum 
                           ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600' 
                           : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                         }`}
                     >
                       {pageNum}
                     </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </Card>
      <Modal isOpen={isOpen} onClose={close} title="Hapus Transaksi">
        <div className="pt-2">
          <p className="text-gray-600 mb-6">Yakin ingin menghapus? <br /><span className="text-xs text-red-500">*Data yang dihapus tidak bisa dikembalikan.</span></p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={close} className="hover:cursor-pointer">Batal</Button>
            <Button variant="danger" onClick={confirmDelete} className="hover:cursor-pointer">Ya, Hapus</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}