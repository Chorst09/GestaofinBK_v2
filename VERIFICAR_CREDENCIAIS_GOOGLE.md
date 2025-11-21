# 🔍 Verificação de Credenciais do Google

## Problema Atual

A Google Drive API está ativada, mas ainda há erro de conexão (502 Bad Gateway ou erro de discovery).

## Possíveis Causas

### 1. Restrições na API Key

A API Key pode estar com restrições que bloqueiam o uso.

**Como verificar:**

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Clique na sua **API Key** (não no OAuth Client ID)
3. Verifique a seção **"Application restrictions"**:
   - Se estiver como "HTTP referrers", adicione:
     - `http://localhost:3000/*`
     - `http://localhost:3000`
     - Seu domínio de produção (se aplicável)
   - **Recomendado:** Deixe como "None" durante testes

4. Verifique a seção **"API restrictions"**:
   - Se estiver como "Restrict key", certifique-se que inclui:
     - ✅ Google Drive API
     - ✅ Google People API (opcional, para perfil)
   - **Recomendado:** Deixe como "Don't restrict key" durante testes

5. **Clique em "SAVE"** (Salvar)

### 2. Origens JavaScript não autorizadas no OAuth

**Como verificar:**

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Clique no seu **OAuth 2.0 Client ID**
3. Em **"Authorized JavaScript origins"**, adicione:
   - `http://localhost:3000`
   - Seu domínio de produção (ex: `https://seuapp.com`)

4. Em **"Authorized redirect URIs"**, adicione:
   - `http://localhost:3000`
   - Seu domínio de produção

5. **Clique em "SAVE"**

### 3. Projeto em Modo de Teste

Se o OAuth está em "Testing" mode, apenas usuários de teste podem fazer login.

**Como verificar:**

1. Acesse: https://console.cloud.google.com/apis/credentials/consent
2. Verifique o **"Publishing status"**
3. Se estiver "Testing":
   - Adicione seu email em "Test users"
   - OU publique o app clicando em "PUBLISH APP"

## Teste Rápido

Após fazer as alterações acima:

1. **Aguarde 1-2 minutos** (as alterações podem demorar para propagar)
2. **Limpe o cache do navegador** (Ctrl+Shift+Delete)
3. **Recarregue a página** do Finanças Zen
4. **Tente fazer login novamente**

## Configuração Recomendada para Desenvolvimento

### API Key
```
Application restrictions: None
API restrictions: Don't restrict key
```

### OAuth 2.0 Client ID
```
Application type: Web application
Authorized JavaScript origins:
  - http://localhost:3000

Authorized redirect URIs:
  - http://localhost:3000
```

### OAuth Consent Screen
```
Publishing status: Testing
Test users: [seu email]
```

## Ainda com Erro 502?

Se ainda estiver com erro 502 (Bad Gateway), pode ser:

1. **Problema temporário do Google** - Aguarde alguns minutos e tente novamente
2. **Firewall/Proxy** - Verifique se sua rede não está bloqueando o acesso ao Google APIs
3. **Extensões do navegador** - Desabilite extensões de bloqueio (AdBlock, Privacy Badger, etc)

## Teste sem Google Drive

Lembre-se: o sistema funciona perfeitamente sem Google Drive! Para testar:

1. Não faça login no Google Drive
2. Use o sistema normalmente
3. Todos os dados são salvos localmente no navegador
4. Você pode configurar o Google Drive depois

## Debug Avançado

Para ver mais detalhes do erro, abra o Console do navegador (F12) e procure por:

- Mensagens de erro em vermelho
- Erros relacionados a "gapi" ou "google"
- Status codes (401, 403, 502, etc)

Copie e cole os erros para análise mais detalhada.
