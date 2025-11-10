# Controle de Acesso - Portal do Morador

Este documento explica como funciona o controle de acesso no portal do morador.

## Visão Geral

O portal do morador permite que **qualquer usuário autenticado**, incluindo administradores, possa:
- Criar perfil de morador
- Cadastrar endereço residencial
- Consultar agenda de coleta
- Visualizar histórico de passagem do caminhão

## Filosofia de Acesso

### Administradores Também São Cidadãos

Administradores do sistema são, em sua maioria, funcionários públicos que também residem no município. Portanto, faz sentido que eles possam:

- **Como administrador**: Gerenciar o sistema através do painel administrativo
- **Como morador**: Consultar a coleta da sua própria residência

### Sem Restrições de Role

O sistema **não** impõe restrições baseadas em role (`admin` vs `user`) para o portal do morador. Todos os usuários autenticados têm os mesmos direitos de:
- Criar e editar seu perfil
- Consultar informações sobre coleta

## Implementação

### Backend (tRPC)

Todos os endpoints do portal do morador usam `protectedProcedure`, que apenas verifica autenticação:

```typescript
// server/routers.ts
morador: router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    // Qualquer usuário autenticado pode acessar
    const morador = await getMoradorByUserId(ctx.user.id);
    return morador;
  }),
  
  createProfile: protectedProcedure
    .input(moradorSchema)
    .mutation(async ({ ctx, input }) => {
      // Qualquer usuário autenticado pode criar perfil
      const morador = await createMorador({
        ...input,
        userId: ctx.user.id,
      });
      return morador;
    }),
}),
```

### Frontend (React)

As páginas do portal do morador apenas verificam se o usuário está autenticado:

```typescript
// client/src/pages/Home.tsx
useEffect(() => {
  if (!authLoading && !user) {
    setLocation("/login");
  }
}, [user, authLoading, setLocation]);
```

## Fluxo de Autenticação

### Para Qualquer Usuário (admin ou user)

1. Login via Manus OAuth
2. Redirecionado para `/perfil` (se não tiver perfil de morador)
3. Cadastra endereço e dados pessoais
4. Acessa `/` para consultar agenda e histórico

## Roles do Sistema

O sistema mantém o conceito de roles para **outros fins** (como acesso ao painel administrativo):

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  openId VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320),
  role ENUM('user', 'admin') DEFAULT 'user' NOT NULL,
  ...
);
```

**Roles disponíveis:**
- `user` - Morador comum (padrão)
- `admin` - Administrador do sistema

**Importante**: A role **não** afeta o acesso ao portal do morador.

## Separação de Sistemas

### Portal do Morador (Este Projeto)
- Acesso: Qualquer usuário autenticado
- Funcionalidade: Consulta de agenda e histórico de coleta
- Tecnologia: React + tRPC + Node.js

### Painel Administrativo (Projeto Separado)
- Acesso: Apenas usuários com role `admin`
- Funcionalidade: Gerenciamento do sistema de coleta
- Tecnologia: React + Java Spring Boot

## Segurança

### Isolamento de Dados

Cada morador só pode:
- Ver seu próprio perfil
- Editar seu próprio perfil
- Consultar coleta do seu próprio endereço

**Validação no backend:**
```typescript
updateProfile: protectedProcedure
  .mutation(async ({ ctx, input }) => {
    // Verificar se o morador pertence ao usuário logado
    const existing = await getMoradorByUserId(ctx.user.id);
    if (!existing || existing.id !== id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Você não tem permissão para atualizar este perfil",
      });
    }
    // ...
  }),
```

### Camadas de Proteção

1. **Autenticação**: OAuth via Manus
2. **Autorização**: Verificação de propriedade dos dados
3. **Banco de Dados**: Foreign key `userId` garante isolamento

## Perguntas Frequentes

**Q: Administradores têm privilégios especiais no portal do morador?**
A: Não. No portal do morador, todos os usuários têm os mesmos direitos.

**Q: Como diferenciar admin de morador comum?**
A: A diferenciação ocorre no **painel administrativo**, não no portal do morador.

**Q: Um admin pode ver dados de outros moradores?**
A: Não no portal do morador. Para isso, deve usar o painel administrativo.

**Q: Posso adicionar restrições por role no futuro?**
A: Sim, mas não é recomendado. A filosofia é que todos são cidadãos.

## Exemplo de Uso

### Cenário: Secretário de Meio Ambiente

João é secretário de meio ambiente (role: `admin`):

**No Painel Administrativo:**
- Gerencia rotas de coleta
- Visualiza relatórios
- Cadastra caminhões
- Monitora equipes

**No Portal do Morador:**
- Cadastra endereço da sua casa
- Consulta quando o caminhão passa na sua rua
- Vê histórico de coletas

João usa **dois sistemas diferentes** com **dois propósitos diferentes**, mas com **uma única conta**.

## Integração com Sistema Existente

Se você já tem um painel administrativo (`rotas-web`):

1. **Compartilhar Banco de Dados**: Ambos os sistemas usam a mesma tabela `users`
2. **Sincronizar Roles**: Garanta que roles sejam consistentes
3. **URLs Diferentes**: 
   - Portal Morador: `morador.prefeitura.gov.br`
   - Painel Admin: `admin.prefeitura.gov.br`

## Conclusão

O portal do morador adota uma abordagem **inclusiva e pragmática**:
- ✅ Administradores são cidadãos e podem usar o portal
- ✅ Todos têm os mesmos direitos no portal do morador
- ✅ Separação de responsabilidades entre sistemas
- ✅ Segurança através de isolamento de dados, não de roles
