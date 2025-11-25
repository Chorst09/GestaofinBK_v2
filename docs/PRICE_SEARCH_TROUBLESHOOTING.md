# Troubleshooting - Pesquisa de Preços com IA

## Problema: IA não está funcionando mesmo com chave configurada

### Passo 1: Verificar se a Chave está Configurada

Abra `.env.local` e verifique:

```bash
OPENAI_API_KEY=sk-proj-...
```

A chave deve:
- Começar com `sk-proj-` ou `sk-`
- Ter pelo menos 40 caracteres
- Não ter espaços em branco

### Passo 2: Reiniciar o Servidor

**IMPORTANTE**: Após adicionar a chave, você DEVE reiniciar o servidor:

```bash
# Parar o servidor (Ctrl+C)
# Depois reiniciar:
npm run dev
```

### Passo 3: Verificar os Logs do Servidor

Quando você faz uma pesquisa, procure por mensagens como:

```
[AI Insights] Chave OpenAI disponível: true
[AI Insights] Gerando insights com OpenAI...
[OpenAI] Enviando requisição para OpenAI...
[OpenAI] Status da resposta: 200
[OpenAI] Insights gerados com sucesso
```

Se ver `false` em "Chave OpenAI disponível", significa que a chave não foi lida.

### Passo 4: Verificar a Validade da Chave

1. Acesse: https://platform.openai.com/api-keys
2. Verifique se a chave está ativa (não expirada)
3. Verifique se há saldo na conta

### Passo 5: Testar via cURL

```bash
curl -X POST http://localhost:3000/api/price-search/ai-insights \
  -H "Content-Type: application/json" \
  -d '{
    "query": {
      "productName": "Cimento",
      "state": "SP",
      "city": "São Paulo"
    },
    "results": [
      {
        "id": "1",
        "productName": "Cimento Portland",
        "brand": "Itaú",
        "model": "CP II-Z-32",
        "price": 35.50,
        "quality": "high",
        "warranty": "12 meses",
        "supplier": "Materiais de Construção Silva",
        "location": { "state": "SP", "city": "São Paulo" },
        "lastUpdated": "2024-01-01T00:00:00Z",
        "rating": 4.5,
        "inStock": true
      }
    ],
    "averagePrice": 35.50,
    "lowestPrice": 35.50,
    "highestPrice": 35.50
  }'
```

## Erros Comuns

### Erro 1: "Unauthorized" (401)

**Causa**: Chave da OpenAI é inválida ou expirou

**Solução**:
1. Gere uma nova chave em https://platform.openai.com/api-keys
2. Atualize `.env.local`
3. Reinicie o servidor

### Erro 2: "Rate limit exceeded"

**Causa**: Muitas requisições à OpenAI em pouco tempo

**Solução**:
1. Aguarde alguns minutos
2. Verifique seu plano na OpenAI
3. Considere usar o modo local

### Erro 3: "Invalid request"

**Causa**: Formato da requisição está incorreto

**Solução**:
1. Verifique se todos os campos obrigatórios estão presentes
2. Verifique se os tipos de dados estão corretos
3. Verifique os logs do servidor

### Erro 4: "Resposta vazia da OpenAI"

**Causa**: OpenAI retornou resposta sem conteúdo

**Solução**:
1. Verifique se a chave é válida
2. Verifique se há saldo na conta
3. Tente novamente em alguns minutos

## Verificar Logs Detalhados

### No Terminal (npm run dev)

Procure por linhas que começam com:
- `[AI Insights]` - Logs do endpoint de IA
- `[OpenAI]` - Logs da chamada à OpenAI

### Exemplo de Logs Bem-Sucedidos:

```
[AI Insights] Chave OpenAI disponível: true
[AI Insights] Gerando insights com OpenAI...
[OpenAI] Enviando requisição para OpenAI...
[OpenAI] Produto: Cimento
[OpenAI] Chave configurada: sk-proj-...
[OpenAI] Status da resposta: 200
[OpenAI] Resposta recebida: { choices: [ { message: { content: '...' } } ] }
[OpenAI] Insights gerados com sucesso
[AI Insights] Insights gerados com sucesso
```

### Exemplo de Logs com Erro:

```
[AI Insights] Chave OpenAI disponível: false
[AI Insights] Chave OpenAI não configurada, usando fallback local
```

## Checklist de Verificação

- [ ] Chave OpenAI está em `.env.local`
- [ ] Chave começa com `sk-proj-` ou `sk-`
- [ ] Servidor foi reiniciado após adicionar a chave
- [ ] Chave é válida em https://platform.openai.com/api-keys
- [ ] Há saldo na conta OpenAI
- [ ] Logs mostram "Chave OpenAI disponível: true"
- [ ] Logs mostram "Status da resposta: 200"

## Modo Debug

Para ativar modo debug mais detalhado, adicione ao `.env.local`:

```bash
DEBUG=*
```

Depois reinicie o servidor.

## Contato com Suporte OpenAI

Se o problema persistir:

1. Acesse: https://help.openai.com
2. Verifique o status da API: https://status.openai.com
3. Abra um ticket de suporte

## Alternativa: Usar Modo Local

Se a IA não funcionar, o sistema continua funcionando com insights locais:

```
📊 Encontrados 2 produtos. 💰 Economize até 10% escolhendo Votorantim. 
⭐ Melhor avaliação: Itaú (4.5 estrelas).
```

Isso é suficiente para a maioria dos casos de uso.
