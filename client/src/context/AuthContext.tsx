import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { api } from "../lib/api";

/* ── Types ───────────────────────────────────────────── */
export type UserRole =
  | "participant"
  | "volunteer"
  | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  university?: "apex_university" | "other";
  collegeName?: string;
  gender?: "male" | "female" | "other";
  bloodGroup?: string;
  address?: string;
  qrCode?: string;
  isVerified?: boolean;
  registeredEvents?: any[];
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  university: "apex_university" | "other";
  collegeName?: string;
  gender: string;
  bloodGroup: string;
  address: string;
  password: string;
  confirmPassword: string;
}

export interface VolunteerSignupData {
  secretCode: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  bloodGroup: string;
  password: string;
  confirmPassword: string;
}

export interface AdminSignupData {
  secretCode: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string, secretCode: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  volunteerSignup: (data: VolunteerSignupData) => Promise<void>;
  adminSignup: (data: AdminSignupData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

/* ── Context ─────────────────────────────────────────── */
const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
};

/* ── Provider ────────────────────────────────────────── */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("ta_token"),
  );
  const [loading, setLoading] = useState(true);

  /* Fetch the current user from /auth/me */
  const refreshUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api<{ success: boolean; data: User }>("/auth/me", {
        token,
      });
      setUser(res.data);
    } catch {
      localStorage.removeItem("ta_token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  /* ── Auth actions ───────────────────────────────────── */
  const login = async (email: string, password: string) => {
    const res = await api<{ data: { token: string; user: User } }>(
      "/auth/login",
      { method: "POST", body: { email, password } },
    );
    localStorage.setItem("ta_token", res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
  };

  const adminLogin = async (email: string, password: string, secretCode: string) => {
    const res = await api<{ data: { token: string; user: User } }>(
      "/admin/login",
      { method: "POST", body: { email, password, secretCode } },
    );
    localStorage.setItem("ta_token", res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
  };

  const register = async (data: RegisterData) => {
    const res = await api<{ data: { token: string; user: User } }>(
      "/auth/register",
      { method: "POST", body: data },
    );
    localStorage.setItem("ta_token", res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
  };

  const volunteerSignup = async (data: VolunteerSignupData) => {
    const res = await api<{ data: { token: string; user: User } }>(
      "/admin/signup/volunteer",
      { method: "POST", body: data },
    );
    localStorage.setItem("ta_token", res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
  };

  const adminSignup = async (data: AdminSignupData) => {
    const res = await api<{ data: { token: string; user: User } }>(
      "/admin/signup/admin",
      { method: "POST", body: data },
    );
    localStorage.setItem("ta_token", res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem("ta_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        adminLogin,
        register,
        volunteerSignup,
        adminSignup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
