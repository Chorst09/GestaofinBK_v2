# 🔧 Solução: Google Drive não funciona em Localhost

## O Problema

- ✅ Funciona em produção: `https://chorstconsult.com.br`
- ❌ Não funciona em desenvolvimento: `http://localhost:3000`

## A Causa

O Google OAuth está configurado apenas para o domínio de produção. Você precisa adicionar `localhost` nas origens autorizadas.

## Solução (2 minutos)

### Passo 1: Adicionar Localhost no OAuth

1. **Acesse:** https://console.cloud.google.com/apis/credentials

2. **Clique** no seu **OAuth 2.0 Client ID** (não na API Key)

3. Em **"Authorized JavaScript origins"**, clique em **"+ ADD URI"** e adicione:
   ```
   http://localhost:3000
   ```

4. Em **"Authorized redirect URIs"**, clique em **"+ ADD URI"** e adicione:
   ```
   http://localhost:3000
   ```

5. **Clique em "SAVE"** (Salvar)

### Passo 2: Testar

1. **Aguarde 1-2 minutos** (as alterações demoram para propagar)
2. **Recarregue a página** do localhost (F5)
3. **Clique em "Entrar com Google"**
4. Deve funcionar! ✅

## Configuração Final Recomendada

Seu OAuth 2.0 Client ID deve ter:

### Authorized JavaScript origins:
```
http://localhost:3000
https://chorstconsult.com.br
```

### Authorized redirect URIs:
```
http://localhost:3000
https://chorstconsult.com.br
```

## Nota Importante

- Você pode ter **múltiplas origens** autorizadas
- Isso permite que o mesmo OAuth funcione em dev e produção
- Não precisa criar credenciais separadas

## Alternativa: Usar Credenciais Diferentes

Se preferir separar dev e produção:

1. Crie um **novo OAuth 2.0 Client ID** para desenvolvimento
2. Configure apenas com `http://localhost:3000`
3. Use variáveis de ambiente diferentes:
   - `.env.local` (dev) → credenciais de dev
   - `.env.production` (prod) → credenciais de produção

Mas a solução mais simples é adicionar localhost nas credenciais existentes! 😊
