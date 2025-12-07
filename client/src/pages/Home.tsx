// src/pages/Home.tsx
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CollectionCalendar from "@/components/CollectionCalendar";
import RouteMapModal from "@/components/RouteMapModal"; // NOVO
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePrefeitura } from "@/hooks/usePrefeitura";
import { buscarMeuPerfil, type Usuario, getToken } from "@/services/auth";
import { consultarAgendaColeta, consultarHistoricoColeta, type AgendaColeta, type HistoricoColeta, type HistoricoItem } from "@/services/coleta"; // Importa HistoricoItem
import { Calendar, Clock, History, Loader2, MapPin, Recycle, User } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const prefeitura = usePrefeitura();

  const [perfil, setPerfil] = useState<Usuario | null>(null);
  const [agenda, setAgenda] = useState<AgendaColeta | null>(null);
  const [historico, setHistorico] = useState<HistoricoColeta | null>(null);

  // Estado para o modal do mapa
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedHistoricoItem, setSelectedHistoricoItem] = useState<HistoricoItem | null>(null);

  const [loadingPerfil, setLoadingPerfil] = useState(false);
  const [loadingAgenda, setLoadingAgenda] = useState(false);
  const [loadingHistorico, setLoadingHistorico] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!authLoading && !token) setLocation("/login");
  }, [user, authLoading, setLocation]);

  useEffect(() => {
    if (user) loadPerfil();
  }, [user]);

  useEffect(() => {
    if (perfil && perfil.latitude && perfil.longitude) {
      loadAgenda();
      loadHistorico();
    }
  }, [perfil]);

  const loadPerfil = async () => {
    setLoadingPerfil(true);
    try {
      const data = await buscarMeuPerfil();
      setPerfil(data);
      if (!data.latitude || !data.longitude) {
        toast.info("Complete seu perfil para consultar a agenda de coleta");
        setLocation("/perfil");
      }
    } catch (error: any) {
      if (error.message === "Sessão expirada") {
        toast.error("Sessão expirada. Faça login novamente.");
        setLocation("/login");
      }
    } finally {
      setLoadingPerfil(false);
    }
  };

  const loadAgenda = async () => {
    if (!perfil?.latitude || !perfil?.longitude) return;
    setLoadingAgenda(true);
    try {
      const data = await consultarAgendaColeta(perfil.latitude, perfil.longitude);
      setAgenda(data);
    } catch (error: any) {
      if (error.message === "Nenhuma rota de coleta encontrada para este endereço") {
        toast.info("Nenhuma rota de coleta cadastrada para seu endereço ainda");
      } else if (error.message !== "Sessão expirada") {
        toast.error("Erro ao carregar agenda de coleta");
      }
    } finally {
      setLoadingAgenda(false);
    }
  };

  const loadHistorico = async () => {
    if (!perfil?.latitude || !perfil?.longitude) return;
    setLoadingHistorico(true);
    try {
      const data = await consultarHistoricoColeta(perfil.latitude, perfil.longitude);
      setHistorico(data);
    } catch {
      // histórico pode estar vazio
    } finally {
      setLoadingHistorico(false);
    }
  };

  const getStatusColeta = () => {
    if (!historico || !historico.historico || historico.historico.length === 0) {
      return { mensagem: "O caminhão ainda não passou hoje", cor: "text-gray-600", icone: Clock };
    }
    const hoje = new Date().toISOString().split("T")[0];
    const coletaHoje = historico.historico.find((h) => h.data === hoje);
    if (coletaHoje) {
      return { mensagem: `Última coleta: ${coletaHoje.hora} - ${coletaHoje.tipo}`, cor: "text-green-600", icone: Recycle };
    }
    return { mensagem: "O caminhão ainda não passou hoje", cor: "text-gray-600", icone: Clock };
  };

  const handleShowRoute = (item: HistoricoItem) => {
    if (!item.rota || item.rota.length === 0) {
      toast.info("Nenhuma rota registrada para esta coleta.");
      return;
    }
    setSelectedHistoricoItem(item);
    setIsMapModalOpen(true);
  };

  if (authLoading || loadingPerfil) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </main>
        <Footer />
      </div>
    );
  }

  const status = getStatusColeta();
  const StatusIcon = status.icone;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />

      <main className="flex-1 py-8">
        <div className="container max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">Minha Coleta</h1>
            <p className="text-gray-600">
              Consulte a agenda de coleta da sua rua e acompanhe quando o caminhão passou
            </p>
          </div>

          {/* Status da Coleta */}
          <Card className="mb-6 border-l-4 border-l-blue-600">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <StatusIcon className={`h-6 w-6 ${status.cor}`} />
                <div>
                  <p className="text-sm text-gray-600">Status de Hoje</p>
                  <p className={`text-lg font-semibold ${status.cor}`}>{status.mensagem}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço Cadastrado */}
          {perfil && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-700" />
                  Endereço Cadastrado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  {perfil.endereco}
                  {perfil.numero && `, ${perfil.numero}`}
                  {perfil.bairro && ` - ${perfil.bairro}`}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {prefeitura.cidade} - {prefeitura.estado}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setLocation("/perfil")}
                >
                  <User className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Calendário de Coletas */}
          <div className="mb-6">
            <CollectionCalendar
              agenda={agenda}
              loading={loadingAgenda}
            />
          </div>

          {/* Histórico de Coleta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-blue-700" />
                Histórico de Coleta
              </CardTitle>
              <CardDescription>Clique em um item para ver a rota percorrida no mapa</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingHistorico ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : historico && historico.historico && historico.historico.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {historico.historico.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                      onClick={() => handleShowRoute(item)} // <--- AÇÃO DE CLIQUE
                    >
                      <Recycle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">
                          {new Date(item.data).toLocaleDateString("pt-BR")}
                        </p>
                        <p className="text-sm text-slate-600">
                          {item.hora} - {item.tipo}
                        </p>
                      </div>
                      {item.rota && item.rota.length > 0 && (
                        <MapPin className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum histórico de coleta registrado ainda</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
      {/* Modal do Mapa */}
      <RouteMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        historicoItem={selectedHistoricoItem}
        perfil={perfil}
      />
    </div>
  );
}
