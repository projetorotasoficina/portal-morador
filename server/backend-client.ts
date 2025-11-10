/**
 * Cliente HTTP para comunicação com o backend Java Spring Boot
 * Base URL: https://rotas-api-yqsi.onrender.com
 */

const BACKEND_URL = process.env.BACKEND_API_URL || 'https://rotas-api-yqsi.onrender.com';

export interface AgendaColetaResponse {
  diasColeta: Array<{
    dia: string;
    periodo: string;
    tipoColeta: string;
  }>;
}

export interface HistoricoColetaResponse {
  ultimaColeta: string | null;
  passou: boolean;
  historico: Array<{
    data: string;
    hora: string;
    tipoColeta: string;
  }>;
}

/**
 * Faz requisição ao backend Java
 */
export async function fetchFromBackend<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${BACKEND_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend error [${response.status}]:`, errorText);
      throw new Error(`Backend error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao conectar com backend:', error);
    throw error;
  }
}

/**
 * Consulta agenda de coleta baseada em coordenadas
 */
export async function getAgendaColeta(
  latitude: number,
  longitude: number
): Promise<AgendaColetaResponse> {
  return fetchFromBackend<AgendaColetaResponse>(
    `/api/consulta/agenda-coleta?latitude=${latitude}&longitude=${longitude}`
  );
}

/**
 * Consulta histórico de coleta baseada em coordenadas
 */
export async function getHistoricoColeta(
  latitude: number,
  longitude: number
): Promise<HistoricoColetaResponse> {
  return fetchFromBackend<HistoricoColetaResponse>(
    `/api/consulta/historico-coleta?latitude=${latitude}&longitude=${longitude}`
  );
}
