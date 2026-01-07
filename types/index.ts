export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Category {
  id: number;
  category_name: string; 
  category_type: 'in' | 'out'; 
  category_index?: string;
  icon?: any;
}

export interface Wallet {
  id: number;
  wallet_name: string; 
  total: number;
  wallet_index?: string;
  icon?: any;
}

export interface Transaction {
  id: string; 
  date_transaction: string;
  total: number | string;
  description: string;
  category_id: number | string;
  wallet_id: number | string;
  image?: string;
}