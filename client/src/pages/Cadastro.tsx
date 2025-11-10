import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, UserPlus, MapPin, Mail, IdCard, Phone } from "lucide-react";
import { toast } from "sonner";
import { cadastrarMorador, type CadastroMoradorData } from "@/services/auth";
import { useAddressLookup } from "@/hooks/useAddressLookup";
import { usePrefeitura } from "@/hooks/usePrefeitura";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Cadastro() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const { loading: addressLoading, lookupAddress } = useAddressLookup();
  const prefeitura = usePrefeitura();

  const [formData, setFormData] = useState<CadastroMoradorData>({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    endereco: "",
    numero: "",
    bairro: "",
    cep: "",
    latitude: "",
    longitude: "",
  });

  const handleSearchCEP = async () => {
    if (!formData.cep) {
      toast.error("Digite um CEP para buscar");
      return;
    }

    const addressData = await lookupAddress(formData.cep, formData.numero);

    if (addressData) {
      if (prefeitura.permitirApenasEstaCidade) {
        const cidadeNormalizada = addressData.cidade.toLowerCase().trim();
        const cidadePermitida = prefeitura.cidade.toLowerCase().trim();

        if (cidadeNormalizada !== cidadePermitida) {
          toast.error(
            `Este portal é exclusivo para moradores de ${prefeitura.cidade} - ${prefeitura.estado}. ` +
            `O CEP informado pertence a ${addressData.cidade} - ${addressData.estado}.`
          );
          return;
        }
      }

      setFormData({
        ...formData,
        endereco: addressData.logradouro,
        bairro: addressData.bairro,
        cep: formData.cep,
        latitude: addressData.latitude,
        longitude: addressData.longitude,
      });

      toast.success("Endereço e coordenadas encontrados!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.latitude || !formData.longitude) {
      toast.error("Por favor, busque o CEP para obter as coordenadas");
      return;
    }

    setLoading(true);

    try {
      await cadastrarMorador(formData);
      toast.success("Cadastro realizado com sucesso! Agora faça login.");
      setLocation("/login");
    } catch (error: any) {
      toast.error(error.message || "Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 py-10">
        <div className="container max-w-3xl">
          <div className="mb-6 flex items-center justify-between">
            <Button
              variant="ghost"
              className="text-blue-900 hover:bg-blue-50"
              onClick={() => setLocation("/login")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Login
            </Button>

            <div className="flex items-center gap-2">
              {prefeitura?.logo && (
                <img
                  src={prefeitura.logo}
                  alt={prefeitura.nome}
                  className="h-8 w-auto"
                />
              )}
              <span className="hidden sm:block text-sm font-semibold text-blue-900">
                {prefeitura?.nome}
              </span>
            </div>
          </div>

          <Card className="border-blue-900/10">
            <CardHeader className="border-b border-blue-900/10">
              <CardTitle className="text-blue-900">Cadastro de Morador</CardTitle>
              <CardDescription>
                Crie sua conta para consultar a agenda de coleta
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <div className="relative">
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        required
                        className="focus-visible:ring-blue-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder="seu@email.com"
                        className="pl-10 focus-visible:ring-blue-900"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Você receberá um código de acesso neste email
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <div className="relative">
                        <IdCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="cpf"
                          value={formData.cpf}
                          onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                          placeholder="000.000.000-00"
                          className="pl-10 focus-visible:ring-blue-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="telefone"
                          value={formData.telefone}
                          onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                          placeholder="(00) 00000-0000"
                          className="pl-10 focus-visible:ring-blue-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-blue-900/10 pt-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Endereço
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="cep"
                          value={formData.cep}
                          onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                          placeholder="00000-000"
                          maxLength={9}
                          required
                          className="focus-visible:ring-blue-900"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSearchCEP}
                          disabled={addressLoading || !formData.cep}
                          className="border-blue-900/30 hover:bg-blue-50"
                        >
                          {addressLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Buscando...
                            </>
                          ) : (
                            "Buscar CEP"
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Digite o CEP e clique em Buscar para preencher automaticamente
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="endereco">Logradouro *</Label>
                        <Input
                          id="endereco"
                          value={formData.endereco}
                          onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                          required
                          className="focus-visible:ring-blue-900"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="numero">Número</Label>
                        <Input
                          id="numero"
                          value={formData.numero}
                          onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                          className="focus-visible:ring-blue-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bairro">Bairro</Label>
                      <Input
                        id="bairro"
                        value={formData.bairro}
                        onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                        className="focus-visible:ring-blue-900"
                      />
                    </div>

                    <input type="hidden" value={formData.latitude} />
                    <input type="hidden" value={formData.longitude} />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/login")}
                    disabled={loading}
                    className="border-blue-900/30 hover:bg-blue-50"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-900 hover:bg-blue-800 text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Cadastrando...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Cadastrar
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-gray-600">
            {prefeitura?.nome}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}