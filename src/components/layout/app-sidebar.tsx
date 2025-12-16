
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Home, LayoutDashboard, List, Target, Package2, Settings, CreditCard as CreditCardIcon, Landmark as BankIcon, Car, AreaChart, BarChart3, ClipboardCheck, LineChart, Plane, Hammer, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SimpleThemeToggle } from '@/components/theme/theme-toggle';

const navItems = [
  { href: '/', label: 'Página Principal', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transações', icon: List },
  { href: '/forecasts', label: 'Previsões', icon: AreaChart },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/monthly-analysis', label: 'Análise Mensal', icon: ClipboardCheck },
  { href: '/previsto-vs-realizado', label: 'Previsto x Realizado', icon: LineChart },
  { href: '/investments', label: 'Investimentos', icon: Target },
  { href: '/financial-goals', label: 'Metas Financeiras', icon: Target },
  { href: '/renovations', label: 'Reformas', icon: Hammer },
  { href: '/travel', label: 'Viagens e Lazer', icon: Plane },
  { href: '/credit-cards', label: 'Cartões de Crédito', icon: CreditCardIcon },
  { href: '/bank-accounts', label: 'Contas Bancárias', icon: BankIcon },
  { href: '/interest-calculator', label: 'Cálculos de Juros', icon: Calculator },
  { href: '/vehicles', label: 'Veículos', icon: Car },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { open, isMobile, setOpenMobile }
    = useSidebar();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2" onClick={handleLinkClick}>
          <Package2 className="h-8 w-8 text-primary" />
          <h1 className={cn(
            "font-headline text-xl font-semibold text-primary",
            !open && "hidden",
            isMobile && "block"
          )}>
            Finanças Zen
          </h1>
        </Link>
      </SidebarHeader>
      <Separator />
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} onClick={handleLinkClick}>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={item.label}
                  className="justify-start"
                >
                  <item.icon className="h-5 w-5" />
                  <span className={cn(!open && "hidden", isMobile && "inline-block")}>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <Separator />
      <SidebarFooter className="p-4 mt-auto">
        <Link href="/settings" onClick={handleLinkClick}>
          <Button variant="ghost" className={cn("w-full justify-start gap-2", !open && "justify-center", isMobile && "justify-start")}>
            <Settings className="h-5 w-5" />
            <span className={cn(!open && "hidden", isMobile && "inline-block")}>Configurações</span>
          </Button>
        </Link>

        <Separator className="my-2" />

        <div className="flex items-center justify-center">
          <SimpleThemeToggle />
        </div>

        <div className={cn(
          "pt-4 text-center text-xs text-muted-foreground",
          !open && "hidden",
          isMobile && "block"
        )}
        >
          Carlos Horst®
        </div>
      </SidebarFooter>
    </>
  );
}
