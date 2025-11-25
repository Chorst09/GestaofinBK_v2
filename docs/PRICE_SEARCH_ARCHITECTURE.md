# Arquitetura de Pesquisa de Preços - Web + IA

## Visão Geral

A pesquisa de preços foi refatorada para separar a pesquisa web da pesquisa com IA, permitindo maior flexibilidade e melhor performance.

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│         src/app/renovations/[id]/price-search/page.tsx      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ├─────────────────────────────────────┐
                         │                                     │
                         ▼                                     ▼
        ┌──────────────────────────┐        ┌──────────────────────────┐
        │   Pesquisa Web           │        │   Pesquisa com IA        │
        │  /api/price-search/web   │        │ /api/price-search/ai-... │
        │                          │        │                          │
        │ • Busca produtos         │        │ • Gera insights          │
        │ • Filtra por critérios   │        │ • Usa OpenAI             │
        │ • Calcula estatísticas   │        │ • Fallback local         │
        └──────────────────────────┘        └──────────────────────────┘
                         │                                     │
                         └─────────────────────────────────────┘
                                     │
                                     ▼
                    ┌──────────────────────────────┐
                    │   Resultado Combinado        │
                    │  (Produtos + Insights)       │
                    └──────────────────────────────┘
```

## Endpoints

### 1. Pesquisa Web
```
POST /api/price-search/web
```

**Responsabilidade:**
- Buscar produtos no banco de dados
- Filtrar por critérios (preço, qualidade, localização)
- Calcular estatísticas (média, mínimo, máximo)

**Request:**
```json
{
  "productName": "Cimento",
  "state": "SP",
  "city": "São Paulo",
  "minPrice": 30,
  "maxPrice": 40,
  "quality": "high"
}
```

**Response:**
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

### 2. Pesquisa com IA
```
POST /api/price-search/ai-insights
```

**Responsabilidade:**
- Receber resultados da pesquisa web
- Gerar insights inteligentes com OpenAI
- Fallback para insights locais se IA não disponível

**Request:**
```json
{
  "query": { ... },
  "results": [ ... ],
  "averagePrice": 33.75,
  "lowestPrice": 32.00,
  "highestPrice": 35.50
}
```

**Response:**
```json
{
  "insights": "Melhor custo-benefício: Votorantim CP II-Z-32 a R$ 32,00..."
}
```

## Fluxo de Execução

### Passo 1: Pesquisa Web
```
Frontend → POST /api/price-search/web
           ↓
           Busca produtos
           ↓
           Filtra por critérios
           ↓
           Calcula estatísticas
           ↓
           Retorna resultados
```

### Passo 2: Pesquisa com IA (Paralela)
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

### Passo 3: Combinação de Resultados
```
Frontend recebe:
  • Resultados da pesquisa web
  • Insights da pesquisa com IA
  ↓
  Exibe tudo junto na interface
```

## Vantagens da Arquitetura

### 1. Separação de Responsabilidades
- Cada endpoint tem uma responsabilidade clara
- Fácil de testar e manter
- Fácil de escalar

### 2. Flexibilidade
- Pesquisa web funciona sem IA
- IA é opcional
- Fácil adicionar novas fontes de dados

### 3. Performance
- Pesquisa web é rápida
- IA é chamada em paralelo
- Não bloqueia a interface

### 4. Resiliência
- Se IA falhar, web search continua funcionando
- Fallback local para insights
- Tratamento de erros robusto

## Logs de Debug

### Pesquisa Web
```
[Web Search] Pesquisando produtos: Cimento
[Web Search] Nenhum resultado na cidade, buscando em outras cidades...
[Web Search] Encontrados 2 produtos
```

### Pesquisa com IA
```
[AI Search] Gerando insights para: Cimento
[AI Search] Chave OpenAI disponível: true
[AI Search] Gerando insights com OpenAI...
[OpenAI] Enviando requisição para OpenAI...
[OpenAI] Status da resposta: 200
[OpenAI] Insights gerados com sucesso
[AI Search] Insights gerados com sucesso
```

## Próximas Melhorias

### Curto Prazo
- [ ] Cache de resultados
- [ ] Histórico de pesquisas
- [ ] Alertas de preço

### Médio Prazo
- [ ] Integração com Mercado Livre API
- [ ] Integração com OLX API
- [ ] Integração com APIs de lojas

### Longo Prazo
- [ ] Machine Learning para recomendações
- [ ] Comparação de preços ao longo do tempo
- [ ] Análise de tendências de mercado

## Configuração

### Variáveis de Ambiente

```bash
# Obrigatório para IA
OPENAI_API_KEY=sk-proj-...

# Opcional para futuras integrações
MERCADO_LIVRE_API_KEY=
OLX_API_KEY=
```

## Testes

### Testar Pesquisa Web
```bash
curl -X POST http://localhost:3000/api/price-search/web \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Cimento",
    "state": "SP",
    "city": "São Paulo"
  }'
```

### Testar Pesquisa com IA
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

## Monitoramento

### Métricas Importantes
- Tempo de resposta da pesquisa web
- Tempo de resposta da IA
- Taxa de sucesso da IA
- Taxa de fallback para insights locais

### Alertas
- Pesquisa web falhando
- IA indisponível
- Taxa de erro alta
