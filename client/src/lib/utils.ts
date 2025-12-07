import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { AgendaColeta } from "@/services/coleta";

// Função para combinar classes do Tailwind de forma inteligente
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Mapeamento de cores para os tipos de resíduo, baseado no estilo do HTML modelo
export const RESIDUE_COLORS: { [key: string]: { bg: string; text: string; hex: string } } = {
  organico: {
    bg: "bg-[#4CAF50]/10",
    text: "text-[#4CAF50]",
    hex: "#4CAF50",
  }, // Verde
  reciclavel: {
    bg: "bg-[#2196F3]/10",
    text: "text-[#2196F3]",
    hex: "#2196F3",
  }, // Azul
  rejeito: {
    bg: "bg-[#9E9E9E]/10",
    text: "text-[#9E9E9E]",
    hex: "#9E9E9E",
  }, // Cinza
  // Adicione outros tipos de resíduo se necessário
};

export function getResidueColor(tipo: string) {
  const key = tipo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return RESIDUE_COLORS[key] || { bg: "bg-gray-100", text: "text-gray-700", hex: "#f3f4f6" };
}

// Função para formatar a data no formato "Dia da semana, DD de mês"
export function formatCollectionDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00"); // Adiciona T00:00:00 para evitar problemas de fuso horário
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "2-digit",
    month: "long",
  };
  const formatted = date.toLocaleDateString("pt-BR", options);
  // Capitaliza a primeira letra do dia da semana
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

// Função para obter o nome do mês e ano
export function getMonthYear(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" };
  const formatted = date.toLocaleDateString("pt-BR", options);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

// Função para obter o nome abreviado do dia da semana
export function getWeekdayName(dayIndex: number): string {
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return days[dayIndex];
}

// Função para obter o número de dias em um mês
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// Função para gerar a matriz do calendário
export interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  collectionTypes: string[];
  periodo: string | null;
}

export function generateCalendar(
  year: number,
  month: number,
  agenda: AgendaColeta | null
): CalendarDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Mapeia o nome do dia da semana para os dados da coleta
  // Normaliza a chave para garantir que "Segunda-feira" e "segunda-feira" funcionem
  const scheduleMap = new Map<string, { tipos: string[]; periodo: string }>();
  if (agenda) {
    for (const diaColeta of agenda.diasColeta) {
      const normalizedDay = diaColeta.dia.toLowerCase().replace(/-feira/g, '').trim();
      scheduleMap.set(normalizedDay, { tipos: diaColeta.tipos, periodo: diaColeta.periodo });
    }
  }

  const calendarDays: CalendarDay[] = [];

  // Preencher dias do mês anterior
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Domingo, 6 = Sábado
  const prevMonth = new Date(year, month, 0);
  const daysInPrevMonth = prevMonth.getDate();
  for (let i = startDayOfWeek; i > 0; i--) {
    const day = daysInPrevMonth - i + 1;
    const date = new Date(year, month - 1, day);
    calendarDays.push({
      date,
      day,
      isCurrentMonth: false,
      isToday: false,
      collectionTypes: [],
      periodo: null,
    });
  }

  // Preencher dias do mês atual
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isToday = date.getTime() === today.getTime();

    // Obtém o nome do dia da semana e normaliza
    const dayName = date.toLocaleDateString("pt-BR", { weekday: "long" });
    const normalizedDay = dayName.toLowerCase().replace(/-feira/g, '').trim();

    const collectionData = scheduleMap.get(normalizedDay);

    calendarDays.push({
      date,
      day,
      isCurrentMonth: true,
      isToday,
      collectionTypes: collectionData ? collectionData.tipos : [],
      periodo: collectionData ? collectionData.periodo : null,
    });
  }

  // Preencher dias do próximo mês para completar a última semana
  const totalDays = calendarDays.length;
  const remainingDays = 42 - totalDays; // 6 semanas * 7 dias = 42
  const daysToAdd = remainingDays > 7 ? remainingDays - 7 : remainingDays;

  for (let i = 1; i <= daysToAdd; i++) {
    const date = new Date(year, month + 1, i);
    calendarDays.push({
      date,
      day: i,
      isCurrentMonth: false,
      isToday: false,
      collectionTypes: [],
      periodo: null,
    });
  }

  return calendarDays;
}
