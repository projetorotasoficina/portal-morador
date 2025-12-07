import { useState, useMemo } from "react";
import { Calendar as CalendarIcon, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AgendaColeta } from "@/services/coleta";
import { cn, generateCalendar, getMonthYear, getWeekdayName } from "@/lib/utils";

interface CollectionCalendarProps {
  agenda: AgendaColeta | null;
  loading?: boolean;
}

export default function CollectionCalendar({ agenda, loading = false }: CollectionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Mês atual (para comparação)
  const today = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }, []);

  // Mês limite (próximo mês)
  const nextMonthLimit = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 1);
  }, []);

  // Mês que está sendo exibido
  const currentMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  }, [currentDate]);

  // Checa se o botão de voltar deve ser desabilitado (se o mês atual for o mês de hoje)
  const isPrevDisabled = currentMonth.getTime() <= today.getTime();

  // Checa se o botão de avançar deve ser desabilitado (se o mês atual for o próximo mês)
  const isNextDisabled = currentMonth.getTime() >= nextMonthLimit.getTime();

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return generateCalendar(year, month, agenda);
  }, [currentDate, agenda]);

  const selectedDayData = useMemo(() => {
    if (!selectedDay) return null;
    return calendarData.find(
      (d) =>
        d.date.getFullYear() === selectedDay.getFullYear() &&
        d.date.getMonth() === selectedDay.getMonth() &&
        d.date.getDate() === selectedDay.getDate()
    );
  }, [selectedDay, calendarData]);

  const handlePrevMonth = () => {
    if (!isPrevDisabled) {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    }
  };

  const handleNextMonth = () => {
    if (!isNextDisabled) {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    }
  };

  const monthName = getMonthYear(currentDate);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-700" />
            Calendário de Coletas
          </CardTitle>
          <CardDescription>Rotas previstas para sua rua</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-blue-700" />
          Calendário de Coletas
        </CardTitle>
        <CardDescription>Rotas previstas para sua rua</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendário */}
          <div className="lg:col-span-2">
            {/* Cabeçalho do mês */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevMonth}
                disabled={isPrevDisabled} // <--- DESABILITADO
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-semibold capitalize">{monthName}</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                disabled={isNextDisabled} // <--- DESABILITADO
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                <div key={dayIndex} className="text-center text-xs font-semibold text-gray-600 py-2">
                  {getWeekdayName(dayIndex)}
                </div>
              ))}
            </div>

            {/* Dias do calendário */}
            <div className="grid grid-cols-7 gap-1">
              {calendarData.map((dayData, idx) => {
                const isSelected =
                  selectedDay &&
                  dayData.date.getFullYear() === selectedDay.getFullYear() &&
                  dayData.date.getMonth() === selectedDay.getMonth() &&
                  dayData.date.getDate() === selectedDay.getDate();

                const hasCollections = dayData.collectionTypes.length > 0;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDay(dayData.date)}
                    className={cn(
                      "aspect-square p-1 rounded-lg border text-xs font-medium transition-all",
                      !dayData.isCurrentMonth && "text-gray-300 bg-gray-50",
                      dayData.isCurrentMonth && !hasCollections && "text-gray-700 hover:bg-slate-100",
                      dayData.isCurrentMonth &&
                      hasCollections &&
                      "bg-blue-100 text-blue-900 border-blue-300 hover:bg-blue-200",
                      isSelected && "ring-2 ring-blue-600 bg-blue-600 text-white"
                    )}
                  >
                    <div className="h-full flex flex-col items-center justify-center">
                      <span className="font-semibold">{dayData.day}</span>
                      {hasCollections && (
                        <span className="text-xs leading-none mt-0.5">
                          {dayData.collectionTypes.length > 1
                            ? `${dayData.collectionTypes.length}×`
                            : "●"}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legenda */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-100 border border-blue-300" />
                <span>Com coleta</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-white border border-gray-300" />
                <span>Sem coleta</span>
              </div>
            </div>
          </div>

          {/* Detalhes do dia selecionado */}
          <div className="lg:col-span-1">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              {selectedDayData ? (
                <>
                  <h4 className="font-semibold text-slate-900 mb-3">
                    {selectedDayData.date.toLocaleDateString("pt-BR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </h4>

                  {selectedDayData.collectionTypes.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDayData.periodo && (
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Período</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {selectedDayData.periodo}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-xs text-gray-600 font-medium mb-2">Tipos de Coleta</p>
                        <div className="space-y-2">
                          {selectedDayData.collectionTypes.map((collection, idx) => (
                            <div
                              key={idx}
                              className="px-3 py-2 bg-blue-600/10 text-blue-700 rounded-lg text-sm font-medium"
                            >
                              {collection}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Nenhuma coleta prevista para este dia</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  Selecione um dia no calendário para ver os detalhes
                </p>
              )}
            </div>
          </div>
        </div>

        {!agenda || !agenda.diasColeta || agenda.diasColeta.length === 0 ? (
          <div className="text-center py-8">
            <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhuma agenda de coleta cadastrada para seu endereço</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
