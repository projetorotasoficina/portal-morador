import { getToken } from './auth';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://rotas-api-yqsi.onrender.com';

// ===== Tipos da API (sem alteração ) =====
interface ApiAgendaItem {
  nomeRota: string;
  tipoResiduo: string;
  tipoColeta: string;
  diaSemana: 'DOMINGO'|'SEGUNDA'|'TERCA'|'QUARTA'|'QUINTA'|'SEXTA'|'SABADO';
  periodo: 'MANHA'|'TARDE'|'NOITE'|string;
  descricaoPeriodo?: string;
  observacoes?: string;
}

interface ApiHistoricoItem {
  trajetoId: number;
  nomeRota: string;
  tipoResiduo: string;
  tipoColeta: string;
  dataInicio: string; // ISO
  dataFim: string;    // ISO
  nomeMotorista: string;
  placaCaminhao: string;
  distanciaTotal: number;
  status: string;
  rota?: { latitude: number; longitude: number }[];
}

// ===== Tipos usados no front (sem alteração) =====
export interface DiaColeta {
  dia: string;
  periodo: string;
  tipos: string[];
  data: string;
}

export interface AgendaColeta {
  endereco: string;
  diasColeta: DiaColeta[];
}

export interface Coordenada {
  latitude: number;
  longitude: number;
}

export interface HistoricoItem {
  data: string; // YYYY-MM-DD
  hora: string; // HH:mm
  tipo: string; // ex.: "RECICLÁVEL"
  rota?: Coordenada[]; // Array de coordenadas da rota
}

export interface HistoricoColeta {
  historico: HistoricoItem[];
}

// ===== Helpers de normalização (sem alteração) =====
const DIA_MAP: Record<ApiAgendaItem['diaSemana'], string> = {
  DOMINGO: 'Domingo',
  SEGUNDA: 'Segunda',
  TERCA: 'Terça',
  QUARTA: 'Quarta',
  QUINTA: 'Quinta',
  SEXTA: 'Sexta',
  SABADO: 'Sábado',
};

function toAgendaColeta(items: ApiAgendaItem[]): AgendaColeta {
  const diasColeta: DiaColeta[] = items.map((it) => ({
    dia: DIA_MAP[it.diaSemana] ?? it.diaSemana,
    periodo: it.descricaoPeriodo || it.periodo,
    tipos: [it.tipoResiduo, it.tipoColeta].filter(Boolean),
    data: '',
  }));
  return { endereco: '', diasColeta };
}

function toHistorico(items: ApiHistoricoItem[]): HistoricoColeta {
  const historico: HistoricoItem[] = items.map((it) => {
    const d = new Date(it.dataInicio);
    const data = d.toISOString().split('T')[0];
    const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const tipo = it.tipoResiduo || it.tipoColeta || '';

    const rota: Coordenada[] | undefined = it.rota?.map(coord => ({
      latitude: coord.latitude,
      longitude: coord.longitude
    }));

    return { data, hora, tipo, rota };
  });
  historico.sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0));
  return { historico };
}

// ===== Chamadas =====

export async function consultarAgendaColeta(latitude: number, longitude: number): Promise<AgendaColeta> {
  const token = getToken();
  if (!token) throw new Error('Usuário não autenticado');

  const resp = await fetch(
    `${BACKEND_URL}/api/consulta/agenda-coleta/coordenadas?latitude=${latitude}&longitude=${longitude}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!resp.ok) {
    if (resp.status === 401) throw new Error('Sessão expirada');
    if (resp.status === 400) throw new Error('Coordenadas inválidas');
    if (resp.status === 404) throw new Error('Nenhuma rota de coleta encontrada para este endereço');
    throw new Error('Erro ao consultar agenda de coleta');
  }

  const data: ApiAgendaItem[] = await resp.json();
  return toAgendaColeta(Array.isArray(data) ? data : []);
}

export async function consultarHistoricoColeta(latitude: number, longitude: number): Promise<HistoricoColeta> {
  const token = getToken();
  if (!token) throw new Error('Usuário não autenticado');

  const resp = await fetch(
    `${BACKEND_URL}/api/consulta/historico-coleta/coordenadas?latitude=${latitude}&longitude=${longitude}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!resp.ok) {
    if (resp.status === 401) throw new Error('Sessão expirada');
    if (resp.status === 400) return { historico: [] };
    if (resp.status === 404) return { historico: [] };
    throw new Error('Erro ao consultar histórico de coleta');
  }

  const data: ApiHistoricoItem[] = await resp.json();
  const historico = toHistorico(Array.isArray(data) ? data : []);

  // <--- SIMULAÇÃO DE ROTA PARA TESTE AQUI
  if (historico.historico.length > 0) {
    // Simula uma rota de 5 pontos para o primeiro item do histórico
    historico.historico[0].rota = [
      { latitude: latitude + 0.001, longitude: longitude + 0.001 },
      { latitude: latitude + 0.002, longitude: longitude + 0.002 },
      { latitude: latitude + 0.003, longitude: longitude + 0.003 },
      { latitude: latitude + 0.004, longitude: longitude + 0.004 },
      { latitude: latitude + 0.005, longitude: longitude + 0.005 },
    ];
  }
  // FIM DA SIMULAÇÃO DE ROTA --->

  return historico;
}
