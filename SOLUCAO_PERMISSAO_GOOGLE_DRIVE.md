# Solução: Erro de Permissão no Google Drive

## Erro Atual
```
PERMISSION_DENIED: O aplicativo não tem o acesso necessário ao Google Drive.
Requests to this API drive method google.apps.drive.v3.DriveFiles.List are blocked.
```

## Causa
A **Google Drive API não está habilitada** no projeto GestaoFinBK ou você não concedeu as permissões necessárias durante o login.

---

## ✅ Solução Passo a Passo

### 1. Habilitar a Google Drive API

1. Acesse: https://console.cloud.google.com/apis/library/drive.googleapis.com
2. **Selecione o projeto "GestaoFinBK"** no topo da página
3. Clique no botão **"ATIVAR"** (Enable)
4. Aguarde alguns segundos até a API ser ativada

### 2. Verificar as Permissões OAuth

1. Acesse: https://console.cloud.google.com/apis/credentials/consent
2. Certifique-se de que está no projeto **GestaoFinBK**
3. Verifique se o app está configurado:
   - **Tipo**: Externo (External)
   - **Status**: Em teste ou Publicado
4. Em **"Escopos"** (Scopes), verifique se tem:
   - `.../auth/drive.appdata` (acesso à pasta privada do app)
   - `.../auth/userinfo.profile`
   - `.../auth/userinfo.email`

### 3. Adicionar Usuário de Teste (se o app estiver em modo teste)

Se o app estiver em **"Modo de Teste"**:

1. Vá em: https://console.cloud.google.com/apis/credentials/consent
2. Role até **"Usuários de teste"**
3. Clique em **"+ ADD USERS"**
4. Adicione seu email: `chorstconsult@gmail.com`
5. Clique em **"Salvar"**

### 4. Revogar e Fazer Login Novamente

No aplicativo:

1. Clique em **"Sair"** (se estiver logado)
2. Vá em: https://myaccount.google.com/permissions
3. Encontre **"Finanças Zen"** na lista
4. Clique em **"Remover acesso"**
5. Volte ao aplicativo
6. Clique em **"Entrar com Google"**
7. **IMPORTANTE**: Na tela de permissões, marque TODAS as caixas:
   - ✅ Ver informações básicas do perfil
   - ✅ Ver seu endereço de email
   - ✅ Ver e gerenciar dados de configuração do aplicativo no Google Drive

---

## 🔍 Verificação Rápida

Execute este checklist:

- [ ] Google Drive API está **ATIVADA** no projeto GestaoFinBK
- [ ] Tela de consentimento OAuth está configurada
- [ ] Seu email está nos **usuários de teste** (se em modo teste)
- [ ] Você **revogou** o acesso antigo
- [ ] Você fez **novo login** e aceitou TODAS as permissões

---

## 🚀 Teste Final

Após seguir todos os passos:

1. Reinicie o servidor: `npm run dev`
2. Abra o navegador em modo anônimo
3. Faça login com Google
4. Aceite todas as permissões
5. Teste criar um backup manual

---

## ⚠️ Nota Importante

O erro `403 PERMISSION_DENIED` significa que a API está bloqueada. Isso acontece quando:
- A API não foi habilitada no projeto
- O usuário não está na lista de teste (modo teste)
- As permissões não foram concedidas durante o login
