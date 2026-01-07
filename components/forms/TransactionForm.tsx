"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, AlertCircle, XCircle, Image as ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useMasterDataStore } from "@/store/useMasterDataStore";
import { useTransactionStore } from "@/store/useTransactionStore"; 
import { transactionService } from "@/services/transactionService";
import { Transaction } from "@/types";

const MAX_FILE_SIZE = 5 * 1024 * 1024; 

const transactionSchema = z.object({
  date_transaction: z.string().min(1, "Tanggal wajib diisi"),
  wallet_id: z.string().min(1, "Harap pilih salah satu wallet"),
  category_id: z.string().min(1, "Harap pilih salah satu kategori"),
  total: z.string().min(1, "Nominal transaksi wajib diisi"),
  description: z.string().min(1, "Deskripsi transaksi wajib diisi"),
});

type FormValues = z.infer<typeof transactionSchema>;

interface Props {
  initialData?: Transaction;
  isEdit?: boolean;
}

export default function TransactionForm({ initialData, isEdit }: Props) {
  const router = useRouter();
  
  const { addTransaction, updateTransaction} = useTransactionStore();
  const { categories, wallets, fetchMasterData } = useMasterDataStore();
  
  const getInitialDate = () => {
    if (!initialData?.date_transaction) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return initialData.date_transaction.substring(0, 10);
  };

  const getInitialImage = () => {
    if (!initialData?.image) return null;
    if (initialData.image.startsWith("http")) return initialData.image;
    return `https://api.monlyai.com/${initialData.image}`; 
  };

  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(getInitialImage());
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date_transaction: getInitialDate(),
      wallet_id: initialData?.wallet_id ? String(initialData.wallet_id) : "",
      category_id: initialData?.category_id ? String(initialData.category_id) : "",
      total: initialData?.total ? String(initialData.total) : "",
      description: initialData?.description || "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError(null);

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setImageError("Ukuran gambar terlalu besar (Maksimal 5MB).");
        setImageFile(null);
        return; 
      }
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.preventDefault(); 
    setImageFile(null);
    setPreview(null);
    setImageError(null);
  };

  const onSubmit = async (values: FormValues) => {
    if (imageError) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("date_transaction", values.date_transaction);
      formData.append("wallet_id", values.wallet_id);
      formData.append("category_id", values.category_id);
      formData.append("total", values.total);
      formData.append("description", values.description);

      if (!isEdit) {
         formData.append("is_transfer", "false"); 
      }

      if (imageFile) {
        formData.append("image", imageFile);
      } else {
        console.log('No image attached');
      }

      if (isEdit && initialData) {
        const idToUpdate = String(initialData.id);
        await transactionService.update(idToUpdate, formData);
        const freshData = await transactionService.getById(idToUpdate);
        updateTransaction(idToUpdate, freshData);
      } else {
        const response: any = await transactionService.create(formData);
        const newId = response.data?.id || response.id || response.transaction_id;

        if (newId) {
            const freshData = await transactionService.getById(String(newId));
            addTransaction(freshData);
        } else {
            console.warn("Tidak ditemukan data ID");
        }
      }

      // Navigate & refresh
      router.push("/transactions");
      router.refresh(); 

    } catch (error: any) {
      console.error("Submit error:", error);
      
      const serverMessage = 
        error.response?.data?.message || 
        JSON.stringify(error.response?.data) || 
        error.message ||
        "Terjadi kesalahan saat menyimpan.";
      
      alert(`Gagal Menyimpan: ${serverMessage}`);
      
    } finally {
      setLoading(false);
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="flex justify-center">
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              {isEdit ? "Perbarui Transaksi" : "Catat Transaksi Baru"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Lengkapi detail keuangan di bawah ini.</p>
          </div>
          <Button type="button" variant="ghost" onClick={() => router.back()} className="text-gray-500 hover:text-gray-900">
            <ArrowLeft size={18} className="mr-2"/> Kembali
          </Button>
        </div>

        {hasErrors && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
            <AlertCircle className="text-red-600 mt-0.5" size={20} />
            <div>
              <h3 className="text-sm font-semibold text-red-900">Perhatian</h3>
              <ul className="list-disc list-inside text-sm text-red-700 mt-1">
                {Object.values(errors).map((error: any, index) => (
                  <li key={index}>{error.message}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <Input
                  label="Tanggal"
                  type="date"
                  className="transition-all focus:ring-4 focus:ring-blue-500/10"
                  error={errors.date_transaction?.message}
                  {...register("date_transaction")}
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Input
                  label="Nominal (Rp)"
                  type="number"
                  placeholder="Contoh: 50000"
                  className="transition-all focus:ring-4 focus:ring-blue-500/10 font-medium"
                  error={errors.total?.message}
                  {...register("total")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1 space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Wallet</label>
                <div className="relative">
                  <select
                    {...register("wallet_id")}
                    className={`w-full appearance-none border rounded-xl px-4 py-2.5 text-sm bg-gray-50 hover:bg-white transition-all focus:ring-4 focus:ring-blue-500/10 outline-none cursor-pointer ${
                      errors.wallet_id ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-blue-500"
                    }`}
                  >
                    <option value="">Pilih Wallet</option>
                    {wallets
                      .filter((w, index, self) => index === self.findIndex((t) => t.wallet_name === w.wallet_name))
                      .map((w) => (
                        <option key={w.id} value={w.id}>{w.wallet_name}</option>
                      ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-3 text-gray-400">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                  </div>
                </div>
                {errors.wallet_id && <p className="text-red-500 text-xs">{errors.wallet_id.message}</p>}
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Kategori</label>
                <div className="relative">
                  <select
                    {...register("category_id")}
                    className={`w-full appearance-none border rounded-xl px-4 py-2.5 text-sm bg-gray-50 hover:bg-white transition-all focus:ring-4 focus:ring-blue-500/10 outline-none cursor-pointer ${
                      errors.category_id ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-blue-500"
                    }`}
                  >
                    <option value="">Pilih Kategori</option>
                    {categories
                      .filter((c, index, self) => index === self.findIndex((t) => t.category_name === c.category_name))
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.category_name}
                        </option>
                      ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-3 text-gray-400">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                  </div>
                </div>
                {errors.category_id && <p className="text-red-500 text-xs">{errors.category_id.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Keterangan</label>
              <textarea
                rows={4}
                {...register("description")}
                className={`w-full border rounded-xl p-4 text-sm bg-gray-50 hover:bg-white transition-all focus:ring-4 focus:ring-blue-500/10 outline-none resize-none ${
                  errors.description ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-blue-500"
                }`}
                placeholder="Contoh: Beli Makan Siang..."
              />
              {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 flex justify-between">
                Bukti / Struk
                {preview && (
                  <button onClick={handleRemoveImage} className="text-xs text-red-500 hover:underline">Hapus Gambar</button>
                )}
              </label>

              <div className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 overflow-hidden group h-64 flex flex-col items-center justify-center text-center
                ${imageError 
                  ? "border-red-300 bg-red-50" 
                  : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
                }
              `}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                
                {preview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover z-10" />
                    <div className="absolute inset-0 bg-black/40 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
                      Klik untuk ganti
                    </div>
                  </>
                ) : (
                  <div className="p-6 pointer-events-none">
                    <div className={`mx-auto rounded-full p-3 mb-3 w-14 h-14 flex items-center justify-center transition-colors
                      ${imageError ? "bg-red-100 text-red-500" : "bg-blue-50 text-blue-500 group-hover:bg-blue-100"}
                    `}>
                      {imageError ? <XCircle size={24}/> : <ImageIcon size={24} />}
                    </div>
                    <p className={`text-sm font-medium ${imageError ? 'text-red-600' : 'text-gray-700'}`}>
                      {imageError ? "Gagal Upload" : "Upload Gambar"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {imageError ? "Ukuran file melebihi 5MB" : "Klik atau seret gambar kesini (Max 5MB)"}
                    </p>
                  </div>
                )}
              </div>
              
              {imageError && (
                <div className="flex items-center gap-2 text-red-600 text-xs mt-2 animate-in slide-in-from-top-1">
                  <AlertCircle size={14} />
                  <span>{imageError}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-gray-100 flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => router.back()} className="text-gray-600">
            Batal
          </Button>
          
          <Button 
            type="submit" 
            isLoading={loading} 
            className="px-8 shadow-lg shadow-blue-200 hover:cursor-pointer"
            disabled={loading || !!imageError} 
          >
            <Save size={18} className="mr-2" />
            {isEdit ? "Simpan Perubahan" : "Simpan Transaksi"}
          </Button>
        </div>

      </form>
    </div>
  );
}