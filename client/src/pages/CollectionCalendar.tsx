import React, { useState, useMemo } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import {
  generateCalendar,
  getMonthYear,
  getWeekdayName,
  getResidueColor,
  AgendaColeta,
  CalendarDay,
} from "../lib/utils.ts";

interface CollectionCalendarProps {
  agenda: AgendaColeta | null;
  loading: boolean;
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const CalendarDayComponent: React.FC<{ day: CalendarDay }> = ({ day }) => {
  const isCollectionDay = day.collectionTypes.length > 0;
  const isOtherMonth = !day.isCurrentMonth;
  const isToday = day.isToday;

  // Prioriza a cor do primeiro tipo de coleta para o fundo do dia
  const firstCollectionType = day.collectionTypes[0];
  const color = firstCollectionType ? getResidueColor(firstCollectionType) : null;

  let className = "calendar-day";
  let style: React.CSSProperties = {};

  if (isOtherMonth) {
    className += " other-month text-gray-400";
  } else {
    className += " text-gray-700 hover:bg-gray-100";
  }

  if (isCollectionDay) {
    className = "calendar-day text-white font-bold";
    style.backgroundColor = color?.hex;
  }

  if (isToday) {
    className += " today border-2 border-blue-500 shadow-md";
  }

  return (
    <div className={className} style={style}>
      {day.day}
    </div>
  );
};

const CollectionCalendar: React.FC<CollectionCalendarProps> = ({ agenda, loading }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(
    () => generateCalendar(year, month, agenda),
    [year, month, agenda]
  );

  const monthYearText = getMonthYear(currentDate);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Extrai os tipos de coleta únicos e suas cores para a legenda
  const legendItems = useMemo(() => {
    if (!agenda || !agenda.diasColeta) return [];

    const typesMap = new Map<string, { tipos: string[]; periodo: string }[]>();

    agenda.diasColeta.forEach((dia) => {
      dia.tipos.forEach((tipo) => {
        const key = tipo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (!typesMap.has(key)) {
          typesMap.set(key, []);
        }
        typesMap.get(key)?.push({ tipos: [tipo], periodo: dia.periodo });
      });
    });

    const uniqueLegendItems: { tipo: string; hex: string; periodos: string[] }[] = [];
    typesMap.forEach((dias, key) => {
      const color = getResidueColor(key);
      const uniquePeriodos = Array.from(new Set(dias.map(d => d.periodo)));
      uniqueLegendItems.push({
        tipo: key.charAt(0).toUpperCase() + key.slice(1), // Capitaliza o tipo
        hex: color.hex,
        periodos: uniquePeriodos,
      });
    });

    return uniqueLegendItems;
  }, [agenda]);

  // Próximas coletas (simplificado para os próximos 7 dias no mês atual)
  const nextCollections = useMemo(() => {
    if (!agenda || !agenda.diasColeta) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return agenda.diasColeta
      .filter((dia) => {
        const collectionDate = new Date(dia.data + "T00:00:00");
        return collectionDate >= today && collectionDate.getMonth() === month;
      })
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
      .slice(0, 5); // Limita a 5 próximas coletas
  }, [agenda, month]);

  return (
    <div className="card p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Calendário de Coletas</h2>
        <p className="text-sm text-gray-500">
          Dias coloridos indicam coletas agendadas para o seu endereço
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Calendário */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <button
              className="p-2 hover:bg-gray-100 rounded-lg"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold">{monthYearText}</h3>
            <button
              className="p-2 hover:bg-gray-100 rounded-lg"
              onClick={goToNextMonth}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="border rounded-lg p-4">
            {/* Dias da Semana */}
            <div className="calendar mb-2 grid grid-cols-7 gap-2">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-gray-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Dias do Mês */}
            <div className="calendar grid grid-cols-7 gap-2">
              {loading ? (
                <div className="col-span-7 flex items-center justify-center py-8">
                  <CalendarIcon className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : (
                calendarDays.map((day, index) => (
                  <CalendarDayComponent key={index} day={day} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Legenda e Próximas Coletas */}
        <div className="space-y-4">
          {/* Legenda */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Legenda</h3>
            <div className="space-y-2">
              {legendItems.map((item) => (
                <div key={item.tipo} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.hex }}
                  ></div>
                  <span>{item.tipo}</span>
                  <span className="text-gray-500">
                    - {item.periodos.join(" e ")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Próximas Coletas */}
          <div>
            <h3 className="text-sm font-semibold mb-2">
              Próximas Coletas em {monthYearText}
            </h3>
            <div className="space-y-2">
              {nextCollections.length > 0 ? (
                nextCollections.map((dia, index) => {
                  const firstType = dia.tipos[0];
                  const color = firstType ? getResidueColor(firstType) : null;
                  const formattedDate = new Date(dia.data + "T00:00:00").toLocaleDateString("pt-BR", { weekday: 'long', day: '2-digit', month: 'long' });

                  return (
                    <div key={index} className="rounded-lg border bg-gray-50 p-2">
                      <div className="text-sm font-medium mb-1 capitalize">
                        {formattedDate}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {dia.tipos.map((tipo, idx) => {
                          const typeColor = getResidueColor(tipo);
                          return (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 rounded text-white"
                              style={{ backgroundColor: typeColor.hex }}
                            >
                              {tipo} - {dia.periodo}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500">
                  Nenhuma coleta agendada para este mês.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionCalendar;