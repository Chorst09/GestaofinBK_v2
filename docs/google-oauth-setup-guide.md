# Guia de Configuração do Google OAuth

Este guia ajuda a resolver o erro "redirect_uri_mismatch" e configurar corretamente a autenticação com Google.

## 🚨 **Erro Atual: redirect_uri_mismatch**

O erro indica que a URL do seu aplicativo não está autorizada no Google Cloud Console.

### **URL Atual do Aplicativo:**
- **Desenvolvimento:** `http://localhost:3000`
- **Produção:** Depende de onde você hospedou o app

## 🔧 **Como Corrigir - Passo a Passo**

### **1. Identifique a URL Correta**
1. Acesse a página de **Configurações** do seu app
2. Na seção "Debug do Google OAuth", copie a **"URL de Origem do Aplicativo"**
3. Esta é a URL exata que você precisa configurar no Google Cloud

### **2. Configure no Google Cloud Console**

1. **Acesse:** [Google Cloud Console](https://console.cloud.google.com/)
2. **Selecione** seu projeto (ou crie um novo)
3. **Navegue para:** APIs e Serviços → Credenciais
4. **Encontre** sua credencial "ID do cliente OAuth 2.0"
5. **Clique** para editar

### **3. Adicione as URLs Necessárias**

Você precisa adicionar a URL em **DUAS** seções:

#### **A) Origens JavaScript autorizadas:**
```
http://localhost:3000
```
(Para desenvolvimento)

#### **B) URIs de redirecionamento autorizados:**
```
http://localhost:3000
```
(Para desenvolvimento)

### **4. Para Produção**
Se você já fez deploy, adicione também:
```
https://seudominio.com
```

## 📋 **Configuração Completa**

### **Variáveis de Ambiente Necessárias:**

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_API_KEY="sua_api_key_aqui"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="seu_client_id_aqui"

# Para API do Google Calendar (opcional)
GOOGLE_CLIENT_SECRET="seu_client_secret_aqui"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/google-calendar"
```

### **Como Obter as Credenciais:**

1. **Google API Key:**
   - No Google Cloud Console
   - APIs e Serviços → Credenciais
   - Criar Credenciais → Chave de API

2. **Google Client ID:**
   - No Google Cloud Console
   - APIs e Serviços → Credenciais
   - Criar Credenciais → ID do cliente OAuth 2.0
   - Tipo: Aplicativo da Web

3. **Google Client Secret:**
   - Mesmo local do Client ID
   - Aparece após criar a credencial OAuth 2.0

## 🔍 **Verificação e Debug**

### **1. Teste a Configuração:**
1. Acesse `/settings` no seu app
2. Verifique se o "Client ID Sendo Usado" está correto
3. Copie a "URL de Origem do Aplicativo"
4. Confirme se está nas configurações do Google Cloud

### **2. Erros Comuns:**

#### **"redirect_uri_mismatch"**
- ✅ **Solução:** Adicionar URL nas duas listas do Google Cloud
- ❌ **Erro comum:** Adicionar apenas em uma lista

#### **"invalid_client"**
- ✅ **Solução:** Verificar se Client ID está correto
- ❌ **Erro comum:** Espaços extras ou caracteres incorretos

#### **"access_denied"**
- ✅ **Solução:** Publicar o app no Google Cloud (sair do modo teste)
- ❌ **Erro comum:** Deixar app em "Modo de Teste"

## 🚀 **APIs Necessárias**

Certifique-se de que estas APIs estão habilitadas no Google Cloud:

1. **Google Drive API** (para backup)
2. **Google Calendar API** (se usar integração)
3. **Google People API** (para informações do usuário)

### **Como Habilitar:**
1. Google Cloud Console
2. APIs e Serviços → Biblioteca
3. Pesquise e habilite cada API

## 📱 **Configuração da Tela de Consentimento**

1. **Acesse:** APIs e Serviços → Tela de consentimento OAuth
2. **Configure:**
   - Nome do aplicativo: "FinanceiroZen"
   - Email de suporte: seu email
   - Domínio autorizado: seu domínio (se tiver)
3. **Escopos necessários:**
   - `https://www.googleapis.com/auth/drive.file`
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/userinfo.email`

## ✅ **Checklist Final**

- [ ] Client ID configurado no `.env.local`
- [ ] API Key configurada no `.env.local`
- [ ] URLs adicionadas em "Origens JavaScript autorizadas"
- [ ] URLs adicionadas em "URIs de redirecionamento autorizados"
- [ ] APIs necessárias habilitadas
- [ ] Tela de consentimento configurada
- [ ] App publicado (se necessário para outros usuários)

## 🆘 **Ainda com Problemas?**

1. **Verifique os logs** do navegador (F12 → Console)
2. **Teste em aba anônima** (para limpar cache)
3. **Aguarde alguns minutos** após mudanças no Google Cloud
4. **Verifique se não há espaços** extras nas configurações

## 📞 **Suporte**

Se o problema persistir:
1. Acesse a página de Configurações do app
2. Use a seção "Debug do Google OAuth"
3. Compare os valores mostrados com os do Google Cloud Console
4. Certifique-se de que tudo está EXATAMENTE igual