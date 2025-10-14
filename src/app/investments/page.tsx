
"use client";

import * as React from 'react';
import { useInvestments } from '@/hooks/useInvestments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { FixedIncomeAsset, VariableIncomeAsset } from '@/lib/types';
import { PlusCircle, Edit, Trash2, TrendingUp, TrendingDown, Wallet, LineChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { FixedIncomeForm } from '@/components/investments/fixed-income-form';
import { VariableIncomeForm } from '@/components/investments/variable-income-form';
import { cn } from '@/lib/utils';


const fixedIncomeTypeLabels: Record<FixedIncomeAsset['type'], string> = {
  CDB: 'CDB',
  LCI_LCA: 'LCI/LCA',
  TESOURO_DIRETO: 'Tesouro Direto',
  OUTRO: 'Outro',
};

const variableIncomeTypeLabels: Record<VariableIncomeAsset['type'], string> = {
  ACAO: 'Ação',
  FII: 'FII',
  BDR: 'BDR',
  ETF: 'ETF',
  CRIPTO: 'Cripto',
};

export default function InvestmentsPage() {
  const { 
    fixedIncomeAssets, addFixedIncomeAsset, updateFixedIncomeAsset, deleteFixedIncomeAsset,
    variableIncomeAssets, addVariableIncomeAsset, updateVariableIncomeAsset, deleteVariableIncomeAsset
  } = useInvestments();
  const { toast } = useToast();
  
  const [isFixedFormOpen, setFixedFormOpen] = React.useState(false);
  const [editingFixedAsset, setEditingFixedAsset] = React.useState<FixedIncomeAsset | null>(null);

  const [isVariableFormOpen, setVariableFormOpen] = React.useState(false);
  const [editingVariableAsset, setEditingVariableAsset] = React.useState<VariableIncomeAsset | null>(null);

  const handleOpenFixedForm = (asset: FixedIncomeAsset | null) => {
    setEditingFixedAsset(asset);
    setFixedFormOpen(true);
  };
  
  const handleOpenVariableForm = (asset: VariableIncomeAsset | null) => {
    setEditingVariableAsset(asset);
    setVariableFormOpen(true);
  };

  const totals = React.useMemo(() => {
    const totalInvestedFixed = fixedIncomeAssets.reduce((sum, asset) => sum + asset.investedAmount, 0);
    const totalCurrentFixed = fixedIncomeAssets.reduce((sum, asset) => sum + asset.currentValue, 0);
    
    const totalInvestedVariable = variableIncomeAssets.reduce((sum, asset) => sum + (asset.averagePrice * asset.quantity), 0);
    const totalCurrentVariable = variableIncomeAssets.reduce((sum, asset) => sum + (asset.currentPrice * asset.quantity), 0);
    
    const totalInvested = totalInvestedFixed + totalInvestedVariable;
    const totalCurrentValue = totalCurrentFixed + totalCurrentVariable;
    const totalProfitLoss = totalCurrentValue - totalInvested;
    
    return { totalInvested, totalCurrentValue, totalProfitLoss };
  }, [fixedIncomeAssets, variableIncomeAssets]);

  return (
    <div className="space-y-6">
      <Dialog open={isFixedFormOpen} onOpenChange={setFixedFormOpen}>
        <DialogContent className="sm:max-w-[425px]"><DialogHeader><DialogTitle>{editingFixedAsset ? 'Editar' : 'Adicionar'} Ativo de Renda Fixa</DialogTitle></DialogHeader><FixedIncomeForm onSubmitSuccess={() => setFixedFormOpen(false)} initialData={editingFixedAsset} onAddAsset={addFixedIncomeAsset} onUpdateAsset={updateFixedIncomeAsset} /></DialogContent>
      </Dialog>
      <Dialog open={isVariableFormOpen} onOpenChange={setVariableFormOpen}>
        <DialogContent className="sm:max-w-[425px]"><DialogHeader><DialogTitle>{editingVariableAsset ? 'Editar' : 'Adicionar'} Ativo de Renda Variável</DialogTitle></DialogHeader><VariableIncomeForm onSubmitSuccess={() => setVariableFormOpen(false)} initialData={editingVariableAsset} onAddAsset={addVariableIncomeAsset} onUpdateAsset={updateVariableIncomeAsset} /></DialogContent>
      </Dialog>

      <h1 className="text-2xl font-headline font-semibold">Meus Investimentos</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Investido</CardTitle><Wallet /></CardHeader><CardContent><div className="text-2xl font-bold">R$ {totals.totalInvested.toFixed(2)}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Posição Atual</CardTitle><LineChart /></CardHeader><CardContent><div className="text-2xl font-bold">R$ {totals.totalCurrentValue.toFixed(2)}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Lucro/Prejuízo</CardTitle>{totals.totalProfitLoss >= 0 ? <TrendingUp /> : <TrendingDown />}</CardHeader><CardContent><div className={cn("text-2xl font-bold", totals.totalProfitLoss >= 0 ? 'text-green-600' : 'text-destructive')}>R$ {totals.totalProfitLoss.toFixed(2)}</div></CardContent></Card>
      </div>
      
      <Tabs defaultValue="fixed-income">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fixed-income">Renda Fixa</TabsTrigger>
          <TabsTrigger value="variable-income">Renda Variável</TabsTrigger>
        </TabsList>
        <TabsContent value="fixed-income">
          <Card>
            <CardHeader><div className="flex justify-between items-center"><CardTitle>Ativos de Renda Fixa</CardTitle><Button size="sm" onClick={() => handleOpenFixedForm(null)}><PlusCircle className="mr-2 h-4 w-4" />Adicionar</Button></div></CardHeader>
            <CardContent><Table><TableHeader><TableRow><TableHead>Ativo</TableHead><TableHead>Tipo</TableHead><TableHead>Vencimento</TableHead><TableHead className="text-right">Valor Investido</TableHead><TableHead className="text-right">Valor Atual</TableHead><TableHead className="text-right">Rentabilidade</TableHead><TableHead className="text-center">Ações</TableHead></TableRow></TableHeader>
            <TableBody>
              {fixedIncomeAssets.length === 0 ? <TableRow><TableCell colSpan={7} className="h-24 text-center">Nenhum ativo de renda fixa cadastrado.</TableCell></TableRow> :
               fixedIncomeAssets.map(asset => {
                const profit = asset.currentValue - asset.investedAmount;
                const percentage = asset.investedAmount > 0 ? (profit / asset.investedAmount) * 100 : 0;
                return (<TableRow key={asset.id}>
                  <TableCell className="font-medium">{asset.name}</TableCell>
                  <TableCell><Badge variant="outline">{fixedIncomeTypeLabels[asset.type]}</Badge></TableCell>
                  <TableCell>{asset.dueDate ? format(parseISO(asset.dueDate), 'dd/MM/yyyy') : '-'}</TableCell>
                  <TableCell className="text-right">R$ {asset.investedAmount.toFixed(2)}</TableCell>
                  <TableCell className="text-right">R$ {asset.currentValue.toFixed(2)}</TableCell>
                  <TableCell className={cn("text-right font-semibold", profit >= 0 ? 'text-green-600' : 'text-destructive')}>{profit.toFixed(2)} ({percentage.toFixed(2)}%)</TableCell>
                  <TableCell className="text-center"><Button variant="ghost" size="icon" onClick={() => handleOpenFixedForm(asset)}><Edit/></Button>
                    <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2/></Button></AlertDialogTrigger>
                      <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle><AlertDialogDescription>Deseja excluir o ativo "{asset.name}"?</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => deleteFixedIncomeAsset(asset.id)} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>);
               })
              }
            </TableBody></Table></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="variable-income">
          <Card>
            <CardHeader><div className="flex justify-between items-center"><CardTitle>Ativos de Renda Variável</CardTitle><Button size="sm" onClick={() => handleOpenVariableForm(null)}><PlusCircle className="mr-2 h-4 w-4" />Adicionar</Button></div></CardHeader>
            <CardContent><Table><TableHeader><TableRow><TableHead>Ativo</TableHead><TableHead>Tipo</TableHead><TableHead className="text-right">Quantidade</TableHead><TableHead className="text-right">Preço Médio</TableHead><TableHead className="text-right">Cotação Atual</TableHead><TableHead className="text-right">Posição Atual</TableHead><TableHead className="text-right">Resultado</TableHead><TableHead className="text-center">Ações</TableHead></TableRow></TableHeader>
            <TableBody>
              {variableIncomeAssets.length === 0 ? <TableRow><TableCell colSpan={8} className="h-24 text-center">Nenhum ativo de renda variável cadastrado.</TableCell></TableRow> :
               variableIncomeAssets.map(asset => {
                const position = asset.quantity * asset.currentPrice;
                const cost = asset.quantity * asset.averagePrice;
                const profit = position - cost;
                const percentage = cost > 0 ? (profit / cost) * 100 : 0;
                return (<TableRow key={asset.id}>
                  <TableCell className="font-medium">{asset.ticker.toUpperCase()}</TableCell>
                  <TableCell><Badge variant="secondary">{variableIncomeTypeLabels[asset.type]}</Badge></TableCell>
                  <TableCell className="text-right">{asset.quantity.toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="text-right">R$ {asset.averagePrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">R$ {asset.currentPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-semibold">R$ {position.toFixed(2)}</TableCell>
                  <TableCell className={cn("text-right font-semibold", profit >= 0 ? 'text-green-600' : 'text-destructive')}>{profit.toFixed(2)} ({percentage.toFixed(2)}%)</TableCell>
                  <TableCell className="text-center"><Button variant="ghost" size="icon" onClick={() => handleOpenVariableForm(asset)}><Edit/></Button>
                    <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2/></Button></AlertDialogTrigger>
                      <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle><AlertDialogDescription>Deseja excluir o ativo "{asset.ticker.toUpperCase()}"?</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => deleteVariableIncomeAsset(asset.id)} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>);
               })
              }
            </TableBody></Table></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    