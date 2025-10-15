
"use client";

import Link from 'next/link';
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  LogIn, 
  LogOut, 
  BarChart3, 
  CreditCard, 
  TrendingUp, 
  Calendar, 
  Target, 
  PiggyBank, 
  Building2, 
  Car, 
  Upload, 
  Settings,
  Wallet,
  LineChart
} from 'lucide-react';
import { useDataBackup } from '@/hooks/useDataBackup';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

const features = [
  {
    title: 'Dashboard',
    description: 'Visão geral com gráficos e transações recentes.',
    href: '/dashboard',
    icon: BarChart3,
    gradient: 'from-blue-500 to-cyan-500',
    category: 'principal'
  },
  {
    title: 'Transações',
    description: 'Gerencie todas as suas receitas e despesas.',
    href: '/transactions',
    icon: Wallet,
    gradient: 'from-green-500 to-emerald-500',
    category: 'principal'
  },
  {
    title: 'Análise Mensal',
    description: 'Compare seu desempenho financeiro mês a mês.',
    href: '/monthly-analysis',
    icon: LineChart,
    gradient: 'from-purple-500 to-pink-500',
    category: 'principal'
  },
  {
    title: 'Previsões',
    description: 'Planeje seus gastos e receitas futuras.',
    href: '/forecasts',
    icon: Calendar,
    gradient: 'from-orange-500 to-red-500',
    category: 'planejamento'
  },
  {
    title: 'Previsto vs. Realizado',
    description: 'Veja se seu planejamento está alinhado com a realidade.',
    href: '/previsto-vs-realizado',
    icon: Target,
    gradient: 'from-indigo-500 to-purple-500',
    category: 'planejamento'
  },
  {
    title: 'Metas Financeiras',
    description: 'Crie e acompanhe seus objetivos de longo prazo.',
    href: '/financial-goals',
    icon: PiggyBank,
    gradient: 'from-pink-500 to-rose-500',
    category: 'planejamento'
  },
  {
    title: 'Investimentos',
    description: 'Acompanhe seus ativos de renda fixa e variável.',
    href: '/investments',
    icon: TrendingUp,
    gradient: 'from-emerald-500 to-teal-500',
    category: 'investimentos'
  },
  {
    title: 'Contas Bancárias',
    description: 'Cadastre e gerencie suas contas correntes e poupanças.',
    href: '/bank-accounts',
    icon: Building2,
    gradient: 'from-slate-500 to-gray-500',
    category: 'configuracao'
  },
  {
    title: 'Cartões de Crédito',
    description: 'Organize as faturas e limites dos seus cartões.',
    href: '/credit-cards',
    icon: CreditCard,
    gradient: 'from-violet-500 to-purple-500',
    category: 'configuracao'
  },
  {
    title: 'Veículos',
    description: 'Controle os gastos com abastecimento e manutenção.',
    href: '/vehicles',
    icon: Car,
    gradient: 'from-amber-500 to-orange-500',
    category: 'especiais'
  },
  {
    title: 'Importar Dados',
    description: 'Importe transações em massa a partir de arquivos CSV.',
    href: '/import',
    icon: Upload,
    gradient: 'from-cyan-500 to-blue-500',
    category: 'ferramentas'
  },
  {
    title: 'Configurações',
    description: 'Configure backups, temas e outras preferências.',
    href: '/settings',
    icon: Settings,
    gradient: 'from-gray-500 to-slate-500',
    category: 'ferramentas'
  }
];

const categories = {
  principal: { name: 'Principais', description: 'Funcionalidades essenciais do dia a dia' },
  planejamento: { name: 'Planejamento', description: 'Ferramentas para planejar seu futuro financeiro' },
  investimentos: { name: 'Investimentos', description: 'Acompanhe seus investimentos e rentabilidade' },
  configuracao: { name: 'Configuração', description: 'Configure suas contas e cartões' },
  especiais: { name: 'Especiais', description: 'Funcionalidades específicas' },
  ferramentas: { name: 'Ferramentas', description: 'Utilitários e configurações' }
};


export default function MainPage() {
  const { isLoggedIn, userProfile, login, logout, isInitializing } = useDataBackup();
  const [hoveredCard, setHoveredCard] = React.useState<string | null>(null);

  const groupedFeatures = React.useMemo(() => {
    return Object.entries(categories).map(([key, category]) => ({
      ...category,
      key,
      features: features.filter(f => f.category === key)
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800"></div>
        <div className="absolute inset-0 opacity-30"></div>
        
        <div className="relative px-6 py-24 mx-auto max-w-7xl lg:px-8">
          {/* User Profile Section */}
          <div className="absolute top-6 right-6 z-10">
            {isInitializing ? (
              <Skeleton className="h-12 w-48 rounded-xl bg-white/20" />
            ) : isLoggedIn && userProfile ? (
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                <Avatar className="h-10 w-10 ring-2 ring-white/30">
                  <AvatarImage src={userProfile.imageUrl} alt={userProfile.name} />
                  <AvatarFallback className="bg-white/20 text-white font-semibold">
                    {userProfile.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="font-semibold text-sm text-white">{userProfile.name}</span>
                  <span className="text-xs text-white/70">Logado</span>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={logout} 
                  className="text-white hover:bg-white/20 border border-white/30"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => login()} 
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
              >
                <LogIn className="mr-2 h-4 w-4" /> Entrar com Google
              </Button>
            )}
          </div>

          {/* Hero Content */}
          <div className="text-center text-white">
            <h1 className="text-5xl md:text-7xl font-headline font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Finanças Zen
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
              Sua plataforma completa para controle financeiro pessoal com inteligência e simplicidade
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-white/90 shadow-xl">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Acessar Dashboard
                </Button>
              </Link>
              <Link href="/transactions">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Wallet className="mr-2 h-5 w-5" />
                  Ver Transações
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 mx-auto max-w-7xl lg:px-8">
        {groupedFeatures.map((group) => (
          <div key={group.key} className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-headline font-bold text-gray-900 mb-4">
                {group.name}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {group.description}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {group.features.map((feature) => {
                const IconComponent = feature.icon;
                return (
                  <Link 
                    key={feature.href} 
                    href={feature.href}
                    onMouseEnter={() => setHoveredCard(feature.href)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <Card className={`
                      h-full transition-all duration-300 cursor-pointer border-0 shadow-lg hover:shadow-2xl
                      ${hoveredCard === feature.href ? 'scale-105 -translate-y-2' : ''}
                      bg-gradient-to-br ${feature.gradient} text-white overflow-hidden relative group
                    `}>
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-20"></div>
                      
                      <CardHeader className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <IconComponent className="h-8 w-8 text-white" />
                          </div>
                          <ArrowRight className={`
                            h-6 w-6 text-white/70 transition-all duration-300
                            ${hoveredCard === feature.href ? 'translate-x-1 text-white' : ''}
                          `} />
                        </div>
                        <CardTitle className="font-headline text-xl text-white mb-2">
                          {feature.title}
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="relative z-10">
                        <CardDescription className="text-white/90 leading-relaxed">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                      
                      <CardFooter className="relative z-10">
                        <div className="flex items-center text-white/80 font-medium">
                          <span>Acessar agora</span>
                        </div>
                      </CardFooter>
                      
                      {/* Hover Overlay */}
                      <div className={`
                        absolute inset-0 bg-white/10 transition-opacity duration-300
                        ${hoveredCard === feature.href ? 'opacity-100' : 'opacity-0'}
                      `}></div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-headline font-bold mb-4">Finanças Zen</h3>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Transforme sua relação com o dinheiro através de uma gestão financeira inteligente e intuitiva.
          </p>
          <div className="flex justify-center space-x-6">
            <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/transactions" className="text-slate-300 hover:text-white transition-colors">
              Transações
            </Link>
            <Link href="/settings" className="text-slate-300 hover:text-white transition-colors">
              Configurações
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
