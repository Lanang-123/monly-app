"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard,X,Banknote} from "lucide-react"; 
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore"; 

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar } = useUIStore(); 

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/transactions", label: "Transaksi", icon: Banknote },
  ];

  return (
    <>
      {isSidebarOpen && (
        <div 
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
        />
      )}
      <aside 
        data-open={isSidebarOpen}
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 text-slate-600 flex flex-col shadow-xl transition-transform duration-300 ease-in-out transform",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
            Monly App
          </h1>
          <button onClick={closeSidebar} className="md:hidden text-gray-400 hover:text-red-500">
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar} 
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                  isActive 
                    ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100" 
                    : "text-slate-500 hover:bg-gray-50 hover:text-slate-900"
                )}
              >
                <item.icon size={20} className={isActive ? "text-blue-600" : "text-slate-400"} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-6 text-xs text-gray-300 text-center border-t border-gray-50">
          v1.0.0
        </div>
      </aside>
    </>
  );
}