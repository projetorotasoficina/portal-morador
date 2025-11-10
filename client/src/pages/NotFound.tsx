import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => setLocation("/");

  return (
    <div className="min-h-screen w-full bg-blue-900 text-white flex flex-col items-center justify-center px-4">
      <img src="/logo-pb-branco.png" alt="Logo" className="h-14 w-auto mb-6" />

      <div className="text-center max-w-md">
        <h1 className="text-7xl font-bold mb-2">404</h1>

        <p className="text-lg text-blue-200 mb-6">
          Página não encontrada.
        </p>

        <Button
          onClick={handleGoHome}
          className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2"
        >
          <Home className="w-4 h-4 mr-2" />
          Voltar ao Início
        </Button>
      </div>
    </div>
  );
}