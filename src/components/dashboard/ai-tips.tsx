"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, AlertTriangle } from 'lucide-react';
// import { getFinancialTips } from '@/ai/flows'; // Assuming a flow exists

export function AiTips() {
  const [tips, setTips] = React.useState<string[]>([]);
  const [alerts, setAlerts] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Placeholder for fetching AI tips - replace with actual AI flow call
  const fetchTips = React.useCallback(async () => {
    setLoading(true);
    // This is where you would call your Genkit flow
    // For example:
    // try {
    //   const response = await runFlow(getFinancialTips, { userId: 'current_user_id_or_context' });
    //   setTips(response.tips);
    //   setAlerts(response.alerts);
    // } catch (error) {
    //   console.error("Error fetching AI tips:", error);
    //   // Handle error, maybe show a toast
    // }
    
    try {
      // Mock data for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTips([
        "Considere criar um fundo de emergência com 3-6 meses de despesas.",
        "Revise suas assinaturas mensais e cancele as que não utiliza.",
        "Automatize suas economias para atingir metas financeiras mais rápido."
      ]);
      setAlerts([
        "Você gastou mais em 'Alimentação' este mês do que a média dos últimos 3 meses."
      ]);
    } catch (error) {
      console.error("Error fetching tips:", error);
      setTips([]);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    
    const loadTips = async () => {
      if (isMounted) {
        await fetchTips();
      }
    };
    
    loadTips();
    
    return () => {
      isMounted = false;
    };
  }, [fetchTips]);

  return (
    <Card className="border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="font-headline flex items-center gap-3 text-xl text-slate-800 dark:text-slate-200">
            <div className="p-2 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-sm">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            Dicas e Alertas IA
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
            Sugestões personalizadas para sua saúde financeira
          </CardDescription>
        </div>
        <Button 
          onClick={fetchTips} 
          disabled={loading} 
          size="sm"
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-sm"
        >
          {loading ? 'Atualizando...' : 'Atualizar Dicas'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse">
              <Lightbulb className="h-8 w-8 text-slate-400" />
            </div>
          </div>
        )}
        {!loading && tips.length === 0 && alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
              <Lightbulb className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-center">
              Nenhuma dica ou alerta disponível no momento.
            </p>
          </div>
        )}

        {alerts.length > 0 && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg flex items-center text-red-700 dark:text-red-400">
              <div className="p-1 bg-red-100 dark:bg-red-900/50 rounded-full mr-3">
                <AlertTriangle className="h-4 w-4" />
              </div>
              Alertas Importantes
            </h3>
            <div className="space-y-2">
              {alerts.map((alert, index) => (
                <div key={`alert-${index}`} className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="p-1 bg-red-100 dark:bg-red-900/50 rounded-full mt-0.5">
                    <AlertTriangle className="h-3 w-3 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">{alert}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tips.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg flex items-center text-yellow-700 dark:text-yellow-400">
              <div className="p-1 bg-yellow-100 dark:bg-yellow-900/50 rounded-full mr-3">
                <Lightbulb className="h-4 w-4" />
              </div>
              Dicas Financeiras
            </h3>
            <div className="space-y-2">
              {tips.map((tip, index) => (
                <div key={`tip-${index}`} className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="p-1 bg-yellow-100 dark:bg-yellow-900/50 rounded-full mt-0.5">
                    <Lightbulb className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
