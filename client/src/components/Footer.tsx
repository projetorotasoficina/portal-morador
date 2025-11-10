import { usePrefeitura } from "@/hooks/usePrefeitura";
import { Facebook, Instagram, Globe } from "lucide-react";

export default function Footer() {
  const p = usePrefeitura();

  return (
    <footer className="text-white mt-auto bg-blue-900">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between text-sm">

        <div className="flex items-center gap-2 cursor-pointer">
          <img src="/logo-pb-branco.png" alt="Logo" className="h-10 w-auto" />
        </div>

        <div className="flex-1 text-center text-gray-300">
          {p?.contato?.telefone && <div>{p.contato.telefone}</div>}
          {p?.contato?.email && (
            <a
              href={`mailto:${p.contato.email}`}
              className="hover:text-sky-400 transition-colors"
            >
              {p.contato.email}
            </a>
          )}
        </div>

        <div className="flex items-center gap-4">
          {p?.contato?.site && (
            <a
              href={p.contato.site}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sky-400 transition-colors"
            >
              <Globe className="h-5 w-5" />
            </a>
          )}

          {p?.redesSociais?.facebook && (
            <a
              href={p.redesSociais.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sky-400 transition-colors"
            >
              <Facebook className="h-5 w-5" />
            </a>
          )}

          {p?.redesSociais?.instagram && (
            <a
              href={p.redesSociais.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sky-400 transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 py-3 border-t border-blue-800">
        © {new Date().getFullYear()} {p?.nome}. Todos os direitos reservados.
      </div>
    </footer>
  );
}