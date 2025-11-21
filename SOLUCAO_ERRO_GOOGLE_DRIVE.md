# 🔧 Solução para o Erro do Google Drive

## O Problema

Você está vendo este erro:
```
API discovery response missing required field
Falha ao conectar com o Google Drive
```

## A Causa

A **Google Drive API não está habilitada** no seu projeto do Google Cloud Console.

## A Solução (3 minutos)

### Passo 1: Habilitar a Google Drive API

1. **Clique neste link:** https://console.cloud.google.com/apis/library/drive.googleapis.com

2. **Selecione seu projeto** no topo da página (o mesmo projeto onde você criou as credenciais OAuth)

3. **Clique no botão "ATIVAR"** (ou "ENABLE" se estiver em inglês)

4. **Aguarde** alguns segundos até ver a mensagem de confirmação

### Passo 2: Habilitar a Google People API (para perfil do usuário)

1. **Clique neste link:** https://console.cloud.google.com/apis/library/people.googleapis.com

2. **Selecione seu projeto**

3. **Clique em "ATIVAR"**

### Passo 3: Testar

1. **Recarregue a página** do Finanças Zen (F5 ou Ctrl+R)

2. **Clique em "Entrar com Google"**

3. Agora deve funcionar! ✅

## Verificação Rápida

Para confirmar que as APIs estão habilitadas:

1. Acesse: https://console.cloud.google.com/apis/dashboard
2. Selecione seu projeto
3. Você deve ver "Google Drive API" e "Google People API" na lista de APIs habilitadas

## Ainda com Problemas?

Se ainda estiver com erro, verifique:

### 1. Credenciais no .env.local

Abra o arquivo `.env.local` e confirme que tem:

```env
NEXT_PUBLIC_GOOGLE_API_KEY=sua_chave_aqui
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu_client_id_aqui
```

### 2. Origens JavaScript Autorizadas

No Google Cloud Console:
1. Vá em "APIs & Services" → "Credentials"
2. Clique na sua credencial OAuth 2.0
3. Em "Authorized JavaScript origins", adicione:
   - `http://localhost:3000` (para desenvolvimento)
   - Seu domínio de produção (se aplicável)

### 3. URIs de Redirecionamento Autorizados

Na mesma página de credenciais:
1. Em "Authorized redirect URIs", adicione:
   - `http://localhost:3000` (para desenvolvimento)
   - Seu domínio de produção (se aplicável)

## Nota Importante

O sistema **funciona perfeitamente sem o Google Drive**! Todos os dados são salvos localmente no navegador. O backup no Google Drive é apenas uma funcionalidade extra para:
- Sincronizar entre dispositivos
- Ter backup na nuvem
- Recuperar dados se limpar o navegador

Se preferir, pode continuar usando apenas o armazenamento local. 😊
