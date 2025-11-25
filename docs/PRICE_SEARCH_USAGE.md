# Guia de Uso - Pesquisa de Preços (Web + IA)

## Como Usar

### Passo 1: Acessar a Pesquisa de Preços

1. Acesse uma reforma
2. Clique em "Pesquisa de Preços"
3. Ou acesse diretamente: `/renovations/[id]/price-search`

### Passo 2: Preencher o Formulário

**Campos Obrigatórios:**
- **Nome do Produto**: Digite o produto que deseja pesquisar
  - Exemplos: "Cimento", "Tinta", "Piso", "Telha"

**Campos Opcionais:**
- **Estado**: Selecione o estado (padrão: SP)
- **Cidade**: Selecione a cidade (padrão: São Paulo)
- **Preço Mínimo**: Defina o preço mínimo desejado
- **Preço Máximo**: Defina o preço máximo desejado

### Passo 3: Executar a Pesquisa

Clique em "Pesquisar Preços" ou pressione Enter

### Passo 4: Analisar os Resultados

A pesquisa retorna:

1. **Insights com IA** (se configurado)
   - Recomendações inteligentes
   - Dicas de economia
   - Análise de qualidade vs preço

2. **Estatísticas**
   - Total de produtos encontrados
   - Preço médio
   - Preço mínimo
   - Preço máximo

3. **Lista de Produtos**
   - Marca e modelo
   - Preço
   - Qualidade
   - Fornecedor
   - Localização
   - Garantia
   - Avaliação
   - Disponibilidade em estoque

## Exemplos de Uso

### Exemplo 1: Pesquisa Simples

**Objetivo**: Encontrar cimento em São Paulo

**Ação**:
1. Digite "Cimento" no campo "Nome do Produto"
2. Deixe Estado como "SP"
3. Deixe Cidade como "São Paulo"
4. Clique em "Pesquisar Preços"

**Resultado**:
- 2 produtos encontrados
- Preço médio: R$ 33,75
- Insights: "📊 Encontrados 2 produtos. 💰 Economize até 10% escolhendo Votorantim..."

### Exemplo 2: Pesquisa com Filtro de Preço

**Objetivo**: Encontrar tinta acrílica econômica

**Ação**:
1. Digite "Tinta Acrílica"
2. Deixe Estado como "SP"
3. Deixe Cidade como "São Paulo"
4. Digite "60" em "Preço Máximo"
5. Clique em "Pesquisar Preços"

**Resultado**:
- 1 produto encontrado (Coral - R$ 65,00 não aparece)
- Apenas produtos até R$ 60

### Exemplo 3: Pesquisa em Outra Cidade

**Objetivo**: Encontrar piso cerâmico em Campinas

**Ação**:
1. Digite "Piso Cerâmico"
2. Deixe Estado como "SP"
3. Selecione "Campinas" em Cidade
4. Clique em "Pesquisar Preços"

**Resultado**:
- Se não encontrar em Campinas, busca em outras cidades
- Mostra todos os produtos disponíveis

## Interpretando os Resultados

### Insights com IA

**Com OpenAI Configurado:**
```
Melhor custo-benefício: Votorantim CP II-Z-32 a R$ 32,00 oferece excelente 
relação qualidade-preço. Economize 10% em relação ao Itaú. Para máxima 
durabilidade, considere o Itaú com 4.5 estrelas de avaliação.
```

**Sem OpenAI (Fallback Local):**
```
📊 Encontrados 2 produtos. 💰 Economize até 10% escolhendo Votorantim. 
⭐ Melhor avaliação: Itaú (4.5 estrelas).
```

### Qualidade dos Produtos

- **Premium**: Produtos de altíssima qualidade
- **Alta**: Produtos de boa qualidade
- **Média**: Produtos de qualidade média
- **Baixa**: Produtos econômicos

### Avaliações

- **4.5+ estrelas**: Excelente
- **4.0-4.4 estrelas**: Muito bom
- **3.5-3.9 estrelas**: Bom
- **Abaixo de 3.5**: Aceitável

## Dicas de Uso

### 1. Pesquise Produtos Específicos
- ✅ "Cimento Portland"
- ✅ "Tinta Acrílica Premium"
- ❌ "Material de construção"

### 2. Use Filtros de Preço
- Defina um intervalo realista
- Considere a qualidade desejada
- Negocie com fornecedores

### 3. Compare Qualidades
- Não escolha apenas pelo preço
- Considere a durabilidade
- Leia as avaliações

### 4. Verifique Disponibilidade
- Produtos com "Em Estoque" estão disponíveis
- Produtos sem indicação podem estar indisponíveis
- Contate o fornecedor para confirmar

### 5. Considere a Localização
- Produtos em São Paulo têm frete menor
- Produtos em outras cidades podem ter frete maior
- Negocie frete com fornecedor

## Integrando com Orçamento

### Passo 1: Pesquisar Preço
1. Acesse "Pesquisa de Preços"
2. Encontre o melhor preço

### Passo 2: Adicionar ao Orçamento
1. Acesse "Materiais"
2. Clique em "Adicionar Material"
3. Digite o nome do produto
4. Digite a quantidade
5. Digite o preço encontrado

### Passo 3: Acompanhar Despesas
1. Acesse "Adicionar Despesa"
2. Registre a compra
3. Acompanhe o orçamento

## Troubleshooting

### Nenhum Produto Encontrado
1. Verifique o nome do produto
2. Tente expandir a faixa de preço
3. Tente pesquisar em outras cidades
4. Verifique se o estado e cidade estão corretos

### Insights com IA Não Aparecem
1. Verifique se `OPENAI_API_KEY` está configurado
2. Reinicie o servidor
3. Verifique os logs do servidor
4. Consulte `docs/PRICE_SEARCH_TROUBLESHOOTING.md`

### Erro na Pesquisa
1. Verifique a conexão com a internet
2. Verifique se o servidor está rodando
3. Tente novamente em alguns minutos
4. Verifique os logs do navegador (F12 > Console)

## Próximas Funcionalidades

- [ ] Salvar pesquisas favoritas
- [ ] Histórico de pesquisas
- [ ] Alertas de preço
- [ ] Comparação de preços ao longo do tempo
- [ ] Integração com e-commerce reais
