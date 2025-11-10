// src/hooks/useAddressLookup.ts
import { useState } from "react";
import { toast } from "sonner";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://rotas-api-yqsi.onrender.com";

interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

interface AddressData {
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
  latitude: string;
  longitude: string;
}

export function useAddressLookup() {
  const [loading, setLoading] = useState(false);

  const searchByCEP = async (cep: string): Promise<ViaCEPResponse | null> => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) {
      toast.error("CEP deve ter 8 dígitos");
      return null;
    }
    try {
      const r = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data: ViaCEPResponse = await r.json();
      if (data.erro) {
        toast.error("CEP não encontrado");
        return null;
      }
      return data;
    } catch (e) {
      console.error("CEP erro:", e);
      toast.error("Erro ao buscar CEP");
      return null;
    }
  };

  // >>> usa o proxy do back para evitar 403/CORS no Nominatim
  const geocodeAddress = async (
    logradouro: string,
    numero: string,
    cidade: string,
    estado: string
  ): Promise<{ latitude: string; longitude: string } | null> => {
    try {
      const q = `${logradouro}${numero ? ", " + numero : ""}, ${cidade}, ${estado}, Brasil`;
      const r = await fetch(
        `${BACKEND_URL}/api/utils/geocode?q=${encodeURIComponent(q)}`,
        { headers: { "Accept-Language": "pt-BR" } }
      );
      if (!r.ok) {
        console.error("Geocode falhou:", await r.text());
        return null;
      }
      const arr = (await r.json()) as Array<{ lat: string; lon: string }>;
      if (!arr.length) return null;
      return { latitude: arr[0].lat, longitude: arr[0].lon };
    } catch (e) {
      console.error("Geocode erro:", e);
      return null;
    }
  };

  const lookupAddress = async (cep: string, numero?: string): Promise<AddressData | null> => {
    setLoading(true);
    try {
      const via = await searchByCEP(cep);
      if (!via) return null;

      const coords = await geocodeAddress(via.logradouro, numero || "", via.localidade, via.uf);

      return {
        logradouro: via.logradouro,
        bairro: via.bairro,
        cidade: via.localidade,
        estado: via.uf,
        latitude: coords?.latitude || "",
        longitude: coords?.longitude || "",
      };
    } finally {
      setLoading(false);
    }
  };

  return { loading, lookupAddress, searchByCEP, geocodeAddress };
}