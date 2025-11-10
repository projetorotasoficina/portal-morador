// src/services/auth.ts
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://rotas-api-yqsi.onrender.com";
const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cep?: string;
  latitude?: number | null;
  longitude?: number | null;
  roles?: string[];
}

export interface CadastroMoradorData {
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
  endereco: string;
  numero: string;
  bairro: string;
  cep: string;
  latitude: string | number;
  longitude: string | number;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

// público
export async function cadastrarMorador(data: CadastroMoradorData): Promise<Usuario> {
  const cpf = data.cpf.replace(/\D/g, "");
  const cep = data.cep.replace(/\D/g, "");

  const r = await fetch(`${BACKEND_URL}/api/usuarios/morador`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      cpf,
      cep,
      latitude: typeof data.latitude === "string" ? parseFloat(data.latitude) : data.latitude,
      longitude: typeof data.longitude === "string" ? parseFloat(data.longitude) : data.longitude,
    }),
  });
  if (!r.ok) {
    const e = await r.json().catch(() => ({ message: "Erro ao cadastrar morador" }));
    throw new Error(e.message || "Erro ao cadastrar morador");
  }
  return r.json();
}

// público
export async function solicitarCodigo(email: string): Promise<void> {
  const r = await fetch(`${BACKEND_URL}/api/auth/solicitar-codigo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!r.ok) {
    const e = await r.json().catch(() => ({ message: "Erro ao solicitar código" }));
    throw new Error(e.message || "Erro ao solicitar código");
  }
}

// público
export async function loginComOTP(email: string, code: string): Promise<LoginResponse> {
  const r = await fetch(`${BACKEND_URL}/api/auth/login-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  if (!r.ok) {
    const e = await r.json().catch(() => ({ message: "Código inválido ou expirado" }));
    throw new Error(e.message || "Código inválido ou expirado");
  }
  const data: LoginResponse = await r.json();
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.usuario));
  return data;
}

// morador logado (novo endpoint do back)
export async function buscarMeuPerfil(): Promise<Usuario> {
  const token = getToken();
  if (!token) throw new Error("Usuário não autenticado");

  const r = await fetch(`${BACKEND_URL}/api/usuarios/meu-perfil/morador`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!r.ok) {
    if (r.status === 401) {
      logout();
      throw new Error("Sessão expirada");
    }
    throw new Error("Erro ao buscar perfil");
  }
  const usuario = await r.json();
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
  return usuario;
}

// ➕ Excluir conta do morador logado
export async function excluirConta(): Promise<void> {
  const token = getToken();
  if (!token) throw new Error('Usuário não autenticado');

  const res = await fetch(`${BACKEND_URL}/api/usuarios/meu-perfil`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!res.ok) {
    if (res.status === 401) {
      logout();
      throw new Error('Sessão expirada');
    }
    const error = await res.json().catch(() => ({ message: 'Erro ao excluir conta' }));
    throw new Error(error.message || 'Erro ao excluir conta');
  }

  // limpa sessão local
  logout();
}

// atualizar morador logado (NÃO usa /api/usuarios/{id})
export async function atualizarPerfil(data: Partial<CadastroMoradorData>): Promise<Usuario> {
  const token = getToken();
  if (!token) throw new Error("Usuário não autenticado");

  const r = await fetch(`${BACKEND_URL}/api/usuarios/meu-perfil`, {
    method: "PUT", // se seu back expôs PATCH, troque aqui
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...data,
      cep: typeof data.cep === "string" ? data.cep.replace(/\D/g, "") : data.cep,
      latitude:
        data.latitude != null
          ? typeof data.latitude === "string"
            ? parseFloat(data.latitude)
            : data.latitude
          : undefined,
      longitude:
        data.longitude != null
          ? typeof data.longitude === "string"
            ? parseFloat(data.longitude)
            : data.longitude
          : undefined,
    }),
  });

  if (!r.ok) {
    if (r.status === 401) {
      logout();
      throw new Error("Sessão expirada");
    }
    const e = await r.json().catch(() => ({ message: "Erro ao atualizar perfil" }));
    throw new Error(e.message || "Erro ao atualizar perfil");
  }

  const usuario = await r.json();
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
  return usuario;
}




// helpers
export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function getUser(): Usuario | null {
  const s = localStorage.getItem(USER_KEY);
  if (!s) return null;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
export function isAuthenticated(): boolean {
  return !!getToken();
}