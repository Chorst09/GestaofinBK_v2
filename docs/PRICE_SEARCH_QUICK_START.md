# Pesquisa de Preços com IA - Guia Rápido

## ✅ Implementação Completa

A pesquisa de preços com IA foi implementada com sucesso! Funciona em dois modos:

### Modo 1: Local (Padrão - Sem Configuração)

Funciona imediatamente sem nenhuma configuração adicional.

**Resultado:**
```
📊 Encontrados 2 produtos. 💰 Economize até 10% escolhendo Votorantim. 
⭐ Melhor avaliação: Itaú (4.5 estrelas).
```

### Modo 2: IA (Com OpenAI - Opcional)

Para ativar insights inteligentes com IA:

## Passo 1: Obter Chave da OpenAI

1. Acesse: https://platform.openai.com/api-keys
2. Clique em "Create new secret key"
3. Copie a chave (começa com `sk-`)

## Passo 2: Configurar Variável de Ambiente

Abra `.env.local` e adicione:

```bash
OPENAI_API_KEY=sk-your-api-key-here
```

## Passo 3: Reiniciar o Servidor

```bash
npm run dev
```

## Passo 4: Testar

1. Acesse uma reforma
2. Clique em "Pesquisa de Preços"
3. Digite um produto (ex: "Cimento")
4. Clique em "Pesquisar Preços"

## Resultado com IA

```
Melhor custo-benefício: Votorantim CP II-Z-32 a R$ 32,00 oferece excelente 
relação qualidade-preço. Economize 10% em relação ao Itaú. Para máxima 
durabilidade, considere o Itaú com 4.5 estrelas de avaliação.
```

## Produtos Disponíveis para Teste

- **Cimento Portland** - R$ 32,00 a R$ 35,50
- **Tinta Acrílica** - R$ 65,00 a R$ 85,00
- **Piso Cerâmico** - R$ 45,00 a R$ 120,00
- **Telha Cerâmica** - R$ 2,50 a R$ 3,20

## Arquitetura

```
Frontend (price-search/page.tsx)
    ↓
Service (price-search-service.ts)
    ↓
API Route (/api/price-search/ai-insights)
    ↓
OpenAI API (se configurado)
    ↓
Insights com IA ou Fallback Local
```

## Endpoints

### 1. Pesquisa de Preços
```
POST /api/price-search
```

### 2. Gerar Insights com IA
```
POST /api/price-search/ai-insights
```

## Testando via cURL

### Sem IA (Modo Local):
```bash
curl -X POST http://localhost:3000/api/price-search \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Cimento",
    "state": "SP",
    "city": "São Paulo"
  }'
```

### Com IA (Com OpenAI):
Mesmo comando, mas com `OPENAI_API_KEY` configurado no `.env.local`

## Troubleshooting

### Problema: Insights aparecem com emojis em vez de IA

**Solução:**
1. Verifique se `OPENAI_API_KEY` está em `.env.local`
2. Reinicie o servidor: `npm run dev`
3. Verifique se a chave é válida em https://platform.openai.com/api-keys

### Problema: Erro "Unauthorized"

**Solução:**
1. Gere uma nova chave em https://platform.openai.com/api-keys
2. Atualize `.env.local`
3. Reinicie o servidor

### Problema: Nenhum produto encontrado

**Solução:**
1. Tente outro produto (Cimento, Tinta, Piso, Telha)
2. Verifique se o estado e cidade estão corretos
3. Tente expandir a faixa de preço

## Custos

- **gpt-3.5-turbo**: ~$0.0005 por requisição (recomendado)
- **gpt-4**: ~$0.03 por requisição
- **gpt-4-turbo**: ~$0.01 por requisição

## Próximas Melhorias

- [ ] Cache de resultados
- [ ] Histórico de pesquisas
- [ ] Alertas de preço
- [ ] Integração com APIs reais (Mercado Livre, OLX)
- [ ] Comparação de preços ao longo do tempo

## Documentação Completa

- `docs/PRICE_SEARCH_AI_SETUP.md` - Configuração detalhada
- `docs/PRICE_SEARCH_EXAMPLES.md` - Exemplos de uso
- `docs/PRICE_SEARCH_TESTING.md` - Guia de testes
