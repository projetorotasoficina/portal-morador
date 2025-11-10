# Guia de Personalização - Portal do Morador

Este guia explica como personalizar o portal do morador com as cores e logo da sua prefeitura.

## 1. Configuração Básica

Edite o arquivo `client/src/config/prefeitura.ts` para personalizar:

### Informações da Prefeitura

```typescript
nome: "Prefeitura Municipal de Pato Branco",
cidade: "Pato Branco",
estado: "PR",
```

### Logo da Prefeitura

1. Coloque o arquivo do logo em `client/public/` (ex: `logo-prefeitura.png`)
2. Atualize o caminho no arquivo de configuração:

```typescript
logo: "/logo-prefeitura.png",
```

**Recomendações para o logo:**
- Formato: PNG com fundo transparente
- Tamanho: 200x200px ou proporção similar
- Peso: Máximo 100KB

### Cores Personalizadas

Altere as cores no formato hexadecimal:

```typescript
cores: {
  primaria: "#1e40af",      // Cor principal (botões, ícones)
  secundaria: "#3b82f6",    // Cor secundária
  destaque: "#fbbf24",      // Cor de destaque (alertas)
  fundoGradiente: {
    de: "#eff6ff",          // Início do gradiente
    para: "#dbeafe",        // Fim do gradiente
  },
},
```

### Informações de Contato

```typescript
contato: {
  telefone: "(46) 3220-1500",
  email: "coleta@patobranco.pr.gov.br",
  site: "https://www.patobranco.pr.gov.br",
},
```

## 2. Exemplos de Paletas de Cores

### Azul Institucional
```typescript
primaria: "#1e40af"
secundaria: "#3b82f6"
destaque: "#fbbf24"
fundoGradiente: { de: "#eff6ff", para: "#dbeafe" }
```

### Verde Sustentável (Padrão)
```typescript
primaria: "#16a34a"
secundaria: "#059669"
destaque: "#f59e0b"
fundoGradiente: { de: "#f0fdf4", para: "#dcfce7" }
```

### Vermelho/Laranja
```typescript
primaria: "#dc2626"
secundaria: "#ea580c"
destaque: "#fbbf24"
fundoGradiente: { de: "#fef2f2", para: "#fee2e2" }
```

### Roxo Moderno
```typescript
primaria: "#7c3aed"
secundaria: "#a78bfa"
destaque: "#f59e0b"
fundoGradiente: { de: "#faf5ff", para: "#f3e8ff" }
```

## 3. Como Escolher as Cores

### Passo 1: Identifique a cor principal da sua prefeitura
- Verifique o site oficial
- Consulte o manual de identidade visual
- Use a cor do brasão ou logo

### Passo 2: Obtenha o código hexadecimal
Use ferramentas online como:
- [HTML Color Picker](https://www.w3schools.com/colors/colors_picker.asp)
- [Adobe Color](https://color.adobe.com/)
- [Coolors](https://coolors.co/)

### Passo 3: Teste as cores
Após configurar, visualize o portal e verifique:
- ✅ Contraste adequado entre texto e fundo
- ✅ Legibilidade em dispositivos móveis
- ✅ Consistência visual em todas as páginas

## 4. Aplicando as Mudanças

Após editar o arquivo `client/src/config/prefeitura.ts`:

1. Salve o arquivo
2. O servidor de desenvolvimento recarregará automaticamente
3. Verifique as mudanças no navegador

## 5. Estrutura de Arquivos

```
client/
  public/
    logo-prefeitura.png          ← Coloque seu logo aqui
  src/
    config/
      prefeitura.ts              ← Arquivo de configuração principal
    hooks/
      usePrefeitura.ts           ← Hook que aplica as personalizações
    pages/
      Login.tsx                  ← Usa configuração da prefeitura
      Home.tsx                   ← Usa configuração da prefeitura
      Profile.tsx                ← Usa configuração da prefeitura
```

## 6. Personalização Avançada

### Alterar Fontes

Edite `client/index.html` para adicionar fontes do Google Fonts:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

Depois atualize `client/src/index.css`:

```css
body {
  font-family: 'Inter', sans-serif;
}
```

### Alterar Favicon

1. Coloque seu favicon em `client/public/favicon.ico`
2. O navegador usará automaticamente

## 7. Checklist de Personalização

- [ ] Atualizar nome da prefeitura
- [ ] Atualizar cidade e estado
- [ ] Adicionar logo da prefeitura
- [ ] Configurar cores personalizadas
- [ ] Adicionar informações de contato
- [ ] Testar em diferentes dispositivos
- [ ] Verificar contraste de cores
- [ ] Atualizar favicon (opcional)
- [ ] Personalizar fontes (opcional)

## 8. Suporte

Para dúvidas sobre personalização:
1. Consulte este guia
2. Verifique o arquivo `client/src/config/prefeitura.ts`
3. Teste as mudanças no ambiente de desenvolvimento

## 9. Exemplos Práticos

### Exemplo 1: Prefeitura de Pato Branco

```typescript
export const prefeituraConfig = {
  nome: "Prefeitura Municipal de Pato Branco",
  cidade: "Pato Branco",
  estado: "PR",
  logo: "/logo-pato-branco.png",
  cores: {
    primaria: "#1e40af",
    secundaria: "#3b82f6",
    destaque: "#fbbf24",
    fundoGradiente: {
      de: "#eff6ff",
      para: "#dbeafe",
    },
  },
  contato: {
    telefone: "(46) 3220-1500",
    email: "coleta@patobranco.pr.gov.br",
    site: "https://www.patobranco.pr.gov.br",
  },
};
```

### Exemplo 2: Prefeitura Genérica com Verde

```typescript
export const prefeituraConfig = {
  nome: "Prefeitura Municipal",
  cidade: "Sua Cidade",
  estado: "PR",
  logo: "/logo-prefeitura.png",
  cores: {
    primaria: "#16a34a",
    secundaria: "#059669",
    destaque: "#f59e0b",
    fundoGradiente: {
      de: "#f0fdf4",
      para: "#dcfce7",
    },
  },
  contato: {
    telefone: "(00) 0000-0000",
    email: "coleta@prefeitura.gov.br",
    site: "https://www.prefeitura.gov.br",
  },
};
```
