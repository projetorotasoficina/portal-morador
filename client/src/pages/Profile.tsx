// src/pages/Profile.tsx
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePrefeitura } from "@/hooks/usePrefeitura";
import { useAddressLookup } from "@/hooks/useAddressLookup";
import { useCPFValidation } from "@/hooks/useCPFValidation";
import { buscarMeuPerfil, atualizarPerfil, excluirConta, type Usuario, getToken, logout } from "@/services/auth";
import MapPicker from "@/components/MapPicker";
import { Loader2, Save, Search, MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";

type FormData = {
  nome: string;
  cpf: string;
  telefone: string;
  endereco: string;
  numero: string;
  bairro: string;
  cep: string;
  latitude: number | null;
  longitude: number | null;
};

export default function Profile() {
  const { loading: authLoading, updateUser } = useAuth();
  const [, setLocation] = useLocation();
  const prefeitura = usePrefeitura();
  const { loading: addressLoading, lookupAddress } = useAddressLookup();
  const { validateCPF, formatCPF, removeCPFMask } = useCPFValidation();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [perfil, setPerfil] = useState<Usuario | null>(null);

  const [formData, setFormData] = useState<FormData>({
    nome: "",
    cpf: "",
    telefone: "",
    endereco: "",
    numero: "",
    bairro: "",
    cep: "",
    latitude: null,
    longitude: null,
  });

  // garante redirecionamento se não autenticado
  useEffect(() => {
    const token = getToken();
    if (!authLoading && !token) setLocation("/login");
  }, [authLoading, setLocation]);

  // carrega perfil uma vez (usa /api/usuarios/meu-perfil/morador)
  useEffect(() => {
    (async () => {
      const token = getToken();
      if (!token) return;
      setLoading(true);
      try {
        const data = await buscarMeuPerfil();
        setPerfil(data);
        setFormData({
          nome: data.nome || "",
          cpf: data.cpf ? formatCPF(String(data.cpf)) : "",
          telefone: data.telefone || "",
          endereco: data.endereco || "",
          numero: data.numero || "",
          bairro: data.bairro || "",
          cep: data.cep || "",
          latitude: data.latitude != null ? Number(data.latitude) : null,
          longitude: data.longitude != null ? Number(data.longitude) : null,
        });
      } catch (err: any) {
        if (err?.message === "Sessão expirada") {
          toast.error("Sessão expirada. Faça login novamente.");
          setLocation("/login");
        } else {
          toast.error("Não foi possível carregar seus dados.");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSearchCEP = async () => {
    if (!formData.cep) {
      toast.error("Digite um CEP");
      return;
    }
    const addr = await lookupAddress(formData.cep, formData.numero);
    if (!addr) return;

    if (prefeitura.permitirApenasEstaCidade) {
      const a = addr.cidade.toLowerCase().trim();
      const b = prefeitura.cidade.toLowerCase().trim();
      if (a !== b) {
        toast.error(`Este portal é exclusivo para moradores de ${prefeitura.cidade} - ${prefeitura.estado}.`);
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      endereco: addr.logradouro || prev.endereco,
      bairro: addr.bairro || prev.bairro,
      latitude: addr.latitude ? Number(addr.latitude) : prev.latitude,
      longitude: addr.longitude ? Number(addr.longitude) : prev.longitude,
    }));
    toast.success("Endereço e coordenadas encontrados");
  };

  const handleMapLocationSelect = (lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
    toast.success("Localização selecionada no mapa");
  };

  const handleCPFChange = (v: string) => {
    setFormData((prev) => ({ ...prev, cpf: formatCPF(v) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.cpf && !validateCPF(removeCPFMask(formData.cpf))) {
      toast.error("CPF inválido");
      return;
    }
    if (formData.latitude == null || formData.longitude == null) {
      toast.error("Selecione a localização no mapa ou busque pelo CEP");
      return;
    }

    setSaving(true);
    try {
      const updated = await atualizarPerfil({
        nome: formData.nome,
        telefone: formData.telefone,
        endereco: formData.endereco,
        numero: formData.numero,
        bairro: formData.bairro,
        cep: formData.cep,
        cpf: formData.cpf ? removeCPFMask(formData.cpf) : "",
        latitude: formData.latitude,
        longitude: formData.longitude,
        email: perfil?.email || "",
      });
      updateUser(updated);
      setPerfil(updated);
      toast.success("Perfil atualizado");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao salvar");
      if (err?.message === "Sessão expirada") setLocation("/login");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Tem certeza que deseja excluir sua conta? Esta ação é irreversível.")) return;
    setDeleting(true);
    try {
      await excluirConta();
      toast.success("Conta excluída");
      logout();
      setLocation("/login");
    } catch (err: any) {
      toast.error(err?.message || "Não foi possível excluir a conta");
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || loading) {
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Meu Perfil</CardTitle>
              <CardDescription>Atualize suas informações para uso do portal</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        value={formData.cpf}
                        onChange={(e) => handleCPFChange(e.target.value)}
                        maxLength={14}
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Endereço</h3>

                  <div className="flex gap-2">
                    <Input
                      value={formData.cep}
                      onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                      placeholder="00000-000"
                      maxLength={9}
                      required
                    />
                    <Button
                      type="button"
                      onClick={handleSearchCEP}
                      disabled={addressLoading}
                      // força visibilidade do botão mesmo sem tema
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {addressLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Buscar
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="endereco">Logradouro *</Label>
                      <Input
                        id="endereco"
                        value={formData.endereco}
                        onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="numero">Número</Label>
                      <Input
                        id="numero"
                        value={formData.numero}
                        onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      value={formData.bairro}
                      onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Localização no Mapa</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMap((s) => !s)}
                        className="border-blue-600 text-blue-700 hover:bg-blue-50"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        {showMap ? "Ocultar Mapa" : "Selecionar no Mapa"}
                      </Button>
                    </div>

                    {showMap && (
                      <div className="mt-2">
                        <MapPicker
                          latitude={formData.latitude ?? 0}
                          longitude={formData.longitude ?? 0}
                          onLocationSelect={handleMapLocationSelect}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Clique no mapa para selecionar sua localização
                        </p>
                      </div>
                    )}

                    {formData.latitude != null && formData.longitude != null && (
                      <p className="text-xs text-green-600">
                        ✓ Coordenadas: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {/* Ações principais */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLocation("/")}
                      className="border-blue-600 text-blue-700 hover:bg-blue-50"
                    >
                      Voltar
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" /> Salvar
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Excluir conta */}
                  <Button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Excluindo...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" /> Excluir conta
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}