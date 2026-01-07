import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="bg-white p-6 rounded-full shadow-sm mb-6 animate-in zoom-in duration-500">
        <FileQuestion size={64} className="text-blue-600" />
      </div>

      <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Halaman Tidak Ditemukan</h2>
      <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
        Maaf, halaman yang Anda cari sepertinya sudah dipindahkan atau tidak pernah ada.
      </p>

      <div className="flex gap-4">
        <Link 
          href="/dashboard"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-200"
        >
          <ArrowLeft size={18} />
          Kembali ke Laman Utama
        </Link>
      </div>
      
      <div className="mt-12 text-sm text-gray-400">
        &copy; 2026 Monly App
      </div>
    </div>
  );
}