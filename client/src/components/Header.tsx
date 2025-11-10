import { usePrefeitura } from "@/hooks/usePrefeitura";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function Header() {
  const p = usePrefeitura();
  const { user, isAuthenticated, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logout realizado!");
      setLocation("/login");
    } catch {
      toast.error("Erro ao sair");
    }
  };

  const isActive = (path: string) => location === path;

  return (
    <header className="text-white shadow-md sticky top-0 z-50">

      {isAuthenticated && (
        <div className="bg-blue-900">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between text-white">

            {/* Logo fixa */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
              <img src="/logo-pb-branco.png" alt="Logo" className="h-10 w-auto" />
            </div>

            {/* Navegação */}
            <nav className="flex items-center gap-2">
              <Link href="/">
                <Button
                  variant="ghost"
                  className={isActive("/") ? "bg-sky-600 text-white" : "hover:bg-blue-800 text-white"}
                >
                  Início
                </Button>
              </Link>

              <Link href="/perfil">
                <Button
                  variant="ghost"
                  className={isActive("/perfil") ? "bg-sky-600 text-white" : "hover:bg-blue-800 text-white"}
                >
                  <User className="h-4 w-4 mr-1" />
                  {user?.nome?.split(" ")[0] || "Meu Perfil"}
                </Button>
              </Link>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleLogout}
                className="text-white hover:bg-blue-800"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </nav>

          </div>
        </div>
      )}

    </header>
  );
}