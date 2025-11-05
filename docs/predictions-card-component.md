# Componente Card de Previsões

## Descrição
O componente `PredictionsCard` é um card independente criado para a seção de previsões que permite aos usuários configurar e visualizar previsões específicas de gastos.

## Funcionalidades

### Tipos de Previsões
- **Gastos Semanais**: Gastos médios por semana
- **Final de Semana**: Gastos extras nos fins de semana  
- **Alimentação**: Gastos mensais com alimentação
- **Combustível**: Gastos mensais com combustível

### Características
- ✅ **Edição In-line**: Permite editar valores diretamente no card
- ✅ **Persistência Local**: Salva os dados no localStorage do navegador
- ✅ **Cálculo Automático**: Calcula automaticamente a projeção mensal
- ✅ **Interface Intuitiva**: Design limpo com ícones e cores diferenciadas
- ✅ **Responsivo**: Funciona bem em desktop e mobile

### Cálculo da Projeção Mensal
```
Total Mensal = (Gastos Semanais × 4) + (Final de Semana × 4) + Alimentação + Combustível
```

## Localização
- **Componente**: `src/components/forecasts/predictions-card.tsx`
- **Página**: Integrado na página `/forecasts` entre os gráficos e a seção de gerenciamento

## Como Usar
1. Acesse a página de **Previsões** (`/forecasts`)
2. Localize o card "Previsões de Gastos"
3. Clique em **Editar** para configurar os valores
4. Insira os valores para cada categoria
5. Clique em **Salvar** para persistir as configurações
6. Visualize a projeção mensal calculada automaticamente

## Tecnologias Utilizadas
- React com TypeScript
- Componentes UI do shadcn/ui
- localStorage para persistência
- Lucide React para ícones
- Tailwind CSS para estilização

## Independência
Este componente é completamente independente dos outros componentes de previsão existentes:
- Não interfere com `ForecastForm`
- Não afeta `ForecastedCardSpendingChart`
- Não modifica `ForecastedCategorySpendingChart`
- Mantém seus próprios dados e estado