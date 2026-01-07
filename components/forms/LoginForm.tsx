"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { LogIn, AlertCircle, Eye, EyeOff } from "lucide-react";
import { setCookie } from "cookies-next";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authService, LoginErrorType } from "@/services/authService";
import { useAuthStore } from "@/store/useAuthStore";

const ERROR_MESSAGES: Record<LoginErrorType, string> = {
  AUTH_FAILED: "Email atau password salah. Silakan coba lagi.",
  SERVER_ERROR: "Gagal terhubung ke server. Periksa koneksi internet.",
};

const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginValues) => {
    setLoading(true);
    setErrorMessage(null);

    const result = await authService.login(values.email, values.password);

    if (!result.success) {
      setErrorMessage("Email atau password salah.");
      setLoading(false);
      return;
    }

    const token = result.data.data?.token || result.data.token;
    const user = result.data.data?.user || result.data.user;
   

    if (!token) {
       console.error("Token hilang:", result);
       setErrorMessage("Gagal mendapatkan token dari server.");
       setLoading(false);
       return;
    }

    setCookie("token", token, { maxAge: 60 * 60 * 24 }); 
    setAuth(token, user);
    
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Selamat Datang</h1>
            <p className="text-sm text-gray-500">
              Silakan login untuk mengakses dashboard Monly
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-900">Login Gagal</h3>
                <p className="text-sm text-red-700 mt-1 leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="nama@email.com"
              error={errors.email?.message}
              {...register("email")}
              onChange={(e) => {
                register("email").onChange(e); 
                setErrorMessage(null);
              }} 
            />

            <div className="space-y-1 relative">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••"
                  className={`w-full px-4 py-2.5 rounded-lg border bg-white text-sm outline-none transition-all focus:ring-4 focus:ring-blue-500/10 ${
                    errors.password ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"
                  }`}
                  {...register("password")}
                  onChange={(e) => {
                    register("password").onChange(e);
                    setErrorMessage(null);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full py-2.5 text-base font-semibold shadow-lg shadow-blue-200 mt-2" 
              isLoading={loading}
            >
              {loading ? (
                "Memproses..."
              ) : (
                <>
                  <LogIn size={18} className="mr-2" /> Masuk
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Monly AI Frontend Test
        </p>
      </div>
    </div>
  );
}