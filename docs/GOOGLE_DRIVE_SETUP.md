# Configuração do Google Drive (Opcional)

## ⚠️ Importante

O backup no Google Drive é **totalmente opcional**. O sistema funciona perfeitamente sem ele, salvando todos os dados localmente no navegador.

## 🔧 Solução Rápida para Erros Comuns

### Erro: "API discovery response missing required field"

**Causa:** A Google Drive API não está habilitada no seu projeto.

**Solução:**
1. Acesse diretamente: https://console.cloud.google.com/apis/library/drive.googleapis.com
2. Selecione seu projeto
3. Clique em **"ATIVAR"** ou **"ENABLE"**
4. Aguarde a ativação (pode levar alguns segundos)
5. Recarregue a página do Finanças Zen

### Erro: "Falha ao conectar com o Google Drive"

**Causa:** Credenciais incorretas ou APIs não habilitadas.

**Solução:**
1. Verifique se as variáveis no `.env.local` estão corretas
2. Certifique-se de que habilitou as APIs (veja seção abaixo)
3. Recarregue a página após fazer alterações

---

## Por que configurar?

- Backup automático na nuvem
- Sincronização entre dispositivos
- Recuperação de dados em caso de perda

## Como configurar

### 1. Criar projeto no Google Cloud

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Anote o nome do projeto

### 2. Habilitar APIs necessárias

1. No menu lateral, vá em "APIs & Services" → "Library"
2. Procure e habilite:
   - **Google Drive API**
   - **Google People API** (para perfil do usuário)

### 3. Criar credenciais OAuth 2.0

1. Vá em "APIs & Services" → "Credentials"
2. Clique em "Create Credentials" → "OAuth client ID"
3. Se solicitado, configure a "OAuth consent screen":
   - User Type: External
   - App name: Finanças Zen
   - User support email: seu email
   - Developer contact: seu email
   - Scopes: não precisa adicionar nenhum
   - Test users: adicione seu email
4. Volte para "Credentials" e crie o OAuth client ID:
   - Application type: Web application
   - Name: Finanças Zen Web Client
   - Authorized JavaScript origins:
     - `http://localhost:3000` (desenvolvimento)
     - `https://seu-dominio.com` (produção)
   - Authorized redirect URIs: deixe vazio
5. Clique em "Create"
6. Copie o **Client ID** que aparece

### 4. Criar API Key

1. Ainda em "Credentials", clique em "Create Credentials" → "API key"
2. Copie a **API Key** gerada
3. (Opcional) Clique em "Restrict Key" para adicionar restrições:
   - Application restrictions: HTTP referrers
   - Website restrictions: adicione `localhost:3000/*` e seu domínio
   - API restrictions: Restrict key → selecione "Google Drive API"

### 5. Configurar variáveis de ambiente

1. Copie o arquivo `.env.local.example` para `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edite `.env.local` e adicione suas credenciais:
   ```env
   NEXT_PUBLIC_GOOGLE_API_KEY=sua_api_key_aqui
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu_client_id_aqui.apps.googleusercontent.com
   ```

3. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

### 6. Testar

1. Abra o aplicativo em `http://localhost:3000`
2. Vá em "Configurações"
3. Clique em "Fazer Login com Google"
4. Autorize o aplicativo
5. Seus dados serão automaticamente sincronizados

## Solução de Problemas

### Erro: "Cliente Google não inicializado"

**Causa:** Credenciais não configuradas ou inválidas

**Solução:**
1. Verifique se o arquivo `.env.local` existe
2. Confirme que as variáveis estão corretas
3. Reinicie o servidor (`npm run dev`)
4. Limpe o cache do navegador

### Erro: "redirect_uri_mismatch"

**Causa:** URL não autorizada

**Solução:**
1. Vá em Google Cloud Console → Credentials
2. Edite seu OAuth client ID
3. Adicione `http://localhost:3000` em "Authorized JavaScript origins"
4. Salve e aguarde alguns minutos

### Erro: "Access blocked: This app's request is invalid"

**Causa:** OAuth consent screen não configurado

**Solução:**
1. Configure a OAuth consent screen
2. Adicione seu email como test user
3. Publique o app (ou mantenha em teste)

### Erro de permissão ao salvar

**Causa:** Escopo insuficiente

**Solução:**
1. Faça logout do Google Drive
2. Faça login novamente
3. Autorize todas as permissões solicitadas

## Desabilitar Google Drive

Se você não quer usar o Google Drive:

1. Simplesmente não configure as variáveis de ambiente
2. O sistema funcionará normalmente com armazenamento local
3. Nenhum erro será exibido

## Segurança

- As credenciais são armazenadas apenas no navegador
- O token de acesso expira automaticamente
- Você pode revogar o acesso a qualquer momento em [Google Account](https://myaccount.google.com/permissions)

## Produção

Para deploy em produção:

1. Adicione o domínio de produção nas "Authorized JavaScript origins"
2. Configure as variáveis de ambiente no seu provedor de hospedagem
3. Publique o OAuth consent screen (se necessário)

## Suporte

Se tiver problemas:
1. Verifique o console do navegador (F12)
2. Consulte a [documentação do Google](https://developers.google.com/identity/protocols/oauth2)
3. Abra uma issue no GitHub
