# Integração com Backend Java Spring Boot

Este documento explica como o frontend se integra com o backend Java hospedado em `https://rotas-api-yqsi.onrender.com`.

## Endpoints Integrados

### 1. Consultar Agenda de Coleta

**Endpoint:** `GET /api/consulta/agenda-coleta`

**Parâmetros:**
- `latitude` (query): Latitude do endereço do morador
- `longitude` (query): Longitude do endereço do morador

**Resposta Esperada:**
```json
{
  "diasColeta": [
    {
      "dia": "Segunda-feira",
      "periodo": "Manhã",
      "tipoColeta": "Resíduos Orgânicos"
    },
    {
      "dia": "Quarta-feira",
      "periodo": "Tarde",
      "tipoColeta": "Resíduos Recicláveis"
    }
  ]
}
```

### 2. Consultar Histórico de Coleta

**Endpoint:** `GET /api/consulta/historico-coleta`

**Parâmetros:**
- `latitude` (query): Latitude do endereço do morador
- `longitude` (query): Longitude do endereço do morador

**Resposta Esperada:**
```json
{
  "ultimaColeta": "2025-01-08T09:30:00Z",
  "passou": true,
  "historico": [
    {
      "data": "2025-01-08T09:30:00Z",
      "hora": "09:30",
      "tipoColeta": "Resíduos Orgânicos"
    },
    {
      "data": "2025-01-06T14:15:00Z",
      "hora": "14:15",
      "tipoColeta": "Resíduos Recicláveis"
    }
  ]
}
```

## Arquitetura de Integração

### Cliente HTTP (`server/backend-client.ts`)

Módulo responsável por fazer requisições HTTP ao backend Java:

```typescript
import { fetchFromBackend, getAgendaColeta, getHistoricoColeta } from './backend-client';

// Consultar agenda
const agenda = await getAgendaColeta(latitude, longitude);

// Consultar histórico
const historico = await getHistoricoColeta(latitude, longitude);
```

### Rotas tRPC (`server/routers.ts`)

As rotas tRPC fazem a ponte entre o frontend React e o backend Java:

- `coleta.getAgenda`: Consulta agenda de coleta
- `coleta.getHistorico`: Consulta histórico de coleta

### Frontend (`client/src/pages/Home.tsx`)

O frontend consome os dados via hooks tRPC:

```typescript
const { data: agenda } = trpc.coleta.getAgenda.useQuery();
const { data: historico } = trpc.coleta.getHistorico.useQuery();
```

## Configuração

### Variáveis de Ambiente

Criar arquivo `.env` na raiz do projeto:

```env
# Backend Java Spring Boot
BACKEND_API_URL=https://rotas-api-yqsi.onrender.com

# Banco de Dados PostgreSQL (Neon)
DATABASE_URL=jdbc:postgresql://ep-curly-cell-ac881c47-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require
DATABASE_USERNAME=neondb_owner
DATABASE_PASSWORD=npg_B7nhwScdExT3
```

**Nota:** Para Node.js, a `DATABASE_URL` deve estar no formato:
```env
DATABASE_URL=postgresql://neondb_owner:npg_B7nhwScdExT3@ep-curly-cell-ac881c47-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require
```

## Fluxo de Dados

1. **Morador cadastra endereço** → Salvo no banco de dados local (PostgreSQL)
2. **Frontend solicita agenda** → tRPC chama `coleta.getAgenda`
3. **tRPC busca coordenadas** → Consulta tabela `moradores` no banco
4. **tRPC chama backend Java** → `GET /api/consulta/agenda-coleta?lat=X&lng=Y`
5. **Backend Java processa** → Verifica rotas e retorna agenda
6. **Frontend exibe dados** → Mostra dias e horários de coleta

## Tratamento de Erros

### Erro de Conexão

Se o backend Java estiver indisponível:

```typescript
try {
  const data = await getAgendaColeta(lat, lng);
  return data;
} catch (error) {
  console.error('Erro ao buscar agenda:', error);
  // Retorna dados vazios
  return { diasColeta: [] };
}
```

### Erro de Dados Incompletos

Se o morador não tiver coordenadas cadastradas:

```typescript
if (!morador?.latitude || !morador?.longitude) {
  throw new TRPCError({
    code: "BAD_REQUEST",
    message: "Complete seu perfil com endereço e coordenadas",
  });
}
```

## CORS

O backend Java deve permitir requisições do frontend:

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins(
                        "http://localhost:3000",
                        "https://rotas-morador-web.manus.space"
                    )
                    .allowedMethods("GET", "POST", "PUT", "DELETE")
                    .allowCredentials(true);
            }
        };
    }
}
```

## Autenticação

### Backend Java

Os endpoints de consulta (`/api/consulta/*`) devem ser **públicos** ou usar autenticação própria.

### Frontend

O frontend usa autenticação OAuth via Manus, que é independente do backend Java.

**Importante:** As credenciais do morador (nome, CPF, endereço) são armazenadas no banco de dados do frontend, não no backend Java.

## Testando a Integração

### 1. Testar Backend Diretamente

```bash
curl "https://rotas-api-yqsi.onrender.com/api/consulta/agenda-coleta?latitude=-26.2296&longitude=-52.6697"
```

### 2. Testar via Frontend

1. Fazer login no portal do morador
2. Cadastrar endereço com coordenadas válidas
3. Acessar página "Minha Coleta"
4. Verificar se agenda e histórico são exibidos

### 3. Verificar Logs

```bash
# Logs do backend (Render)
# Acessar: https://dashboard.render.com

# Logs do frontend
cd /home/ubuntu/rotas-morador-web
pnpm dev
# Verificar console do navegador
```

## Troubleshooting

### Problema: Backend retorna 404

**Causa:** Endpoints não existem ou estão em outra rota

**Solução:** Verificar código-fonte do backend no GitHub

### Problema: Backend retorna dados vazios

**Causa:** Não há rotas cadastradas para as coordenadas fornecidas

**Solução:** Cadastrar rotas no painel administrativo

### Problema: CORS error

**Causa:** Backend não permite requisições do frontend

**Solução:** Adicionar configuração CORS no backend Java

### Problema: Backend em sleep (Render free tier)

**Causa:** Plano gratuito do Render coloca serviço em sleep após inatividade

**Solução:** Primeira requisição demora ~30s para acordar o serviço

## Próximos Passos

1. **Validar formato de resposta** do backend Java
2. **Adicionar cache** para reduzir chamadas ao backend
3. **Implementar retry** em caso de falha temporária
4. **Adicionar loading states** mais detalhados
5. **Implementar notificações** quando caminhão estiver próximo

## Referências

- Backend: https://github.com/projetorotasoficina/rotas-api/tree/develop
- Frontend: https://github.com/projetorotasoficina/rotas-web
- Swagger: https://rotas-api-yqsi.onrender.com/swagger-ui/index.html
