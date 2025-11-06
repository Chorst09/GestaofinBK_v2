
import type { Metadata } from 'next';
import './globals.css';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import Link from 'next/link';
import { Package2 } from 'lucide-react';
import { ClientProviders } from '@/components/layout/client-providers';
import { ThemeToggle } from '@/components/theme/theme-toggle';


export const metadata: Metadata = {
  title: 'Finanças Zen',
  description: 'Seu assistente financeiro pessoal para uma vida mais tranquila.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ClientProviders>
          <Sidebar>
            <AppSidebar />
          </Sidebar>
          <SidebarInset>
            <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background px-3 sm:h-16 sm:gap-4 sm:px-6 md:static md:border-0 md:bg-transparent">
              <SidebarTrigger className="md:hidden" />
              <div className="flex items-center gap-2 md:hidden">
                <Link href="/" className="flex items-center gap-2 font-headline text-base font-semibold text-primary sm:text-lg">
                  <Package2 className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="hidden xs:inline">Finanças Zen</span>
                </Link>
              </div>
              <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4">
                <div className="md:hidden">
                  <ThemeToggle />
                </div>
                <div className="hidden md:block">
                  <ThemeToggle />
                </div>
              </div>
            </header>
            <main className="flex flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-4 md:gap-6 md:px-6 md:py-4 lg:gap-8 overflow-auto">
              {children}
            </main>
            <Toaster />
          </SidebarInset>
        </ClientProviders>
      </body>
    </html>
  );
}
