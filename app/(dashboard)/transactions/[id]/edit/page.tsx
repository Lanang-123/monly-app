"use client";

import { useEffect, useState } from "react";
import { transactionService } from "@/services/transactionService";
import TransactionForm from "@/components/forms/TransactionForm";
import { Transaction } from "@/types";
import { Loader2 } from "lucide-react";

export default function EditTransactionPage({ params }: { params: Promise<{ id: string }> }) {

  
  const [, setId] = useState<string>("");
  const [data, setData] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => {
      setId(p.id);
      return transactionService.getById(p.id);
    })
    .then((tx) => setData(tx))
    .catch((err) => console.error("Gagal load detail", err))
    .finally(() => setLoading(false));
  }, [params]);

  if (loading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin"/></div>;
  }

  if (!data) return <div>Data tidak ditemukan</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <TransactionForm initialData={data} isEdit />
    </div>
  );
}