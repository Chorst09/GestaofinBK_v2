# Exemplos de Uso - Pesquisa de Preços

## Exemplos de Produtos Disponíveis

O sistema vem com dados de exemplo para os seguintes produtos:

### 1. Cimento Portland
- **Marcas**: Itaú, Votorantim
- **Preços**: R$ 32,00 - R$ 35,50
- **Qualidade**: Medium a High
- **Localização**: São Paulo, SP

### 2. Tinta Acrílica
- **Marcas**: Suvinil, Coral
- **Preços**: R$ 65,00 - R$ 85,00
- **Qualidade**: Medium a High
- **Localização**: São Paulo, SP

### 3. Piso Cerâmico
- **Marcas**: Portinari, Brasital
- **Preços**: R$ 45,00 - R$ 120,00
- **Qualidade**: Low to High
- **Localização**: São Paulo, SP

### 4. Telha Cerâmica
- **Marcas**: Brasital, Imiporcelana
- **Preços**: R$ 2,50 - R$ 3,20
- **Qualidade**: Medium to High
- **Localização**: São Paulo, SP

## Exemplos de Pesquisa

### Exemplo 1: Pesquisa Simples

**Objetivo**: Encontrar cimento em São Paulo

**Parâmetros**:
```json
{
  "productName": "Cimento",
  "state": "SP",
  "city": "São Paulo"
}
```

**Resultado Esperado**:
- 2 produtos encontrados
- Preço médio: R$ 33,75
- Preço mínimo: R$ 32,00
- Preço máximo: R$ 35,50

**Insights com IA**:
```
📊 Encontrados 2 produtos. 💰 Economize até 10% escolhendo Votorantim. 
⭐ Melhor avaliação: Itaú (4.5 estrelas).
```

### Exemplo 2: Pesquisa com Filtro de Preço

**Objetivo**: Encontrar tinta acrílica econômica

**Parâmetros**:
```json
{
  "productName": "Tinta Acrílica",
  "state": "SP",
  "city": "São Paulo",
  "maxPrice": 70
}
```

**Resultado Esperado**:
- 1 produto encontrado (Coral)
- Preço: R$ 65,00
- Qualidade: Medium

**Insights com IA**:
```
📊 Encontrados 1 produtos. ⭐ Melhor avaliação: Coral (4.2 estrelas).
```

### Exemplo 3: Pesquisa por Qualidade

**Objetivo**: Encontrar piso cerâmico premium

**Parâmetros**:
```json
{
  "productName": "Piso Cerâmico",
  "state": "SP",
  "city": "São Paulo",
  "quality": "high"
}
```

**Resultado Esperado**:
- 1 produto encontrado (Portinari)
- Preço: R$ 120,00
- Qualidade: High
- Rating: 4.7 estrelas

**Insights com IA**:
```
📊 Encontrados 1 produtos. ⭐ Melhor avaliação: Portinari (4.7 estrelas). 
✨ Opções premium: Portinari.
```

### Exemplo 4: Pesquisa com Faixa de Preço

**Objetivo**: Encontrar telhas em faixa de preço específica

**Parâmetros**:
```json
{
  "productName": "Telha",
  "state": "SP",
  "city": "São Paulo",
  "minPrice": 2.50,
  "maxPrice": 3.00
}
```

**Resultado Esperado**:
- 1 produto encontrado (Brasital)
- Preço: R$ 2,50
- Qualidade: Medium

## Testando com cURL

### Teste Básico

```bash
curl -X POST http://localhost:3000/api/price-search \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Cimento",
    "state": "SP",
    "city": "São Paulo"
  }'
```

### Teste com Filtros

```bash
curl -X POST http://localhost:3000/api/price-search \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Tinta",
    "state": "SP",
    "city": "São Paulo",
    "minPrice": 60,
    "maxPrice": 80,
    "quality": "high"
  }'
```

## Testando com JavaScript

```javascript
async function searchPrices() {
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
  console.log('Resultados:', data);
  console.log('Insights:', data.aiInsights);
}

searchPrices();
```

## Testando com Python

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
print(f"Insights: {data['aiInsights']}")
```

## Casos de Uso Reais

### Caso 1: Reforma de Cozinha

**Objetivo**: Encontrar materiais para reforma de cozinha em São Paulo

**Pesquisas Recomendadas**:
1. Cimento (para base)
2. Tinta Acrílica (para pintura)
3. Piso Cerâmico (para piso)
4. Telha Cerâmica (se necessário)

**Fluxo**:
1. Pesquisar cada material
2. Comparar preços e qualidades
3. Adicionar os melhores custo-benefício ao orçamento
4. Registrar as despesas conforme compra

### Caso 2: Reforma de Telhado

**Objetivo**: Encontrar telhas para reforma de telhado

**Pesquisas Recomendadas**:
1. Telha Cerâmica (produto principal)
2. Cimento (para fixação)

**Fluxo**:
1. Pesquisar telhas por qualidade
2. Calcular quantidade necessária
3. Comparar fornecedores
4. Negociar preço por volume

## Dicas de Economia

1. **Compare Qualidades**: Nem sempre a mais cara é a melhor
2. **Faixa de Preço**: Use filtros para encontrar opções econômicas
3. **Insights com IA**: Leia as recomendações para melhor custo-benefício
4. **Ratings**: Considere as avaliações de outros clientes
5. **Fornecedores**: Cadastre fornecedores confiáveis para futuras compras

## Próximas Funcionalidades

- [ ] Histórico de pesquisas
- [ ] Salvar pesquisas favoritas
- [ ] Alertas de preço
- [ ] Comparação de preços ao longo do tempo
- [ ] Integração com APIs reais de e-commerce
