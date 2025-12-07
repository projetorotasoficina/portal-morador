import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Loader2 } from "lucide-react";
import { HistoricoColeta } from "@/services/coleta";
import { type Usuario } from "@/services/auth";

interface RouteMapProps {
  historico: HistoricoColeta | null;
  perfil: Usuario | null;
  loading?: boolean;
}

export default function RouteMap({ historico, perfil, loading = false }: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylinesRef = useRef<L.Polyline[]>([]);

  useEffect(() => {
    if (!mapContainer.current || !perfil || !perfil.latitude || !perfil.longitude) return;

    // Inicializar mapa apenas uma vez
    if (!map.current) {
      map.current = L.map(mapContainer.current).setView(
        [perfil.latitude, perfil.longitude],
        15
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      } ).addTo(map.current);
    }

    // Limpar marcadores e polylines anteriores
    markersRef.current.forEach((marker) => marker.remove());
    polylinesRef.current.forEach((polyline) => polyline.remove());
    markersRef.current = [];
    polylinesRef.current = [];

    // Adicionar marcador do endereço do morador
    const homeMarker = L.marker([perfil.latitude, perfil.longitude], {
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

    // Adicionar rotas do histórico
    if (historico && historico.historico && historico.historico.length > 0) {
      // Mostrar apenas os últimos 5 registros
      const recentHistorico = historico.historico.slice(0, 5);
      const allCoordinates: [number, number][] = [];

      recentHistorico.forEach((item) => {
        // Se a rota tem coordenadas, desenha a polyline
        if (item.rota && item.rota.length > 0) {
          const routeCoordinates: [number, number][] = item.rota.map((coord) => [
            coord.latitude,
            coord.longitude,
          ]);

          // Adicionar todas as coordenadas ao array para ajustar o zoom depois
          allCoordinates.push(...routeCoordinates);

          // Desenhar a polyline da rota
          const polyline = L.polyline(routeCoordinates, {
            color: "#3b82f6", // Azul
            weight: 3,
            opacity: 0.7,
            dashArray: "5, 5", // Linha tracejada
          })
            .bindPopup(
              `<div class="text-sm"><strong>${item.tipo}</strong>  
${new Date(
                item.data
              ).toLocaleDateString("pt-BR")} às ${item.hora}</div>`
            )
            .addTo(map.current!);

          polylinesRef.current.push(polyline);

          // Adicionar marcadores nos pontos de início e fim da rota
          if (routeCoordinates.length > 0) {
            // Marcador de início
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
              title: `Início - ${item.tipo}`,
            })
              .bindPopup(
                `<div class="text-sm"><strong>Início da Coleta</strong>  
${item.tipo}  
${new Date(
                  item.data
                ).toLocaleDateString("pt-BR")} às ${item.hora}</div>`
              )
              .addTo(map.current!);

            markersRef.current.push(startMarker);

            // Marcador de fim (se houver mais de um ponto)
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
                title: `Fim - ${item.tipo}`,
              })
                .bindPopup(
                  `<div class="text-sm"><strong>Fim da Coleta</strong>  
${item.tipo}  
${new Date(
                    item.data
                  ).toLocaleDateString("pt-BR")} às ${item.hora}</div>`
                )
                .addTo(map.current!);

              markersRef.current.push(endMarker);
            }
          }
        }
      });

      // Ajustar zoom para mostrar todos os marcadores e rotas
      if (allCoordinates.length > 0 && map.current) {
        const bounds = L.latLngBounds(allCoordinates);
        map.current.fitBounds(bounds, { padding: [50, 50] });
      } else if (markersRef.current.length > 1 && map.current) {
        const group = new L.FeatureGroup(markersRef.current);
        map.current.fitBounds(group.getBounds(), { padding: [50, 50] });
      }
    }

    return () => {
      // Não destruir o mapa ao desmontar, apenas limpar marcadores
    };
  }, [historico, perfil]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-700" />
            Mapa da Rota Realizada
          </CardTitle>
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
          <MapPin className="h-5 w-5 text-blue-700" />
          Mapa da Rota Realizada
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={mapContainer}
          className="w-full h-[400px] rounded-lg border border-slate-200 overflow-hidden"
        />
        <p className="text-xs text-gray-500 mt-3">
          <strong>Verde:</strong> Seu endereço | <strong>Azul:</strong> Início da coleta | <strong>Laranja:</strong> Fim da coleta | <strong>Linha azul tracejada:</strong> Rota percorrida
        </p>
      </CardContent>
    </Card>
  );
}
