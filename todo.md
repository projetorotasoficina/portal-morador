# Projeto TODO - Rotas Morador Web

## Funcionalidades Principais

- [x] Configurar schema de banco de dados para moradores
- [x] Implementar integração com backend (endpoints /agenda-coleta e /historico-coleta)
- [x] Criar tela de login para moradores
- [x] Implementar autenticação separada do painel administrativo
- [x] Desenvolver tela "Minha Coleta" com informações do endereço
- [x] Exibir dias e períodos de coleta previstos
- [x] Mostrar última data/hora que o caminhão passou
- [x] Implementar mensagem "O caminhão ainda não passou hoje"
- [x] Garantir design responsivo e de fácil leitura
- [x] Testar integração completa com backend

## Personalização

- [x] Adicionar sistema de personalização de cores da prefeitura
- [x] Adicionar suporte para logo personalizado da prefeitura
- [x] Criar arquivo de configuração para personalização
- [x] Preparar documentação de personalização
- [x] Preparar arquivos para download

## Controle de Acesso

- [x] ~~Bloquear administradores de criar perfil de morador~~ (Removido)
- [x] ~~Adicionar validação de role no backend~~ (Removido)
- [x] ~~Exibir mensagem apropriada para admins no frontend~~ (Removido)
- [x] Permitir que administradores também usem o portal do morador
- [x] Remover validações de role do backend
- [x] Remover bloqueios do frontend
- [x] Remover componente AdminBlockedMessage
- [x] Atualizar documentação

## Integração com Backend Java

- [x] Analisar endpoints do backend (agenda-coleta e historico-coleta)
- [x] Criar cliente HTTP para comunicação com backend
- [x] Configurar variável de ambiente BACKEND_API_URL
- [x] Substituir dados mockados por chamadas reais
- [x] Testar integração com backend em produção
- [x] Adicionar tratamento de erros de conexão
- [x] Criar documentação de integração (INTEGRACAO_BACKEND.md)

## Busca Automática de Endereço

- [x] Integrar API ViaCEP para busca de endereço por CEP
- [x] Implementar geocoding com Nominatim (OpenStreetMap)
- [x] Adicionar preenchimento automático de latitude/longitude
- [x] Adicionar loading states durante busca
- [x] Adicionar tratamento de erros (CEP inválido, endereço não encontrado)

## Personalização Pato Branco - PR

- [x] Adicionar logo da Prefeitura de Pato Branco
- [x] Configurar cores institucionais (azul e vermelho)
- [x] Atualizar arquivo de configuração para Pato Branco
- [x] Adicionar validação para permitir apenas moradores de Pato Branco
- [x] Bloquear cadastro de outras cidades no frontend
- [x] Adicionar validação de cidade no backend
- [x] Testar validação de cidade

## Adaptação de Layout

- [x] Analisar layout do site oficial (patobranco.pr.gov.br)
- [x] Identificar cores, tipografia e componentes principais
- [x] Adaptar header com logo e menu
- [x] Adaptar footer com informações da prefeitura
- [x] Ajustar paleta de cores para seguir identidade visual (azul ciano + azul marinho)
- [x] Implementar componentes no padrão do site oficial
- [x] Testar responsividade
- [x] Atualizar todas as páginas com novo layout

## Autenticação Própria

- [x] Criar serviço de autenticação (client/src/services/auth.ts)
- [x] Criar hook useAuth personalizado
- [x] Criar tela de cadastro com integração ao backend
- [x] Criar tela de login com email + código OTP
- [x] Implementar armazenamento de token JWT no localStorage
- [x] Integrar com endpoints do backend Java (/api/usuarios/morador, /api/auth/solicitar-codigo, /api/auth/login-otp)
- [x] Atualizar rotas no App.tsx
- [ ] Atualizar página Home para usar nova autenticação
- [ ] Atualizar página Profile para usar nova autenticação
- [ ] Remover dependências do tRPC/OAuth Manus
- [ ] Testar fluxo completo: cadastro → login → consulta agenda

## Finalização da Integração

- [x] Atualizar página Home para usar autenticação própria (remover tRPC)
- [x] Atualizar página Profile para usar autenticação própria (remover tRPC)
- [x] Criar serviço para consulta de agenda e histórico de coleta
- [ ] Remover dependências do tRPC e OAuth Manus (manter por compatibilidade)
- [x] Testar fluxo completo de autenticação

## Validação de CPF

- [x] Instalar biblioteca cpf-cnpj-validator
- [x] Adicionar validação de CPF no formulário de cadastro
- [x] Adicionar validação de CPF no formulário de perfil
- [x] Adicionar máscara de CPF nos inputs
- [x] Criar hook useCPFValidation

## Seleção de Localização no Mapa

- [x] Instalar biblioteca react-leaflet para OpenStreetMap
- [x] Criar componente de mapa interativo (MapPicker)
- [x] Adicionar seleção de ponto no mapa
- [x] Atualizar formulário de perfil com mapa
- [x] Sincronizar coordenadas do mapa com campos de lat/lng
- [x] Adicionar botão para mostrar/ocultar mapa

## Correções de Conflitos

- [x] Remover arquivo antigo client/src/_core/hooks/useAuth.ts
- [x] Simplificar client/src/const.ts para remover dependências do OAuth
- [x] Verificar e corrigir todas as importações de useAuth
- [x] Corrigir Header.tsx, DashboardLayout.tsx e main.tsx
- [x] Testar projeto localmente sem erros
- [x] Reiniciar servidor e verificar funcionamento

## Limpeza Final para ZIP

- [x] Verificar se client/src/_core/hooks/useAuth.ts foi removido
- [x] Verificar se não há outras referências ao OAuth Manus
- [x] Remover pasta _core/hooks vazia
- [x] Criar ZIP limpo (rotas-morador-web-final.zip)
- [x] Testar servidor funcionando sem erros

## Correção de Cadastro

- [x] Atualizar interface CadastroMoradorData com campos obrigatórios
- [x] Ajustar validação de CPF (11 dígitos sem formatação)
- [x] Ajustar validação de CEP (8 dígitos sem formatação)
- [x] Garantir que latitude e longitude sejam enviadas como Double
- [x] Remover formatação de CPF e CEP antes de enviar ao backend
- [ ] Testar cadastro completo end-to-end
