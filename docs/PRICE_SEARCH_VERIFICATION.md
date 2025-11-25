# Verificação - Pesquisa de Preços Web + IA

## Arquivos Implementados

### 1. Frontend
- ✅ `src/app/renovations/[id]/price-search/page.tsx`
  - Interface de pesquisa
  - Chama pesquisa web
  - Chama pesquisa com IA
  - Exibe resultados

### 2. API Routes
- ✅ `src/app/api/price-search/web/route.ts`
  - Pesquisa web
  - Filtra produtos
  - Calcula estatísticas

- ✅ `src/app/api/price-search/ai-insights/route.ts`
  - Gera insights com IA
  - Usa OpenAI se disponível
  - Fallback para insights locais

### 3. Service
- ✅ `src/lib/price-search-service.ts`
  - Funções auxiliares
  - Estados brasileiros
  - Cidades por estado

## Fluxo de Execução

### Passo 1: Acessar Pesquisa de Preços
```
Reforma → Clique em "Pesquisa de Preços"
↓
/renovations/[id]/price-search
```

### Passo 2: Preencher Formulário
```
Nome do Produto: "Cimento"
Estado: "SP"
Cidade: "São Paulo"
Clique em "Pesquisar Preços"
```

### Passo 3: Pesquisa Web
```
Frontend → POST /api/price-search/web
↓
Busca produtos no banco de dados
↓
Filtra por critérios
↓
Calcula estatísticas
↓
Retorna resultados
```

### Passo 4: Pesquisa com IA (Paralela)
```
Frontend → POST /api/price-search/ai-insights
↓
Verifica chave OpenAI
↓
Se disponível:
  • Chama OpenAI API
  • Gera insights inteligentes
Senão:
  • Gera insights locais
↓
Retorna insights
```

### Passo 5: Exibir Resultados
```
Frontend recebe:
  • Resultados da pesquisa web
  • Insights da pesquisa com IA
↓
Exibe tudo junto na interface
```

## Checklist de Verificação

### Arquivos
- [ ] `src/app/renovations/[id]/price-search/page.tsx` existe
- [ ] `src/app/api/price-search/web/route.ts` existe
- [ ] `src/app/api/price-search/ai-insights/route.ts` existe
- [ ] `src/lib/price-search-service.ts` existe

### Endpoints
- [ ] POST `/api/price-search/web` funciona
- [ ] POST `/api/price-search/ai-insights` funciona

### Funcionalidades
- [ ] Pesquisa web retorna produtos
- [ ] Pesquisa com IA retorna insights
- [ ] Fallback local funciona sem IA
- [ ] Filtros funcionam (preço, qualidade, localização)

### Interface
- [ ] Formulário de pesquisa aparece
- [ ] Botão "Pesquisar Preços" funciona
- [ ] Resultados aparecem
- [ ] Insights aparecem (com ou sem IA)
- [ ] Estatísticas aparecem

## Testando Manualmente

### Teste 1: Pesquisa Web
```bash
curl -X POST http://localhost:3000/api/price-search/web \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Cimento",
    "state": "SP",
    "city": "São Paulo"
  }'
```

**Resultado esperado:**
```json
{
  "query": { ... },
  "results": [ ... ],
  "totalResults": 2,
  "averagePrice": 33.75,
  "lowestPrice": 32.00,
  "highestPrice": 35.50,
  "aiInsights": ""
}
```

### Teste 2: Pesquisa com IA
```bash
curl -X POST http://localhost:3000/api/price-search/ai-insights \
  -H "Content-Type: application/json" \
  -d '{
    "query": { "productName": "Cimento", "state": "SP", "city": "São Paulo" },
    "results": [ ... ],
    "averagePrice": 33.75,
    "lowestPrice": 32.00,
    "highestPrice": 35.50
  }'
```

**Resultado esperado (com IA):**
```json
{
  "insights": "Melhor custo-benefício: Votorantim CP II-Z-32 a R$ 32,00..."
}
```

**Resultado esperado (sem IA):**
```json
{
  "insights": "📊 Encontrados 2 produtos. 💰 Economize até 10% escolhendo Votorantim..."
}
```

### Teste 3: Interface
1. Acesse uma reforma
2. Clique em "Pesquisa de Preços"
3. Digite "Cimento"
4. Clique em "Pesquisar Preços"
5. Verifique se:
   - Produtos aparecem
   - Insights aparecem
   - Estatísticas aparecem

## Logs de Debug

### No Terminal (npm run dev)

**Pesquisa Web:**
```
[Web Search] Pesquisando produtos: Cimento
[Web Search] Encontrados 2 produtos
```

**Pesquisa com IA:**
```
[AI Search] Gerando insights para: Cimento
[AI Search] Chave OpenAI disponível: true
[AI Search] Gerando insights com OpenAI...
[OpenAI] Status da resposta: 200
[AI Search] Insights gerados com sucesso
```

**Fallback Local:**
```
[AI Search] Chave OpenAI não configurada, usando fallback local
```

## Troubleshooting

### Problema: Nenhum resultado aparece
1. Verifique se o servidor está rodando
2. Verifique os logs do servidor
3. Tente pesquisar por "Cimento"
4. Verifique se o estado e cidade estão corretos

### Problema: Erro 404 na pesquisa
1. Verifique se os endpoints existem
2. Verifique se o servidor foi reiniciado
3. Verifique os logs do servidor

### Problema: Insights não aparecem
1. Verifique se a chave OpenAI está configurada
2. Verifique se o servidor foi reiniciado
3. Verifique os logs do servidor
4. Insights locais devem aparecer como fallback

## Próximas Etapas

1. Testar em produção
2. Adicionar cache de resultados
3. Adicionar histórico de pesquisas
4. Integrar com APIs reais (Mercado Livre, OLX)
5. Adicionar alertas de preço
