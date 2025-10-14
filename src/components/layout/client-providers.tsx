
"use client";

import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "@/components/ui/sidebar";
import dynamic from 'next/dynamic';
import type { PropsWithChildren } from 'react';
import { DataBackupProvider } from "@/hooks/useDataBackup";

// Dynamically import BackupInitializer on the client side only
const BackupInitializer = dynamic(
  () => import('@/components/backup/backup-initializer').then(mod => mod.BackupInitializer),
  { ssr: false }
);

export function ClientProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <DataBackupProvider>
        <SidebarProvider>
          <BackupInitializer />
          {children}
        </SidebarProvider>
      </DataBackupProvider>
    </ThemeProvider>
  );
}
