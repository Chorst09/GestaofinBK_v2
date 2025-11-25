# Testando a Pesquisa de Preços com IA

## Visão Geral

A pesquisa de preços agora funciona com dois modos:

1. **Modo Local** (padrão): Insights gerados localmente com emojis
2. **Modo IA** (com OpenAI): Insights inteligentes gerados por IA

## Modo Local (Sem Configuração)

O sistema funciona imediatamente sem nenhuma configuração adicional.

### Como Testar:

1. Acesse uma reforma
2. Clique em "Pesquisa de Preços"
3. Digite um produto (ex: "Cimento", "Tinta", "Piso")
4. Selecione estado e cidade
5. Clique em "Pesquisar Preços"

### Resultado Esperado:

```
📊 Encontrados 2 produtos. 💰 Economize até 10% escolhendo Votorantim. 
⭐ Melhor avaliação: Itaú (4.5 estrelas).
```

## Modo IA (Com OpenAI)

Para ativar insights com IA, configure a chave da OpenAI.

### Passo 1: Obter Chave da OpenAI

1. Acesse [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Faça login ou crie uma conta
3. Clique em "Create new secret key"
4. Copie a chave

### Passo 2: Configurar Variável de Ambiente

Adicione ao `.env.local`:

```bash
OPENAI_API_KEY=sk-your-api-key-here
```

### Passo 3: Reiniciar o Servidor

```bash
npm run dev
```

### Passo 4: Testar

1. Acesse uma reforma
2. Clique em "Pesquisa de Preços"
3. Digite um produto
4. Clique em "Pesquisar Preços"

### Resultado Esperado com IA:

```
Melhor custo-benefício: Votorantim CP II-Z-32 a R$ 32,00 oferece excelente relação 
qualidade-preço. Economize 10% em relação ao Itaú. Para máxima durabilidade, 
considere o Itaú com 4.5 estrelas de avaliação.
```

## Testando via cURL

### Teste Sem IA (Modo Local):

```bash
curl -X POST http://localhost:3000/api/price-search \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Cimento",
    "state": "SP",
    "city": "São Paulo"
  }'
```

**Resposta:**

```json
{
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
    },
    {
      "id": "2",
      "productName": "Cimento Portland",
      "brand": "Votorantim",
      "model": "CP II-Z-32",
      "price": 32.00,
      "quality": "medium",
      "warranty": "12 meses",
      "supplier": "Construção Rápida",
      "location": { "state": "SP", "city": "São Paulo" },
      "lastUpdated": "2024-01-01T00:00:00Z",
      "rating": 4.0,
      "inStock": true
    }
  ],
  "totalResults": 2,
  "averagePrice": 33.75,
  "lowestPrice": 32.00,
  "highestPrice": 35.50,
  "aiInsights": "📊 Encontrados 2 produtos. 💰 Economize até 10% escolhendo Votorantim. ⭐ Melhor avaliação: Itaú (4.5 estrelas)."
}
```

### Teste Com IA (Com OpenAI):

Mesmo comando, mas com `OPENAI_API_KEY` configurado:

```bash
OPENAI_API_KEY=sk-your-key curl -X POST http://localhost:3000/api/price-search \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Cimento",
    "state": "SP",
    "city": "São Paulo"
  }'
```

**Resposta com IA:**

```json
{
  "query": { ... },
  "results": [ ... ],
  "totalResults": 2,
  "averagePrice": 33.75,
  "lowestPrice": 32.00,
  "highestPrice": 35.50,
  "aiInsights": "Melhor custo-benefício: Votorantim CP II-Z-32 a R$ 32,00 oferece excelente relação qualidade-preço. Economize 10% em relação ao Itaú. Para máxima durabilidade, considere o Itaú com 4.5 estrelas de avaliação."
}
```

## Testando via JavaScript

```javascript
async function testPriceSearch() {
  const response = await fetch('/api/price-search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      productName: 'Cimento',
      state: 'SP',
      city: 'São Paulo',
    }),
  });

  const data = await response.json();
  
  console.log('Total de produtos:', data.totalResults);
  console.log('Preço médio:', data.averagePrice);
  console.log('Insights:', data.aiInsights);
  
  // Listar produtos
  data.results.forEach(product => {
    console.log(`${product.brand} - R$ ${product.price}`);
  });
}

testPriceSearch();
```

## Testando via Python

```python
import requests
import json

url = 'http://localhost:3000/api/price-search'
payload = {
    'productName': 'Cimento',
    'state': 'SP',
    'city': 'São Paulo'
}

response = requests.post(url, json=payload)
data = response.json()

print(f"Total de produtos: {data['totalResults']}")
print(f"Preço médio: R$ {data['averagePrice']:.2f}")
print(f"Preço mínimo: R$ {data['lowestPrice']:.2f}")
print(f"Preço máximo: R$ {data['highestPrice']:.2f}")
print(f"\nInsights:\n{data['aiInsights']}")

print("\nProdutos encontrados:")
for product in data['results']:
    print(f"- {product['brand']} {product['model']}: R$ {product['price']:.2f}")
```

## Troubleshooting

### Problema: Insights aparecem com emojis em vez de IA

**Causa**: Chave da OpenAI não está configurada ou é inválida

**Solução**:
1. Verifique se `OPENAI_API_KEY` está em `.env.local`
2. Verifique se a chave é válida em [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
3. Reinicie o servidor: `npm run dev`

### Problema: Erro "Unauthorized" ao usar IA

**Causa**: Chave da OpenAI é inválida ou expirou

**Solução**:
1. Gere uma nova chave em [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Atualize `.env.local`
3. Reinicie o servidor

### Problema: Erro "Rate limit exceeded"

**Causa**: Muitas requisições à OpenAI em pouco tempo

**Solução**:
1. Aguarde alguns minutos
2. Verifique seu plano na OpenAI
3. Considere usar o modo local

### Problema: Nenhum produto encontrado

**Causa**: Produto não existe na base de dados

**Solução**:
1. Tente outro produto (ex: "Cimento", "Tinta", "Piso", "Telha")
2. Verifique se o estado e cidade estão corretos
3. Tente expandir a faixa de preço

## Produtos Disponíveis para Teste

- **Cimento Portland**: Itaú, Votorantim
- **Tinta Acrílica**: Suvinil, Coral
- **Piso Cerâmico**: Portinari, Brasital
- **Telha Cerâmica**: Brasital, Imiporcelana

## Logs do Servidor

Para ver logs detalhados, verifique o console do servidor:

```bash
npm run dev
```

Procure por mensagens como:
- `Erro ao gerar insights com IA:` - Indica erro na chamada à OpenAI
- `Usando insights locais` - Indica fallback para modo local

## Próximas Melhorias

- [ ] Cache de resultados
- [ ] Histórico de pesquisas
- [ ] Alertas de preço
- [ ] Integração com APIs reais (Mercado Livre, OLX)
- [ ] Comparação de preços ao longo do tempo
