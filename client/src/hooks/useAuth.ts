// src/hooks/useAuth.ts
import { useEffect, useState } from "react";
import { getToken, getUser, logout as doLogout, type Usuario } from "@/services/auth";

export function useAuth() {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = getToken();
      if (token) {
        setUser(getUser());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = () => {
    doLogout();
    setUser(null);
  };

  const updateUser = (u: Usuario) => {
    setUser(u);
    localStorage.setItem("auth_user", JSON.stringify(u));
  };

  return {
    user,
    loading,
    isAuthenticated: !!getToken(),
    logout,
    updateUser,
  };
}