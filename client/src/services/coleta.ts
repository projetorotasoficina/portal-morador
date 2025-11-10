import { getToken } from './auth';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://rotas-api-yqsi.onrender.com';

export interface DiaColeta {
  dia: string;
  periodo: string;
  tipos: string[];
}

export interface AgendaColeta {
  endereco: string;
  diasColeta: DiaColeta[];
}

export interface HistoricoItem {
  data: string;
  hora: string;
  tipo: string;
}

export interface HistoricoColeta {
  historico: HistoricoItem[];
}

// Consultar agenda de coleta por coordenadas
export async function consultarAgendaColeta(latitude: number, longitude: number): Promise<AgendaColeta> {
  const token = getToken();
  
  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  const response = await fetch(
    `${BACKEND_URL}/api/consulta/agenda-coleta/coordenadas?latitude=${latitude}&longitude=${longitude}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Sessão expirada');
    }
    if (response.status === 404) {
      throw new Error('Nenhuma rota de coleta encontrada para este endereço');
    }
    throw new Error('Erro ao consultar agenda de coleta');
  }

  return response.json();
}

// Consultar histórico de coleta por coordenadas
export async function consultarHistoricoColeta(latitude: number, longitude: number): Promise<HistoricoColeta> {
  const token = getToken();
  
  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  const response = await fetch(
    `${BACKEND_URL}/api/consulta/historico-coleta/coordenadas?latitude=${latitude}&longitude=${longitude}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Sessão expirada');
    }
    if (response.status === 404) {
      return { historico: [] }; // Retorna vazio se não houver histórico
    }
    throw new Error('Erro ao consultar histórico de coleta');
  }

  return response.json();
}
