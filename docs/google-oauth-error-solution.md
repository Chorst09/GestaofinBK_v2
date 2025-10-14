# Solução para Erro do Google OAuth

## 🚨 **Problema Identificado**

Erro: `redirect_uri_mismatch` - "Acesso bloqueado: a solicitação do app FinaceiroZen é inválida"

## ✅ **Soluções Implementadas**

### **1. Correção de Configuração**
- ✅ **Corrigido** escopo inválido no arquivo `google-calendar/route.ts`
- ✅ **Removido** URL incorreta dos escopos OAuth
- ✅ **Criado** arquivo `.env.local.example` com instruções claras

### **2. Componente de Diagnóstico**
- ✅ **Criado** `GoogleOAuthDiagnostic` component
- ✅ **Adicionado** à página de configurações
- ✅ **Verificação automática** de:
  - Variáveis de ambiente
  - Bibliotecas do Google
  - Conectividade com APIs
  - URL de origem

### **3. Documentação Completa**
- ✅ **Criado** guia completo: `docs/google-oauth-setup-guide.md`
- ✅ **Instruções passo-a-passo** para configuração
- ✅ **Troubleshooting** para erros comuns

## 🔧 **Como Resolver o Erro**

### **Passo 1: Identifique a URL Correta**
1. Acesse `/settings` no seu app
2. Na seção "Diagnóstico do Google OAuth", veja a URL detectada
3. Copie a URL exata (ex: `http://localhost:3000`)

### **Passo 2: Configure no Google Cloud Console**
1. Acesse: [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Encontre sua credencial "ID do cliente OAuth 2.0"
3. Clique para editar
4. Adicione a URL em **AMBAS** as seções:
   - ✅ **Origens JavaScript autorizadas**
   - ✅ **URIs de redirecionamento autorizados**

### **Passo 3: Configure Variáveis de Ambiente**
Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_GOOGLE_API_KEY="sua_api_key_aqui"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="seu_client_id_aqui"
```

### **Passo 4: Verifique com o Diagnóstico**
1. Acesse `/settings`
2. Execute o "Diagnóstico do Google OAuth"
3. Corrija qualquer problema identificado

## 🎯 **URLs Específicas para Configurar**

### **Desenvolvimento Local:**
```
http://localhost:3000
```

### **Produção (exemplo):**
```
https://seudominio.com
```

## 🔍 **Verificação Rápida**

### **No Google Cloud Console, certifique-se de que:**
- [ ] Projeto correto selecionado
- [ ] Credencial é do tipo "Aplicativo da Web"
- [ ] URL está em "Origens JavaScript autorizadas"
- [ ] URL está em "URIs de redirecionamento autorizados"
- [ ] APIs necessárias estão habilitadas:
  - [ ] Google Drive API
  - [ ] Google People API

### **No seu projeto, certifique-se de que:**
- [ ] Arquivo `.env.local` existe e está configurado
- [ ] Variáveis não contêm valores de exemplo
- [ ] Não há espaços extras nas configurações

## 🆘 **Se o Problema Persistir**

1. **Aguarde 5-10 minutos** após mudanças no Google Cloud
2. **Limpe o cache** do navegador ou use aba anônima
3. **Execute o diagnóstico** na página de configurações
4. **Verifique os logs** do navegador (F12 → Console)
5. **Compare** os valores mostrados no diagnóstico com os do Google Cloud

## 📞 **Suporte Adicional**

O componente de diagnóstico na página `/settings` fornece:
- ✅ Verificação automática de configuração
- ✅ URLs exatas para copiar
- ✅ Links diretos para o Google Cloud Console
- ✅ Instruções específicas para cada erro

## 🎉 **Resultado Esperado**

Após seguir estes passos, você deve conseguir:
- ✅ Fazer login com Google sem erros
- ✅ Usar funcionalidades de backup no Google Drive
- ✅ Integrar com Google Calendar (se configurado)

## 📋 **Checklist Final**

- [ ] URL configurada no Google Cloud Console (ambas as seções)
- [ ] Variáveis de ambiente configuradas no `.env.local`
- [ ] Diagnóstico executado com sucesso
- [ ] Cache do navegador limpo
- [ ] Teste de login realizado