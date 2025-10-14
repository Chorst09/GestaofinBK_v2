
import type { Metadata } from 'next';
import './globals.css';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import Link from 'next/link';
import { Package2 } from 'lucide-react';
import { ClientProviders } from '@/components/layout/client-providers';


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
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
              <SidebarTrigger className="md:hidden" />
              <div className="flex items-center gap-2 md:hidden">
                <Link href="/" className="flex items-center gap-2 font-headline text-lg font-semibold text-primary">
                  <Package2 className="h-6 w-6" />
                  <span>Finanças Zen</span>
                </Link>
              </div>
              {/* Placeholder for potential header content like user menu or breadcrumbs */}
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 overflow-auto">
              {children}
            </main>
            <Toaster />
          </SidebarInset>
        </ClientProviders>
      </body>
    </html>
  );
}
