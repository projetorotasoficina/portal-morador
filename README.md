# Rotas Morador - Interface Web

Interface web para usuários moradores consultarem a agenda de coleta de resíduos e o histórico de passagem do caminhão em sua rua.

## Visão Geral

Este projeto foi desenvolvido para permitir que moradores acessem informações sobre a coleta de resíduos em suas residências através de uma interface web simples e intuitiva. O sistema oferece login separado do painel administrativo e integração com o backend da API Rotas.

## Funcionalidades

### Tela de Login
- Autenticação via Manus OAuth
- Interface limpa e responsiva
- Acesso exclusivo para moradores

### Tela de Perfil
- Cadastro completo de dados pessoais
- Cadastro de endereço residencial
- Inclusão de coordenadas geográficas (latitude/longitude)
- Edição de informações cadastradas

### Tela "Minha Coleta"
- **Visualização do endereço cadastrado**
- **Status do dia**: Indica se o caminhão já passou ou ainda não passou
- **Agenda de coleta**: Exibe dias da semana, períodos e tipos de coleta previstos
- **Histórico de coleta**: Mostra as últimas passagens do caminhão com data, hora e tipo de coleta

## Tecnologias Utilizadas

### Frontend
- **React 19**: Biblioteca para construção da interface
- **TypeScript**: Tipagem estática
- **Tailwind CSS 4**: Framework CSS para estilização
- **shadcn/ui**: Componentes UI acessíveis e reutilizáveis
- **Wouter**: Roteamento leve
- **TanStack Query (React Query)**: Gerenciamento de estado assíncrono

### Backend
- **Express 4**: Framework Node.js
- **tRPC 11**: Type-safe API
- **Drizzle ORM**: ORM para MySQL/TiDB
- **Manus OAuth**: Autenticação

### Banco de Dados
- **MySQL/TiDB**: Banco de dados relacional

## Estrutura do Projeto

```
client/
  src/
    pages/
      Home.tsx          # Tela principal "Minha Coleta"
      Login.tsx         # Tela de login
      Profile.tsx       # Tela de perfil do morador
    components/         # Componentes reutilizáveis
    lib/trpc.ts        # Cliente tRPC
    App.tsx            # Rotas da aplicação

server/
  db.ts               # Funções de banco de dados
  routers.ts          # Rotas tRPC (API)

drizzle/
  schema.ts           # Schema do banco de dados
```

## Schema do Banco de Dados

### Tabela `users`
Tabela de autenticação padrão do Manus OAuth.

### Tabela `moradores`
- `id`: ID único do morador
- `userId`: Referência ao usuário autenticado
- `nome`: Nome completo
- `cpf`: CPF (opcional)
- `telefone`: Telefone (opcional)
- `endereco`: Logradouro
- `numero`: Número da residência
- `complemento`: Complemento (opcional)
- `bairro`: Bairro
- `cidade`: Cidade
- `estado`: Estado (UF)
- `cep`: CEP
- `latitude`: Latitude para geolocalização
- `longitude`: Longitude para geolocalização

## API Endpoints (tRPC)

### Autenticação
- `auth.me`: Retorna o usuário autenticado
- `auth.logout`: Realiza logout

### Morador
- `morador.getProfile`: Obtém perfil do morador logado
- `morador.createProfile`: Cria perfil de morador
- `morador.updateProfile`: Atualiza perfil de morador

### Coleta
- `coleta.getAgenda`: Retorna agenda de coleta (requer perfil completo)
- `coleta.getHistorico`: Retorna histórico de coleta (requer perfil completo)

## Integração com Backend

O projeto está preparado para integração com os endpoints do backend da API Rotas:

- `GET /api/consulta/agenda-coleta`: Consulta agenda de coleta
- `GET /api/consulta/historico-coleta`: Consulta histórico de coleta

**Nota**: Atualmente, os endpoints `coleta.getAgenda` e `coleta.getHistorico` retornam dados mockados para desenvolvimento. Para integração completa, é necessário implementar as chamadas HTTP para o backend Java Spring Boot.

## Instalação e Execução

### Pré-requisitos
- Node.js 20.x ou superior
- pnpm (gerenciador de pacotes)

### Instalação
```bash
# Instalar dependências
pnpm install

# Aplicar migrações do banco de dados
pnpm db:push
```

### Execução
```bash
# Iniciar servidor de desenvolvimento
pnpm dev
```

O servidor estará disponível em `http://localhost:3000`

## Variáveis de Ambiente

As variáveis de ambiente são gerenciadas automaticamente pela plataforma Manus:

- `DATABASE_URL`: String de conexão do banco de dados
- `JWT_SECRET`: Segredo para assinatura de sessão
- `VITE_APP_ID`: ID da aplicação Manus OAuth
- `OAUTH_SERVER_URL`: URL do servidor OAuth
- `VITE_OAUTH_PORTAL_URL`: URL do portal de login
- `VITE_APP_TITLE`: Título da aplicação
- `VITE_APP_LOGO`: Logo da aplicação

## Design e UX

### Paleta de Cores
O projeto utiliza uma paleta de cores verde, relacionada à sustentabilidade e coleta de resíduos:
- **Primary**: Verde (#16a34a)
- **Background**: Gradiente verde claro
- **Cards**: Fundo branco com bordas suaves

### Responsividade
- Design mobile-first
- Layout adaptável para tablets e desktops
- Componentes otimizados para telas pequenas

### Acessibilidade
- Componentes shadcn/ui com suporte a leitores de tela
- Contraste adequado de cores
- Navegação por teclado

## Fluxo de Uso

1. **Login**: Usuário acessa `/login` e autentica via Manus OAuth
2. **Perfil**: Após login, usuário é direcionado para `/perfil` para completar cadastro
3. **Minha Coleta**: Com perfil completo, usuário acessa `/` para visualizar agenda e histórico
4. **Consulta**: Sistema exibe informações baseadas nas coordenadas do endereço cadastrado

## Próximos Passos

- [ ] Integrar com endpoints reais do backend Java Spring Boot
- [ ] Implementar notificações push para avisos de coleta
- [ ] Adicionar mapa interativo mostrando rota do caminhão
- [ ] Implementar sistema de feedback sobre a coleta
- [ ] Adicionar suporte a múltiplos endereços por morador

## Controle de Acesso

O portal do morador permite que **qualquer usuário autenticado**, incluindo administradores, possa criar perfil e consultar informações sobre coleta.

### Filosofia de Acesso:

- **Administradores também são cidadãos**: Funcionários públicos que gerenciam o sistema também residem no município e podem querer consultar a coleta de suas residências.
- **Sem restrições de role**: O sistema não impõe restrições baseadas em role (`admin` vs `user`) para o portal do morador.
- **Isolamento de dados**: Cada usuário só pode ver e editar seu próprio perfil.

### Validações Implementadas:

1. **Autenticação**: Todos os endpoints requerem usuário autenticado via OAuth
2. **Autorização**: Usuários só podem acessar seus próprios dados
3. **Banco de Dados**: Foreign key `userId` garante isolamento de dados

Para mais detalhes, consulte `CONTROLE_ACESSO.md`.

## Autores

Projeto desenvolvido como parte do sistema Rotas - Gestão de Coleta de Resíduos.

## Licença

Este projeto é parte do sistema acadêmico da UTFPR - Campus Pato Branco.
