"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Terjadi Crash:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="bg-red-50 p-6 rounded-full mb-6">
        <AlertTriangle size={64} className="text-red-500" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">Terjadi Kesalahan Sistem</h2>
      <p className="text-gray-500 max-w-md mb-8">
        Sistem mengalami kendala saat memproses permintaan Anda. Silakan coba muat ulang.
      </p>

      <button
        onClick={reset}
        className="flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-all"
      >
        <RefreshCcw size={18} />
        Coba Lagi
      </button>
    </div>
  );
}