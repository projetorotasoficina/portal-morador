/**
 * Configuração de Personalização da Prefeitura
 * 
 * Este arquivo permite personalizar cores, logo e informações da prefeitura
 * para o portal do morador.
 * 
 * Cores baseadas no site oficial: https://patobranco.pr.gov.br
 */

export const prefeituraConfig = {
  // Nome da prefeitura/município
  nome: "Prefeitura Municipal de Pato Branco",
  cidade: "Pato Branco",
  estado: "PR",

  // Logo da prefeitura
  logo: "/logo-pato-branco.png",
  
  // Cores institucionais - Baseadas no site oficial
  cores: {
    // Cor principal - Azul ciano (usado em títulos e destaques)
    primaria: "#00a8e8",
    
    // Cor secundária - Azul marinho (usado em headers e footers)
    secundaria: "#1a2b52",
    
    // Cor de destaque - Azul médio (usado em ícones e botões)
    destaque: "#0891b2",
    
    // Gradiente de fundo - tons suaves de cinza
    fundoGradiente: {
      de: "#f8f9fa", // Cinza muito claro
      para: "#e9ecef", // Cinza claro
    },
  },

  // Informações de contato
  contato: {
    telefone: "(46) 3220-1600",
    email: "meioambiente@patobranco.pr.gov.br",
    site: "https://www.patobranco.pr.gov.br",
    endereco: "R. Caramuru, 271 - Centro",
    cep: "85501-064",
    horario: "8h às 12h | 13h30 às 17h30",
  },

  // Redes sociais
  redesSociais: {
    facebook: "https://www.facebook.com/prefpatobrancooficial",
    instagram: "https://www.instagram.com/prefpatobrancooficial"
  },

  // Validação de cidade - permitir apenas moradores de Pato Branco
  permitirApenasEstaCidade: true,
};
