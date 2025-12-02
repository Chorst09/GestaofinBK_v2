
"use client";

import Link from 'next/link';
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, LogIn, LogOut } from 'lucide-react';
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
  const [isPaused, setIsPaused] = React.useState(false);

  // Auto-rotate images every 5 seconds (pauses on hover to facilitar a visualização)
  React.useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div className="flex flex-col gap-10">
      <section
        className="relative w-full overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-2xl ring-1 ring-slate-900/10"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="absolute inset-0 opacity-50 mix-blend-screen">
          <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-emerald-400/30 blur-3xl" />
          <div className="absolute -bottom-16 right-0 h-48 w-48 rounded-full bg-sky-400/30 blur-3xl" />
        </div>
        {heroImages.map((image, index) => (
          <img
            key={image}
            src={image}
            alt={`Painel de gestão financeira ${index + 1}`}
            data-ai-hint="finance management"
            width={1200}
            height={420}
            className={`w-full h-[420px] object-cover transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0 absolute inset-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-gradient-to-t from-slate-950/80 via-slate-900/60 to-slate-900/70 text-center text-white px-4 py-12">
          <div className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] shadow-lg backdrop-blur">
            Plataforma Financeira 360º
            <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
          </div>
          <h1
            className="text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-lg"
            style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", letterSpacing: '-0.02em' }}
          >
            Bem-vindo ao Finanças Zen
          </h1>

          <p
            className="max-w-2xl text-lg md:text-2xl text-slate-100/90 font-light"
            style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
          >
            Controle, visualize e planeje seu dinheiro com uma experiência elegante e intuitiva.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            {isInitializing ? (
              <Skeleton className="h-11 w-48 rounded-full bg-white/20" />
            ) : isLoggedIn && userProfile ? (
              <div className="flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-3 py-2 shadow-lg backdrop-blur">
                <Avatar className="h-9 w-9 border border-white/30 shadow-inner">
                  <AvatarImage src={userProfile.imageUrl} alt={userProfile.name} />
                  <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs text-white/70">Conectado</span>
                  <span className="font-semibold text-sm text-white">{userProfile.name}</span>
                </div>
                <Button variant="ghost" onClick={logout} className="hover:bg-white/20 text-white">
                  <LogOut className="mr-2 h-4 w-4" /> Sair
                </Button>
              </div>
            ) : (
              <>
                <Button
                  onClick={() => login()}
                  className="group relative overflow-hidden rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 px-7 py-3 text-base font-semibold text-slate-900 shadow-xl transition-transform duration-200 hover:scale-[1.02] focus:ring-4 focus:ring-emerald-200"
                  style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
                >
                  <span className="absolute inset-0 translate-x-[-60%] bg-white/30 blur-xl transition-all duration-700 group-hover:translate-x-full" />
                  <span className="relative flex items-center justify-center gap-2">
                    <LogIn className="h-4 w-4" /> Entrar com Google
                  </span>
                </Button>
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button
                    variant="ghost"
                    className="w-full sm:w-auto rounded-full border border-white/30 bg-white/10 px-6 py-3 text-white hover:bg-white/15"
                  >
                    Ver demonstração
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="grid w-full max-w-5xl grid-cols-1 gap-3 md:grid-cols-3 text-left">
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 shadow-xl backdrop-blur">
              <div className="flex items-center gap-2 text-sm text-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" /> Backup ativo
              </div>
              <p className="mt-1 text-lg font-semibold text-white">Sincronização automática ligada</p>
              <p className="text-sm text-white/70">Dados protegidos em tempo real no Google Drive.</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 shadow-xl backdrop-blur">
              <div className="flex items-center justify-between text-sm text-slate-200">
                <span>Progresso do mês</span>
                <span className="rounded-full bg-emerald-300/20 px-3 py-1 text-xs font-semibold text-emerald-100">+12%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-200 animate-pulse" />
              </div>
              <p className="mt-1 text-sm text-white/70">Receitas cresceram em relação ao mês anterior.</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 shadow-xl backdrop-blur">
              <div className="flex items-center gap-2 text-sm text-slate-200">
                <Check className="h-4 w-4 text-emerald-200" /> Acesso imediato
              </div>
              <p className="mt-1 text-lg font-semibold text-white">Todos os módulos liberados</p>
              <p className="text-sm text-white/70">Explore gráficos, previsões e importação de dados.</p>
            </div>
          </div>

          {/* Carousel indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex
                    ? 'w-10 bg-white drop-shadow'
                    : 'w-3 bg-white/50 hover:bg-white/80'
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
        <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Navegue com estilo</p>
            <h2 className="text-2xl font-headline font-semibold">Acessos Rápidos</h2>
            <p className="text-muted-foreground">Escolha um módulo e acompanhe seus números com visuais renovados.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border bg-gradient-to-r from-slate-100 to-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Interface atualizada
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href} className="group/card block">
              <Card className="group h-full flex flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-b from-white via-slate-50 to-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl">
                <div className="relative overflow-hidden">
                  <img
                    src={feature.src}
                    alt={feature.title}
                    data-ai-hint={feature.imageHint}
                    width={600}
                    height={400}
                    className="h-40 w-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-70" />
                  <div className="absolute left-3 top-3 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm">
                    Novo visual
                  </div>
                </div>
                <CardHeader className="space-y-2">
                  <CardTitle className="font-headline text-lg text-slate-900 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription className="text-slate-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="flex items-center justify-between border-t bg-gradient-to-r from-slate-50 to-white">
                  <div className="text-sm font-semibold text-emerald-600 flex items-center gap-2">
                    Acessar
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/card:translate-x-1" />
                  </div>
                  <span className="text-xs text-muted-foreground">Layout otimizado</span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
