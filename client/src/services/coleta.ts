import { getToken } from './auth';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://rotas-api-yqsi.onrender.com';

// ===== Tipos da API =====
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
}

// ===== Tipos usados no front =====
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
  data: string; // YYYY-MM-DD
  hora: string; // HH:mm
  tipo: string; // ex.: “RECICLÁVEL”
}

export interface HistoricoColeta {
  historico: HistoricoItem[];
}

// ===== Helpers de normalização =====
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
    // “tipos” agregando tipoResiduo e tipoColeta (quando existirem)
    tipos: [it.tipoResiduo, it.tipoColeta].filter(Boolean),
  }));
  return { endereco: '', diasColeta };
}

function toHistorico(items: ApiHistoricoItem[]): HistoricoColeta {
  const historico: HistoricoItem[] = items.map((it) => {
    const d = new Date(it.dataInicio);
    const data = d.toISOString().split('T')[0];
    const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    // priorize tipoResiduo; se quiser, concatene com tipoColeta
    const tipo = it.tipoResiduo || it.tipoColeta || '';
    return { data, hora, tipo };
  });
  // opcional: ordenar mais recente primeiro
  historico.sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0));
  return { historico };
}

// ===== Chamadas =====

// Agenda por coordenadas (endpoint público, porém estamos autenticando mesmo assim)
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
    // alguns backends usam 404 quando não encontra rota
    if (resp.status === 404) throw new Error('Nenhuma rota de coleta encontrada para este endereço');
    throw new Error('Erro ao consultar agenda de coleta');
  }

  const data: ApiAgendaItem[] = await resp.json();
  // API retorna array; se vier vazio, reflita vazio no front
  return toAgendaColeta(Array.isArray(data) ? data : []);
}

// Histórico por coordenadas (endpoint público)
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
    if (resp.status === 400) return { historico: [] }; // coords inválidas → trate como vazio
    if (resp.status === 404) return { historico: [] }; // nada encontrado
    throw new Error('Erro ao consultar histórico de coleta');
  }

  const data: ApiHistoricoItem[] = await resp.json();
  return toHistorico(Array.isArray(data) ? data : []);
}