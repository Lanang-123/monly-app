import { create } from "zustand";
import Cookies from "js-cookie";


interface User {
  id: number;
  name: string;
  email: string;
}


interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}


export const useAuthStore = create<AuthState>((set) => ({
  token: Cookies.get("token") || null, 
  user: null, 
  isAuthenticated: !!Cookies.get("token"),


  setAuth: (token, user) => {
    Cookies.set("token", token, { expires: 1 }); 
    
    set({ 
      token, 
      user, 
      isAuthenticated: true 
    });
  },

 
  logout: () => {
    Cookies.remove("token");
    set({ 
      token: null, 
      user: null, 
      isAuthenticated: false 
    });
  },
}));