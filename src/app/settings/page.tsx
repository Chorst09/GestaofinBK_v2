
"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDataBackup } from "@/hooks/useDataBackup";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, LogIn, LogOut, Loader, Download, Upload, Save, Tags } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { BackupData } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { GoogleOAuthDiagnostic } from '@/components/settings/google-oauth-diagnostic';
import { BackupHistoryDialog } from '@/components/settings/backup-history-dialog';
import { GoogleDrivePermissionHelp } from '@/components/settings/google-drive-permission-help';

export default function SettingsPage() {
  const {
    isLoggedIn,
    isInitializing,
    isSaving,
    isRestoring,
    isDataLoaded,
    login,
    logout,
    restoreFromBackup,
    saveToDrive,
    userProfile,
    lastBackupDate,
    error,
    getLatestBackupData,
    restoreFunctions,
  } = useDataBackup();
  const { toast } = useToast();
  
  const [importFile, setImportFile] = React.useState<File | null>(null);
  
  const [originUrl, setOriginUrl] = React.useState('Carregando...');
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setOriginUrl(window.location.origin);
    }
  }, []);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "Não definido";
  const hasGoogleConfig = !!(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && process.env.NEXT_PUBLIC_GOOGLE_API_KEY);

  const handleExport = () => {
    try {
      const backupData = getLatestBackupData();
      const dataStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const date = new Date().toISOString().split('T')[0];
      link.download = `financas-zen-backup-${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: "Exportação Concluída", description: "Seu arquivo de backup foi baixado." });
    } catch (e) {
      console.error("Export failed:", e);
      toast({ variant: "destructive", title: "Erro na Exportação", description: "Não foi possível gerar o arquivo de backup." });
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImportFile(event.target.files[0]);
    } else {
      setImportFile(null);
    }
  };

  const handleImport = () => {
    if (!importFile) {
      toast({ variant: "destructive", title: "Nenhum arquivo", description: "Por favor, selecione um arquivo para importar." });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text) as BackupData;
        
        if (!data || typeof data !== 'object' || !('transactions' in data) || !('bankAccounts' in data)) {
            throw new Error("Arquivo de backup inválido ou corrompido.");
        }

        restoreFunctions.setTransactions(data.transactions || []);
        restoreFunctions.setBankAccounts(data.bankAccounts || []);
        restoreFunctions.setCreditCards(data.creditCards || []);
        restoreFunctions.setForecastItems(data.forecastItems || []);
        restoreFunctions.setVehicles(data.vehicles || []);
        restoreFunctions.setVehicleExpenses(data.vehicleExpenses || []);
        restoreFunctions.setScheduledMaintenances(data.scheduledMaintenances || []);
        restoreFunctions.setFinancialGoals(data.financialGoals || []);
        restoreFunctions.setGoalContributions(data.goalContributions || []);
        
        toast({ title: "Importação Concluída", description: "Seus dados foram restaurados do arquivo local." });
        setImportFile(null);
        const fileInput = document.getElementById('local-backup-input') as HTMLInputElement;
        if (fileInput) fileInput.value = "";

      } catch (err: any) {
        console.error("Import failed:", err);
        toast({ variant: "destructive", title: "Erro na Importação", description: err.message || "Ocorreu um erro ao processar o arquivo." });
      }
    };
    reader.readAsText(importFile);
  };

  const handleClearAllData = () => {
    try {
      // Limpar todos os dados usando as funções do contexto
      restoreFunctions.setTransactions([]);
      restoreFunctions.setBankAccounts([]);
      restoreFunctions.setCreditCards([]);
      restoreFunctions.setForecastItems([]);
      restoreFunctions.setVehicles([]);
      restoreFunctions.setVehicleExpenses([]);
      restoreFunctions.setScheduledMaintenances([]);
      restoreFunctions.setFinancialGoals([]);
      restoreFunctions.setGoalContributions([]);
      restoreFunctions.setCustomCategories([]);
      restoreFunctions.setFixedIncomeAssets([]);
      restoreFunctions.setVariableIncomeAssets([]);
      restoreFunctions.setTravelEvents([]);
      restoreFunctions.setRenovations([]);
      restoreFunctions.setRenovationExpenses([]);
      restoreFunctions.setSuppliers([]);
      restoreFunctions.setMaterials([]);
      
      toast({ 
        title: "Dados Limpos", 
        description: "Todos os dados foram removidos com sucesso. O aplicativo foi resetado para o estado inicial." 
      });
    } catch (error) {
      console.error("Clear data failed:", error);
      toast({ 
        variant: "destructive", 
        title: "Erro ao Limpar Dados", 
        description: "Ocorreu um erro ao tentar limpar os dados." 
      });
    }
  };

  const handleManualBackup = () => {
    saveToDrive({ showSuccessToast: true });
  };

  const handleLogin = () => {
    login();
  };

  const handleSwitchAccount = () => {
    login(true);
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleRestore = () => {
    restoreFromBackup();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-headline font-semibold">Configurações</h1>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Configurações Gerais</CardTitle>
          <CardDescription>
            Gerencie categorias de transações e importe dados para o aplicativo.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Link href="/categories" className="block group">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors h-full flex flex-col">
              <div className="flex items-center gap-3 mb-1">
                <Tags className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">Gerenciar Categorias</h3>
              </div>
              <p className="text-sm text-muted-foreground flex-grow">
                Adicione, edite ou remova suas categorias de despesa e receita.
              </p>
            </div>
          </Link>
          <Link href="/import" className="block group">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors h-full flex flex-col">
              <div className="flex items-center gap-3 mb-1">
                <Upload className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">Importar Dados</h3>
              </div>
              <p className="text-sm text-muted-foreground flex-grow">
                Importe transações em massa a partir de arquivos CSV.
              </p>
            </div>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Backup e Sincronização com Google Drive</CardTitle>
           <CardDescription>
            Seus dados são salvos de forma segura em uma pasta privada do seu Google Drive, acessível apenas por este aplicativo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!hasGoogleConfig ? (
             <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Sincronização Indisponível</AlertTitle>
              <AlertDescription>
                 <p>O backup com Google Drive não foi configurado para este site pelo administrador.</p>
                 <p className="mt-2">Use a opção de <strong>Backup Local</strong> abaixo para salvar e restaurar seus dados de um arquivo.</p>
              </AlertDescription>
            </Alert>
          ) : isInitializing ? (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Loader className="h-4 w-4 animate-spin" />
              <span>Inicializando serviço do Google...</span>
            </div>
          ) : isLoggedIn ? (
            <div className="space-y-4">
              {userProfile ? (
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={userProfile.imageUrl} alt={userProfile.name} />
                            <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{userProfile.name}</p>
                            <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                        <Button variant="outline" onClick={handleSwitchAccount} className="w-full sm:w-auto">
                           <LogIn className="mr-2 h-4 w-4" /> Trocar de Conta
                        </Button>
                        <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
                            <LogOut className="mr-2 h-4 w-4" /> Sair
                        </Button>
                    </div>
                </div>
              ) : (
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-semibold">Conectado ao Google</p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                        <Button variant="outline" onClick={handleSwitchAccount} className="w-full sm:w-auto">
                           <LogIn className="mr-2 h-4 w-4" /> Trocar de Conta
                        </Button>
                        <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
                            <LogOut className="mr-2 h-4 w-4" /> Sair
                        </Button>
                    </div>
                </div>
              )}
               <div className="flex items-center text-sm text-muted-foreground">
                {isSaving ? (
                    <>
                        <Upload className="mr-2 h-4 w-4 animate-pulse text-primary" />
                        <span>Criando backup...</span>
                    </>
                ) : lastBackupDate ? (
                    `Último backup: ${lastBackupDate.toLocaleString()}`
                ) : (
                    "Nenhum backup criado ainda. Crie um backup manual ou aguarde o backup diário automático."
                )}
               </div>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-4">
              <p className="text-muted-foreground">Você não está conectado. Suas informações estão salvas apenas neste navegador.</p>
              <Button onClick={handleLogin}>
                <LogIn className="mr-2 h-4 w-4" /> Entrar com Google
              </Button>
            </div>
          )}

          <GoogleDrivePermissionHelp error={error} />
          
          {error && !error.includes('PERMISSION_DENIED') && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Ocorreu um Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {hasGoogleConfig && (
              <div className="pt-6 space-y-4">
                <div className="flex flex-wrap gap-4">
                  <Button onClick={handleManualBackup} disabled={!isLoggedIn || isSaving}>
                    {isSaving ? (
                        <>
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                            Criando...
                        </>
                    ) : (
                         <>
                            <Save className="mr-2 h-4 w-4" />
                            Criar Backup Manual
                        </>
                    )}
                  </Button>
                  <BackupHistoryDialog />
                </div>
                <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2">
                  <p className="font-medium">ℹ️ Como funciona o backup:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li><strong>Backup Diário Automático:</strong> Um backup é criado automaticamente uma vez por dia quando você usa o aplicativo</li>
                    <li><strong>Backup Manual:</strong> Você pode criar backups adicionais a qualquer momento clicando no botão acima</li>
                    <li><strong>Histórico:</strong> Todos os backups ficam salvos e você pode escolher qual restaurar</li>
                    <li><strong>Sem Sobrescrita:</strong> Cada backup é um arquivo separado, nada é perdido</li>
                  </ul>
                </div>
              </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Backup Local</CardTitle>
          <CardDescription>
            Salve ou restaure seus dados de um arquivo local (.json) no seu computador.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <Label htmlFor="export-button">Exportar Dados</Label>
                <p className="text-sm text-muted-foreground mb-2">
                    Salve uma cópia de todos os seus dados em um arquivo JSON.
                </p>
                <Button id="export-button" onClick={handleExport} disabled={!isDataLoaded}>
                    {!isDataLoaded ? (
                        <>
                            <Loader className="mr-2 h-4 w-4 animate-spin" /> Carregando Dados...
                        </>
                    ) : (
                        <>
                            <Download className="mr-2 h-4 w-4" /> Exportar para Arquivo
                        </>
                    )}
                </Button>
            </div>
            
            <Separator />
            
            <div>
                 <Label htmlFor="local-backup-input">Importar Dados</Label>
                 <p className="text-sm text-muted-foreground mb-2">
                    Selecione um arquivo de backup JSON para restaurar seus dados. Esta ação substituirá todos os dados existentes.
                </p>
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Input id="local-backup-input" type="file" accept=".json" onChange={handleFileChange} />
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="secondary" disabled={!importFile}>
                                <Upload className="mr-2 h-4 w-4" /> Importar de Arquivo
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Importação</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Tem certeza que deseja importar os dados deste arquivo? Todos os seus dados atuais neste navegador serão permanentemente substituídos.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleImport}>Sim, importar e substituir</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
            
            <Separator />
            
            <div>
                <Label htmlFor="clear-data-button">Limpar Todos os Dados</Label>
                <p className="text-sm text-muted-foreground mb-2">
                    Remove permanentemente todos os dados do aplicativo (transações, contas, cartões, etc.). Esta ação não pode ser desfeita.
                </p>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button id="clear-data-button" variant="destructive" disabled={!isDataLoaded}>
                            {!isDataLoaded ? (
                                <>
                                    <Loader className="mr-2 h-4 w-4 animate-spin" /> Carregando...
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="mr-2 h-4 w-4" /> Limpar Todos os Dados
                                </>
                            )}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-destructive">⚠️ Confirmar Limpeza de Dados</AlertDialogTitle>
                            <AlertDialogDescription>
                                <div className="space-y-3">
                                    <p>
                                        <strong>ATENÇÃO:</strong> Esta ação irá remover permanentemente TODOS os seus dados:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1 text-sm">
                                        <li>Todas as transações</li>
                                        <li>Contas bancárias e cartões de crédito</li>
                                        <li>Veículos e despesas</li>
                                        <li>Metas financeiras e investimentos</li>
                                        <li>Viagens e reformas</li>
                                        <li>Categorias personalizadas</li>
                                        <li>Todos os outros dados</li>
                                    </ul>
                                    <div className="bg-destructive/10 p-3 rounded-md">
                                        <p className="text-sm font-medium text-destructive">
                                            Esta ação NÃO PODE ser desfeita. Certifique-se de ter um backup antes de continuar.
                                        </p>
                                    </div>
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={handleClearAllData}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Sim, limpar todos os dados
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </CardContent>
      </Card>

      <GoogleOAuthDiagnostic />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Informações de Debug (OAuth)</CardTitle>
          <CardDescription>
            Use esta informação para configurar corretamente as credenciais no Google Cloud Console.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="origin-url">URL de Origem do Aplicativo</Label>
              <Input
                id="origin-url"
                readOnly
                value={originUrl}
              />
              <p className="text-sm text-muted-foreground">
                Se você encontrar o erro "redirect_uri_mismatch", copie esta URL e cole-a EXATAMENTE como está nos campos <strong>"Origens JavaScript autorizadas"</strong> E <strong>"URIs de redirecionamento autorizados"</strong> nas suas credenciais do Google Cloud.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-id">Client ID Sendo Usado</Label>
              <Input
                id="client-id"
                readOnly
                value={googleClientId}
              />
              <p className="text-sm text-muted-foreground">
                Se você encontrar o erro "invalid_client", confirme se este valor corresponde EXATAMENTE ao "ID do cliente" nas suas credenciais do Google Cloud. Se estiver "Não definido", verifique seu arquivo <strong>.env.local</strong> (desenvolvimento) ou as variáveis de ambiente da sua hospedagem (produção).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
