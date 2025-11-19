
"use client";

import Link from 'next/link';
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, LogIn, LogOut } from 'lucide-react';
import { useDataBackup } from '@/hooks/useDataBackup';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { AnalyticsSummary } from '@/components/analytics/analytics-summary';

const features = [
  {
    title: 'Dashboard',
    description: 'Visão geral com gráficos e transações recentes.',
    href: '/dashboard',
    src: 'https://media.istockphoto.com/id/1488294044/pt/foto/businessman-works-on-laptop-showing-business-analytics-dashboard-with-charts-metrics-and-kpi.jpg?s=1024x1024&w=is&k=20&c=huf6hU_Qq5sydYdxp2F_5jvht7tHu1ggMw58kZWPbSo=',
    imageHint: 'analytics chart'
  },
  {
    title: 'Transações',
    description: 'Gerencie todas as suas receitas e despesas.',
    href: '/transactions',
    src: 'https://media.istockphoto.com/id/1401173396/pt/foto/hand-with-phone-and-digital-money-hologram-with-cashback-concept.jpg?s=1024x1024&w=is&k=20&c=Sis5eY4NjKOfop3CBUJ3-vwXQ8MFdUBdkeZu8pMcjg4=',
    imageHint: 'transaction list'
  },
  {
    title: 'Previsões',
    description: 'Planeje seus gastos e receitas futuras.',
    href: '/forecasts',
    src: 'https://images.pexels.com/photos/6801639/pexels-photo-6801639.jpeg',
    imageHint: 'financial forecast'
  },
  {
    title: 'Análise Mensal',
    description: 'Compare seu desempenho financeiro mês a mês.',
    href: '/monthly-analysis',
    src: 'https://images.pexels.com/photos/6476592/pexels-photo-6476592.jpeg',
    imageHint: 'report analysis'
  },
  {
    title: 'Previsto vs. Realizado',
    description: 'Veja se seu planejamento está alinhado com a realidade.',
    href: '/previsto-vs-realizado',
    src: 'https://images.pexels.com/photos/16282306/pexels-photo-16282306.jpeg',
    imageHint: 'target comparison'
  },
  {
    title: 'Investimentos',
    description: 'Acompanhe seus ativos de renda fixa e variável.',
    href: '/investments',
    src: 'https://images.pexels.com/photos/6801874/pexels-photo-6801874.jpeg',
    imageHint: 'investment chart'
  },
  {
    title: 'Metas Financeiras',
    description: 'Crie e acompanhe seus objetivos de longo prazo.',
    href: '/financial-goals',
    src: 'https://media.istockphoto.com/id/1346687991/pt/foto/businessman-holding-coins-putting-in-glass-concept-saving-money-for-finance-accounting.jpg?s=1024x1024&w=is&k=20&c=8GrQ1c5uW9lgZgsGM0-0Z-zxIlxXPg_r3lTCkfyKfqE=',
    imageHint: 'savings goal'
  },
  {
    title: 'Contas Bancárias',
    description: 'Cadastre e gerencie suas contas correntes e poupanças.',
    href: '/bank-accounts',
    src: 'https://media.istockphoto.com/id/640267784/pt/foto/edif%C3%ADcio-do-banco.jpg?s=1024x1024&w=is&k=20&c=cruLkLwhThfuW_7rGifCbB_eh-3pKCeTh9xSscszQPo=',
    imageHint: 'bank vault'
  },
  {
    title: 'Cartões de Crédito',
    description: 'Organize as faturas e limites dos seus cartões.',
    href: '/credit-cards',
    src: 'https://images.pexels.com/photos/50987/money-card-business-credit-card-50987.jpeg',
    imageHint: 'credit card money'
  },
  {
    title: 'Veículos',
    description: 'Controle os gastos com abastecimento e manutenção.',
    href: '/vehicles',
    src: 'https://images.pexels.com/photos/17345648/pexels-photo-17345648.jpeg',
    imageHint: 'car maintenance garage'
  },
  {
    title: 'Importar Dados',
    description: 'Importe transações em massa a partir de arquivos CSV.',
    href: '/import',
    src: 'https://images.pexels.com/photos/27427258/pexels-photo-27427258.jpeg',
    imageHint: 'data upload spreadsheet'
  },
  {
    title: 'Configurações',
    description: 'Configure backups, temas e outras preferências.',
    href: '/settings',
    src: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg',
    imageHint: 'security settings'
  }
];


const heroImages = [
  'https://t4isolutions.com/wp-content/uploads/2021/05/AdobeStock_600314909-2048x1365.jpeg',
  'https://www.advtecnologia.com.br/wp-content/uploads/2023/11/sistema-de-gestao-financeira-1-1080x675.jpg',
  'https://noticias.iob.com.br/wp-content/uploads/2023/12/Sistema-de-Gestao-Financeira-1536x1024.jpg',
  'https://f360.com.br/wp-content/uploads/2017/08/sistema-de-gestao-financeira.jpg.webp'
];

export default function MainPage() {
  const { isLoggedIn, userProfile, login, logout, isInitializing } = useDataBackup();
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  // Auto-rotate images every 5 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <section className="relative w-full rounded-lg overflow-hidden shadow-lg group">
        {heroImages.map((image, index) => (
          <img
            key={image}
            src={image}
            alt={`Painel de gestão financeira ${index + 1}`}
            data-ai-hint="finance management"
            width={1200}
            height={400}
            className={`w-full h-auto object-cover transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0 absolute inset-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-4 bg-black/50">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", fontWeight: 800, letterSpacing: '-0.02em' }}>
            Bem-vindo ao Finanças Zen
          </h1>

          <div className="absolute top-4 right-4 flex items-center gap-4">
            {isInitializing ? (
              <Skeleton className="h-10 w-48 rounded-md bg-white/20" />
            ) : isLoggedIn && userProfile ? (
              <div className="flex items-center gap-3 text-white">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={userProfile.imageUrl} alt={userProfile.name} />
                  <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="font-semibold text-sm">{userProfile.name}</span>
                </div>
                <Button variant="ghost" onClick={logout} className="hover:bg-white/20">
                  <LogOut className="mr-2 h-4 w-4" /> Sair
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => login()} 
                className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-gray-900 transition-all duration-300 font-semibold px-6 py-2"
                style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
              >
                <LogIn className="mr-2 h-4 w-4" /> Entrar com Google
              </Button>
            )}
          </div>

          <p className="mt-4 text-xl md:text-2xl text-white font-light" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", fontWeight: 300 }}>
            Sua plataforma completa para controle financeiro pessoal.
          </p>
          
          {/* Carousel indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImageIndex 
                    ? 'bg-white w-8' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Ir para imagem ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Summary */}
      <AnalyticsSummary />

      <section>
        <h2 className="text-2xl font-headline font-semibold mb-4">Acessos Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href} className="group/card block">
              <Card className="h-full hover:border-primary hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden rounded-lg">
                <div className="overflow-hidden relative group">
                  <img
                    src={feature.src}
                    alt={feature.title}
                    data-ai-hint={feature.imageHint}
                    width={600}
                    height={400}
                    className="object-cover w-full h-40 transition-transform duration-300 group-hover/card:scale-105"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="font-headline text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
                <CardFooter>
                  <div className="text-sm font-medium text-primary flex items-center">
                    Acessar
                    <ArrowRight className="ml-2 h-4 w-4 transform transition-transform group-hover/card:translate-x-1" />
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
