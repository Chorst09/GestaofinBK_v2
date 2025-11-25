# Configuração da Pesquisa de Preços com IA

## Visão Geral

O sistema de pesquisa de preços agora suporta integração com IA (OpenAI) para gerar insights inteligentes sobre preços de materiais de construção.

## Funcionalidades

### 1. Pesquisa de Preços Básica
- Busca por nome do produto
- Filtro por estado e cidade
- Filtro por faixa de preço
- Filtro por qualidade

### 2. Insights com IA
- Análise automática de preços
- Recomendações de custo-benefício
- Dicas de economia
- Comparação de qualidade vs preço

### 3. Estatísticas
- Preço médio
- Preço mínimo
- Preço máximo
- Total de opções disponíveis

## Configuração

### Sem IA (Modo Padrão)

O sistema funciona perfeitamente sem configuração adicional. Ele usa insights gerados localmente com emojis e recomendações básicas.

### Com IA (OpenAI)

Para ativar insights com IA, adicione sua chave da OpenAI ao `.env.local`:

```bash
OPENAI_API_KEY=sk-your-api-key-here
```

#### Como obter a chave:

1. Acesse [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Faça login ou crie uma conta
3. Clique em "Create new secret key"
4. Copie a chave e adicione ao `.env.local`

#### Modelos suportados:
- `gpt-3.5-turbo` (padrão, mais rápido e barato)
- `gpt-4` (mais preciso, mais caro)
- `gpt-4-turbo` (balanço entre velocidade e precisão)

## Como Usar

### 1. Acessar a Pesquisa de Preços

Na página de detalhes de uma reforma, clique em "Pesquisa de Preços" ou acesse:
```
/renovations/[id]/price-search
```

### 2. Preencher o Formulário

- **Nome do Produto**: Digite o produto que deseja pesquisar (ex: "Cimento", "Tinta", "Piso")
- **Estado**: Selecione o estado (ex: SP, RJ, MG)
- **Cidade**: Selecione a cidade
- **Preço Mínimo** (opcional): Defina o preço mínimo desejado
- **Preço Máximo** (opcional): Defina o preço máximo desejado

### 3. Executar a Pesquisa

Clique em "Pesquisar Preços" ou pressione Enter

### 4. Analisar os Resultados

Os resultados mostram:
- **Insights com IA**: Recomendações inteligentes (se configurado)
- **Estatísticas**: Preço médio, mínimo e máximo
- **Lista de Produtos**: Detalhes de cada opção encontrada

## Estrutura da API

### Endpoint

```
POST /api/price-search
```

### Request

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

### Response

```json
{
  "query": { ... },
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
  "totalResults": 1,
  "averagePrice": 35.50,
  "lowestPrice": 35.50,
  "highestPrice": 35.50,
  "aiInsights": "📊 Encontrados 1 produtos. ⭐ Melhor avaliação: Itaú (4.5 estrelas)."
}
```

## Tipos de Qualidade

- `premium`: Produtos de alta qualidade com garantia estendida
- `high`: Produtos de boa qualidade
- `medium`: Produtos de qualidade média
- `low`: Produtos econômicos

## Troubleshooting

### Nenhum produto encontrado

1. Verifique se o nome do produto está correto
2. Tente expandir a faixa de preço
3. Tente pesquisar em outras cidades
4. Verifique se o estado e cidade estão corretos

### Insights com IA não aparecem

1. Verifique se a chave da OpenAI está configurada corretamente
2. Verifique se há saldo na sua conta OpenAI
3. Verifique os logs do servidor para erros
4. O sistema usará insights locais como fallback

### Erro de API

1. Verifique a conexão com a internet
2. Verifique se o servidor está rodando
3. Verifique os logs do navegador (F12 > Console)

## Custos

### OpenAI

- **gpt-3.5-turbo**: ~$0.0005 por requisição
- **gpt-4**: ~$0.03 por requisição
- **gpt-4-turbo**: ~$0.01 por requisição

Recomendamos usar `gpt-3.5-turbo` para melhor custo-benefício.

## Próximas Melhorias

- [ ] Integração com Mercado Livre API
- [ ] Integração com OLX API
- [ ] Cache de resultados
- [ ] Histórico de pesquisas
- [ ] Alertas de preço
- [ ] Comparação de preços ao longo do tempo
