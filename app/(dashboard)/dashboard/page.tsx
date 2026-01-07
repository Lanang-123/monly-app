"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"; 

import { useMasterDataStore } from "@/store/useMasterDataStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { formatRupiah } from "@/lib/utils";

export default function DashboardPage() {
  const { transactions, fetchTransactions, isLoading: txLoading } = useTransactionStore();
  const { categories, fetchMasterData, isLoading: masterLoading } = useMasterDataStore();
  const loading = txLoading || masterLoading;

  useEffect(() => {
    fetchMasterData();
    fetchTransactions();
  }, [fetchMasterData, fetchTransactions]); 

  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;

    if (transactions.length === 0 || categories.length === 0) {
      return { income: 0, expense: 0, total: 0 };
    }

    transactions.forEach((tx) => {
      const cat = categories.find((c) => String(c.id) === String(tx.category_id));
      const amount = Number(tx.total);

      if (cat?.category_type === 'in') {
        income += amount;
      } else if (cat?.category_type === 'out') {
        expense += amount;
      }
    });

    return {
      income,
      expense,
      total: transactions.length
    };
  }, [transactions, categories]);

  if (loading && transactions.length === 0) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="space-y-2">
           <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse" />
           <div className="h-4 w-96 bg-gray-100 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-44 flex flex-col justify-between animate-pulse">
               <div className="flex gap-4">
                 <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                 <div className="h-4 w-32 bg-gray-200 rounded mt-2" />
               </div>
               <div className="h-10 w-48 bg-gray-200 rounded" />
               <div className="h-3 w-24 bg-gray-100 rounded" />
            </div>
          ))}
        </div>

        {/* Footer Widgets Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="h-56 bg-gray-200 rounded-2xl animate-pulse" />
           <div className="h-56 bg-gray-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Keuangan</h1>
        <p className="text-gray-500 mt-1">Ringkasan aktivitas keuangan Anda.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={80} className="text-emerald-600" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <span className="text-sm font-semibold text-gray-500">Total Pemasukan</span>
          </div>
          <h3 className="text-3xl font-bold text-emerald-600">
            <AnimatedCounter value={summary.income} />
          </h3>
          <div className="flex items-center gap-1 text-sm text-emerald-600 mt-2 font-medium">
            <ArrowUpRight size={16} />
            <span>Cash In</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingDown size={80} className="text-red-600" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <TrendingDown size={24} />
            </div>
            <span className="text-sm font-semibold text-gray-500">Total Pengeluaran</span>
          </div>
          <h3 className="text-3xl font-bold text-red-600">
            <AnimatedCounter value={summary.expense} />
          </h3>
          <div className="flex items-center gap-1 text-sm text-red-600 mt-2 font-medium">
            <ArrowDownRight size={16} />
            <span>Cash Out</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-linear-to-br from-slate-800 to-blue-900 p-8 rounded-2xl text-white shadow-lg border border-blue-800/30">
          <h3 className="text-lg font-semibold mb-2 text-blue-100">Total Transaksi Tercatat</h3>
          <div className="text-5xl font-bold mb-4 tracking-tight text-white">
            <AnimatedCounter value={summary.total} isCurrency={false} />
          </div>
          <p className="text-blue-200/80 text-sm leading-relaxed">
            Data ini dihitung berdasarkan seluruh riwayat transaksi yang tersimpan di server Monly.
          </p>
        </div>
        <div className="bg-blue-600 p-8 rounded-2xl text-white shadow-lg flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-500"></div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Quick Action</h3>
            <p className="text-blue-50 text-sm mb-6">
              Catat transaksi baru sekarang untuk memperbarui laporan keuangan Anda.
            </p>
          </div>
          <Link href="/transactions/create" className="bg-white text-blue-600 px-4 py-3 rounded-xl font-bold text-center hover:bg-blue-50 hover:scale-[1.02] transition-all cursor-pointer z-10 shadow-lg border border-blue-100">
            + Tambah Transaksi
          </Link>
        </div>
      </div>
    </div>
  );
}


function AnimatedCounter({ value, isCurrency = true }: { value: number, isCurrency?: boolean }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    const duration = 2000; 
    const startValue = 0;
    const endValue = value;

    const easeOutExpo = (x: number): number => {
      return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    };

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const current = startValue + (endValue - startValue) * easeOutExpo(progress);
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
      }
    };

    window.requestAnimationFrame(step);
  }, [value]);

  return (
    <>
      {isCurrency 
        ? formatRupiah(displayValue) 
        : Math.floor(displayValue) 
      }
    </>
  );
}