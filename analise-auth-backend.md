# Análise dos Endpoints de Autenticação - Backend Java

## Endpoints Identificados

### 1. Cadastro de Morador
**Endpoint**: `POST /api/usuarios/morador`
**Descrição**: Endpoint público para cadastro de novos moradores no sistema

**Request Body**:
```json
{
  "nome": "João Silva",
  "email": "joao.silva@email.com",
  "cpf": "12345678901",
  "telefone": "46999887766",
  "endereco": "Rua das Flores",
  "numero": "123",
  "bairro": "Centro",
  "cep": "85503000",
  "latitude": -26.2289,
  "longitude": -52.6783
}
```

**Response 201** (Sucesso):
```json
{
  "id": 0,
  "nome": "string",
  "username": "string",
  "email": "string",
  "telefone": "string",
  "ativo": true,
  "endereco": "string",
  "numero": "string",
  "bairro": "string",
  "cep": "string",
  "latitude": 0.0,
  "longitude": 0.0,
  "roles": ["ROLE_SUPER_ADMIN"],
  "enabled": true,
  "authorities": [{"authority": "string"}],
  "authoritiesStrings": ["string"],
  "username": "string"
}
```

**Response 400**: Dados inválidos ou usuário já cadastrado

---

### 2. Solicitar Código OTP
**Endpoint**: `POST /api/auth/solicitar-codigo`
**Descrição**: Solicita um código OTP para autenticação (enviado por email)

**Request Body**:
```json
{
  "email": "joao.silva@email.com"
}
```

**Response**: Código OTP enviado para o email

---

### 3. Login com OTP
**Endpoint**: `POST /api/auth/login-otp`
**Descrição**: Autentica um usuário usando email + código OTP

**Request Body**:
```json
{
  "email": "joao.silva@email.com",
  "codigo": "123456"
}
```

**Response** (Sucesso):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao.silva@email.com",
    "roles": ["ROLE_MORADOR"]
  }
}
```

---

### 4. Meu Perfil
**Endpoint**: `GET /api/usuarios/meu-perfil`
**Descrição**: Retorna dados do usuário autenticado
**Autenticação**: Requer token JWT no header `Authorization: Bearer {token}`

---

## Fluxo de Autenticação

1. **Novo Usuário**:
   - Cadastro via `POST /api/usuarios/morador`
   - Solicita código via `POST /api/auth/solicitar-codigo`
   - Login via `POST /api/auth/login-otp`
   - Recebe token JWT

2. **Usuário Existente**:
   - Solicita código via `POST /api/auth/solicitar-codigo`
   - Login via `POST /api/auth/login-otp`
   - Recebe token JWT

3. **Requisições Autenticadas**:
   - Incluir header: `Authorization: Bearer {token}`
   - Endpoints protegidos validam o token

---

## Roles Disponíveis

- `ROLE_SUPER_ADMIN`: Acesso total ao sistema
- `ROLE_ADMIN_CONSULTA`: Acesso de consulta
- `ROLE_MORADOR`: Acesso para moradores (consulta de coleta)
- `ROLE_APP_ANDROID`: Acesso para aplicativo Android (motoristas)

---

## Observações

- Autenticação via OTP (código temporário enviado por email)
- Não usa senha tradicional
- Token JWT para manter sessão
- Cadastro de morador já inclui endereço completo com coordenadas
