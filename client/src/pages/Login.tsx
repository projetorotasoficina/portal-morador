// src/pages/Login.tsx
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { solicitarCodigo, loginComOTP } from "@/services/auth";
import { usePrefeitura } from "@/hooks/usePrefeitura";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Login() {
  const [, setLocation] = useLocation();
  const prefeitura = usePrefeitura();

  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [loadingSolicitar, setLoadingSolicitar] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);

  const handleSolicitarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Digite seu email");
      return;
    }
    setLoadingSolicitar(true);
    try {
      await solicitarCodigo(email);
      setCodigoEnviado(true);
      toast.success("Código enviado para seu email!");
    } catch (error: any) {
      toast.error(error?.message || "Erro ao enviar código");
    } finally {
      setLoadingSolicitar(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo) {
      toast.error("Digite o código recebido");
      return;
    }
    setLoadingLogin(true);
    try {
      await loginComOTP(email, codigo);
      toast.success("Login realizado com sucesso!");
      setLocation("/");
    } catch (error: any) {
      toast.error(error?.message || "Código inválido");
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleVoltar = () => {
    setCodigoEnviado(false);
    setCodigo("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-blue-100">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img
              src={"/logo-pato-branco.png"}
              alt={prefeitura?.nome}
              className="h-16 w-auto mx-auto mb-3 mix-blend-multiply"
            />
            <h1 className="text-3xl font-bold text-blue-900 mb-1">
              Portal do Morador
            </h1>
            <p className="text-slate-600">
              Consulte a agenda de coleta de resíduos
            </p>
          </div>

          <Card className="shadow-lg border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-900">
                {codigoEnviado ? "Digite o código" : "Acessar portal"}
              </CardTitle>
              <CardDescription>
                {codigoEnviado
                  ? `Enviamos um código para ${email}`
                  : "Digite seu email para receber um código de acesso"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {!codigoEnviado ? (
                <form onSubmit={handleSolicitarCodigo} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="pl-10"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-900 hover:bg-blue-800 text-white"
                    disabled={loadingSolicitar}
                  >
                    {loadingSolicitar ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Enviar código
                      </>
                    )}
                  </Button>

                  <div className="text-center pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">
                      Ainda não tem cadastro?
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-blue-200 hover:bg-blue-50"
                      onClick={() => setLocation("/cadastro")}
                    >
                      Criar conta
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="codigo">Código de acesso</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="codigo"
                        type="text"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                        placeholder="0000"
                        className="pl-10 text-center text-lg tracking-widest"
                        maxLength={4}
                        required
                        autoFocus
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Verifique sua caixa de entrada e spam
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-900 hover:bg-blue-800 text-white"
                    disabled={loadingLogin}
                  >
                    {loadingLogin ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      "Entrar"
                    )}
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-blue-200 hover:bg-blue-50"
                      onClick={handleVoltar}
                      disabled={loadingLogin}
                    >
                      Voltar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-blue-200 hover:bg-blue-50"
                      onClick={handleSolicitarCodigo}
                      disabled={loadingSolicitar}
                    >
                      {loadingSolicitar ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Reenviar"
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>{prefeitura?.nome}</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}