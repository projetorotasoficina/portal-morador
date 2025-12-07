import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HistoricoItem } from "@/services/coleta";
import { type Usuario } from "@/services/auth";

interface RouteMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  historicoItem: HistoricoItem | null;
  perfil: Usuario | null;
}

// Componente auxiliar para o mapa
const MapContent = ({ historicoItem, perfil }: Omit<RouteMapModalProps, 'isOpen' | 'onClose'>) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylinesRef = useRef<L.Polyline[]>([]);

  const routeCoordinates: [number, number][] =
    historicoItem && historicoItem.rota
      ? historicoItem.rota.map((coord) => [coord.latitude, coord.longitude])
      : [];

  useEffect(() => {
    if (!mapContainer.current || !perfil || !perfil.latitude || !perfil.longitude) return;

    // Inicializa o mapa
    if (!map.current) {
      map.current = L.map(mapContainer.current).setView([perfil.latitude!, perfil.longitude!], 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      } ).addTo(map.current);
    } else {
      // Se o mapa já existe, apenas força o redimensionamento
      map.current.invalidateSize();
    }

    // Limpar camadas
    markersRef.current.forEach((marker) => marker.remove());
    polylinesRef.current.forEach((polyline) => polyline.remove());
    markersRef.current = [];
    polylinesRef.current = [];

    // Adicionar marcador do endereço do morador
    const homeMarker = L.marker([perfil.latitude!, perfil.longitude!], {
      icon: L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      } ),
      title: "Seu endereço",
    })
      .bindPopup(
        `<div class="text-sm"><strong>Seu endereço</strong>  
${perfil.endereco}${
          perfil.numero ? `, ${perfil.numero}` : ""
        }${perfil.bairro ? ` - ${perfil.bairro}` : ""}</div>`
      )
      .addTo(map.current);

    markersRef.current.push(homeMarker);

    // Adicionar rota se houver
    if (routeCoordinates.length > 0) {
      const polyline = L.polyline(routeCoordinates, {
        color: "#3b82f6",
        weight: 3,
        opacity: 0.7,
        dashArray: "5, 5",
      })
        .bindPopup(
          `<div class="text-sm"><strong>Rota de Coleta</strong>  
${historicoItem?.tipo}</div>`
        )
        .addTo(map.current!);

      polylinesRef.current.push(polyline);

      // Adicionar marcadores de início e fim (simplificado)
      if (routeCoordinates.length > 0) {
        const startMarker = L.marker(routeCoordinates[0], {
          icon: L.icon({
            iconUrl:
              "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
            shadowUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          } ),
          title: `Início - ${historicoItem?.tipo}`,
        }).addTo(map.current!);
        markersRef.current.push(startMarker);

        if (routeCoordinates.length > 1) {
          const endMarker = L.marker(routeCoordinates[routeCoordinates.length - 1], {
            icon: L.icon({
              iconUrl:
                "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
              shadowUrl:
                "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            } ),
            title: `Fim - ${historicoItem?.tipo}`,
          }).addTo(map.current!);
          markersRef.current.push(endMarker);
        }
      }

      // Ajustar zoom
      const allBounds = L.latLngBounds([
        ...routeCoordinates,
        [perfil.latitude!, perfil.longitude!],
      ]);
      map.current.fitBounds(allBounds, { padding: [50, 50] });
    } else {
      // Se não houver rota, apenas centraliza no endereço
      map.current.setView([perfil.latitude!, perfil.longitude!], 15);
    }

    return () => {
      // Limpeza
    };
  }, [historicoItem, perfil]);

  return (
    <div
      ref={mapContainer}
      className="w-full rounded-lg border border-slate-200 overflow-hidden"
      style={{ height: '500px' }}
    />
  );
};

export default function RouteMapModal({
                                        isOpen,
                                        onClose,
                                        historicoItem,
                                        perfil,
                                      }: RouteMapModalProps) {
  const title = historicoItem
    ? `Rota de Coleta - ${historicoItem.tipo} (${new Date(
      historicoItem.data
    ).toLocaleDateString("pt-BR")})`
    : "Rota de Coleta";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-700" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0">
          {/* Renderiza o mapa SOMENTE se o modal estiver aberto */}
          {isOpen && <MapContent historicoItem={historicoItem} perfil={perfil} />}
        </div>
        <div className="text-xs text-gray-500 mt-3">
          <strong>Verde:</strong> Seu endereço | <strong>Azul:</strong> Início da coleta |{" "}
          <strong>Laranja:</strong> Fim da coleta | <strong>Linha azul tracejada:</strong> Rota percorrida
        </div>
      </DialogContent>
    </Dialog>
  );
}
