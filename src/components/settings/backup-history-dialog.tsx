"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Clock, Download, Loader, FileText } from "lucide-react";
import { useDataBackup } from "@/hooks/useDataBackup";
import type { BackupFileInfo } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function BackupHistoryDialog() {
  const { listBackups, restoreFromBackupById, isRestoring } = useDataBackup();
  const [open, setOpen] = React.useState(false);
  const [backups, setBackups] = React.useState<BackupFileInfo[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedBackup, setSelectedBackup] = React.useState<BackupFileInfo | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const loadBackups = async () => {
    setLoading(true);
    try {
      const files = await listBackups();
      setBackups(files);
    } catch (error) {
      console.error("Failed to load backups:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (open) {
      loadBackups();
    }
  }, [open]);

  const handleRestore = async () => {
    if (!selectedBackup) return;
    
    await restoreFromBackupById(selectedBackup.id);
    setConfirmOpen(false);
    setSelectedBackup(null);
    setOpen(false);
  };

  const formatFileSize = (bytes: string) => {
    const size = parseInt(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatBackupName = (name: string, modifiedTime: string) => {
    const date = new Date(modifiedTime);
    const dateStr = date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    const timeStr = date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    if (name === 'financas-zen-backup.json') {
      return {
        title: 'Backup Legado',
        subtitle: `${dateStr} às ${timeStr}`,
        type: 'legacy' as const
      };
    }
    
    // Extract timestamp from filename: financas-zen-backup-2025-01-15T10-30-45-123Z.json
    const match = name.match(/financas-zen-backup-(.+)\.json/);
    if (match) {
      return {
        title: `Backup de ${dateStr}`,
        subtitle: `Criado às ${timeStr}`,
        type: 'versioned' as const
      };
    }
    
    return {
      title: name,
      subtitle: `${dateStr} às ${timeStr}`,
      type: 'unknown' as const
    };
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Clock className="mr-2 h-4 w-4" />
            Ver Histórico de Backups
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Histórico de Backups</DialogTitle>
            <DialogDescription>
              Selecione um backup para restaurar seus dados. Os backups são criados diariamente de forma automática e você também pode criar backups manuais.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Carregando backups...</span>
              </div>
            ) : backups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum backup encontrado</p>
                <p className="text-sm mt-2">Crie seu primeiro backup clicando em "Criar Backup Manual"</p>
              </div>
            ) : (
              <div className="space-y-2">
                {backups.map((backup) => {
                  const backupInfo = formatBackupName(backup.name, backup.modifiedTime);
                  return (
                    <div
                      key={backup.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{backupInfo.title}</div>
                          {backupInfo.type === 'legacy' && (
                            <span className="text-xs bg-muted px-2 py-0.5 rounded">Antigo</span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {backupInfo.subtitle}
                          {' • '}
                          {formatDistanceToNow(new Date(backup.modifiedTime), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Tamanho: {formatFileSize(backup.size)}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedBackup(backup);
                          setConfirmOpen(true);
                        }}
                        disabled={isRestoring}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Restaurar
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Restauração</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja restaurar este backup? Todos os dados atuais salvos localmente
              (neste navegador) serão permanentemente substituídos pelos dados deste backup.
              {selectedBackup && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <div className="font-medium text-foreground">
                    {formatBackupName(selectedBackup.name, selectedBackup.modifiedTime).title}
                  </div>
                  <div className="text-sm mt-1">
                    {formatBackupName(selectedBackup.name, selectedBackup.modifiedTime).subtitle}
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore} disabled={isRestoring}>
              {isRestoring ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Restaurando...
                </>
              ) : (
                'Sim, restaurar backup'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
