import api from "@/lib/axios"; 

export type LoginErrorType = "AUTH_FAILED" | "SERVER_ERROR";

type LoginSuccess = {
  success: true;
  data: any;
};

type LoginFailure = {
  success: false;
  type: LoginErrorType;
};



export type LoginResult = LoginSuccess | LoginFailure;

export const authService = {
  login: async (email: string, password: string): Promise<LoginResult> => {
    try {
      const response = await api.post("/auth/login", { 
        email,
        password,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Login Error Details:", error.response?.data);

      if (!error.response) {
        return { success: false, type: "SERVER_ERROR" };
      }

      const status = error.response.status;
      // 404 = Alamat Salah, 401 = Password Salah
      if (status === 500 || (status >= 400 && status < 500)) {
        return { success: false, type: "AUTH_FAILED" };
      }

      return { success: false, type: "SERVER_ERROR" };
    }
  },
};