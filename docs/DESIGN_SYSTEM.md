# Sistema de Design - Finanças Zen

## 🎨 Paleta de Cores Moderna

### Modo Claro
- **Primary**: Azul vibrante moderno (#3B82F6)
- **Accent**: Verde moderno (#16A34A)
- **Background**: Fundo suave e limpo
- **Cards**: Branco puro com sombras sutis

### Modo Escuro
- **Primary**: Azul brilhante (#60A5FA)
- **Accent**: Verde vibrante (#16A34A)
- **Background**: Azul escuro rico
- **Cards**: Preto profundo com bordas sutis

## 🎭 Componentes Modernos

### ModernCard
Card com animações e efeitos visuais aprimorados.

```tsx
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from '@/components/ui/modern-card'

<ModernCard variant="gradient" hover animate>
  <ModernCardHeader>
    <ModernCardTitle>Título</ModernCardTitle>
  </ModernCardHeader>
  <ModernCardContent>
    Conteúdo do card
  </ModernCardContent>
</ModernCard>
```

**Variantes:**
- `default`: Card padrão
- `gradient`: Card com gradiente sutil no hover
- `glass`: Efeito glassmorphism
- `bordered`: Borda com gradiente

### StatCard
Card de estatística com ícone e animações.

```tsx
import { StatCard } from '@/components/ui/stat-card'
import { DollarSign } from 'lucide-react'

<StatCard
  title="Receitas"
  value="R$ 5.000,00"
  description="Total do mês"
  icon={DollarSign}
  variant="success"
  trend={{ value: 12, label: "vs mês anterior" }}
/>
```

**Variantes:**
- `default`: Padrão
- `success`: Verde (receitas, positivo)
- `warning`: Amarelo (atenção)
- `error`: Vermelho (despesas, negativo)
- `info`: Azul (informação)

## ✨ Animações

### Classes de Animação
```tsx
// Fade in com movimento vertical
<div className="animate-fade-in">...</div>

// Slide in horizontal
<div className="animate-slide-in">...</div>

// Scale in (zoom)
<div className="animate-scale-in">...</div>

// Shimmer effect (loading)
<div className="animate-shimmer">...</div>

// Pulse sutil
<div className="animate-pulse-subtle">...</div>

// Float (flutuação)
<div className="animate-float">...</div>
```

### Classes de Card
```tsx
// Card moderno com hover
<div className="card-modern">...</div>

// Card com gradiente
<div className="card-gradient">...</div>

// Efeito glass
<div className="glass-effect">...</div>

// Borda com gradiente
<div className="gradient-border">...</div>

// Card de estatística
<div className="stat-card">...</div>
```

## 🎯 Classes Utilitárias

### Texto com Gradiente
```tsx
<h1 className="gradient-text">Finanças Zen</h1>
```

### Status Colors
```tsx
<div className="status-success">Sucesso</div>
<div className="status-warning">Atenção</div>
<div className="status-error">Erro</div>
<div className="status-info">Info</div>
```

### Botões Modernos
```tsx
<button className="button-modern">Clique aqui</button>
```

### Inputs Modernos
```tsx
<input className="input-modern" />
```

### Badges Modernos
```tsx
<span className="badge-modern">Badge</span>
```

### Scrollbar Customizada
```tsx
<div className="custom-scrollbar overflow-auto">...</div>
```

## 🎨 Cores Adicionais

### Success (Verde)
```tsx
bg-success text-success-foreground
```

### Warning (Amarelo)
```tsx
bg-warning text-warning-foreground
```

### Info (Azul)
```tsx
bg-info text-info-foreground
```

## 📊 Cores de Gráficos

10 cores vibrantes e modernas para gráficos:
- chart-1 a chart-10

```tsx
<div className="bg-chart-1">...</div>
<div className="text-chart-2">...</div>
```

## 🌓 Modo Escuro

Todas as cores se adaptam automaticamente ao modo escuro. Use as variáveis CSS:

```css
hsl(var(--primary))
hsl(var(--accent))
hsl(var(--success))
hsl(var(--warning))
hsl(var(--info))
```

## 💡 Exemplos de Uso

### Dashboard Card
```tsx
<ModernCard variant="gradient" className="animate-fade-in">
  <ModernCardHeader>
    <ModernCardTitle className="gradient-text">
      Dashboard
    </ModernCardTitle>
  </ModernCardHeader>
  <ModernCardContent>
    <div className="grid gap-4">
      <StatCard
        title="Receitas"
        value="R$ 5.000,00"
        icon={DollarSign}
        variant="success"
      />
      <StatCard
        title="Despesas"
        value="R$ 3.000,00"
        icon={CreditCard}
        variant="error"
      />
    </div>
  </ModernCardContent>
</ModernCard>
```

### Lista com Animação
```tsx
{items.map((item, index) => (
  <div 
    key={item.id}
    className="animate-fade-in"
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    {item.content}
  </div>
))}
```

## 🚀 Performance

- Todas as animações usam `transform` e `opacity` para melhor performance
- Transições suaves com `ease-in-out`
- Animações podem ser desabilitadas com `animate={false}`

## 📱 Responsividade

Todos os componentes são totalmente responsivos e se adaptam a diferentes tamanhos de tela.
