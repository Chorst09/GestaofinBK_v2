
"use client";

import * as React from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Trash, Trash2, Edit, FileText } from 'lucide-react';

import type { Vehicle, VehicleExpense } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { ScheduledMaintenance } from '@/lib/types';
interface VehicleMaintenanceHistoryProps {
  vehicle: Vehicle;
  allVehicles: Vehicle[];
  expenses: VehicleExpense[];
  onOpenForm: (expense: VehicleExpense | null) => void;
  onDeleteExpense: (id: string) => void;
  onDeleteAllMaintenance: (vehicleId: string) => void;
 nextMaintenance: ScheduledMaintenance | null;
}

export function VehicleMaintenanceHistory({
  vehicle,
  allVehicles,
  expenses,
  onOpenForm,
  onDeleteExpense,
 nextMaintenance,
  onDeleteAllMaintenance,
}: VehicleMaintenanceHistoryProps) {
  const { toast } = useToast();
  const [selectedExpenseId, setSelectedExpenseId] = React.useState<string | null>(null);

  const maintenanceExpenses = React.useMemo(() => {
    return expenses
      .filter(e => e.expenseType === 'maintenance')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses]);
  
  const handleDeleteAll = () => {
    onDeleteAllMaintenance(vehicle.id);
    toast({ title: "Histórico de Manutenções Apagado", description: `Todas as manutenções de ${vehicle.name} foram removidas.` });
  };
  
  const handleDeleteSelected = () => {
    if (selectedExpenseId) {
        onDeleteExpense(selectedExpenseId);
        toast({ title: "Manutenção Removida", description: "O registro de manutenção foi apagado." });
        setSelectedExpenseId(null);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="font-headline">Controle de Manutenções Executadas</CardTitle>
          <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2">
            <Button onClick={() => onOpenForm(null)} size="sm">
              <Plus className="mr-2 h-4 w-4" /> Novo Cadastro
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                   <Button variant="outline" size="sm" disabled={!selectedExpenseId}>
                        <Trash className="mr-2 h-4 w-4" /> Apagar Cadastro
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Apagar Cadastro Selecionado</AlertDialogTitle>
                    <AlertDialogDescription>Tem certeza que deseja apagar o registro de manutenção selecionado? Esta ação não pode ser desfeita.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSelectedExpenseId(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteSelected} className="bg-destructive hover:bg-destructive/90">Apagar</AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {maintenanceExpenses.length > 0 && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" /> Apagar Toda Tabela
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão Total</AlertDialogTitle>
                        <AlertDialogDescription>Tem certeza que deseja apagar TODOS os registros de manutenção para o veículo "{vehicle.name}"? Esta ação não pode ser desfeita.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAll} className="bg-destructive hover:bg-destructive/90">Apagar Tudo</AlertDialogAction>
                    </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
 {/* New section for Next Maintenance */}
 {nextMaintenance && (
 <div className="mb-6 p-4 border rounded-md bg-yellow-50 border-yellow-200 text-yellow-800">
 <h3 className="text-lg font-semibold mb-2">Próxima Manutenção Agendada</h3>
 <p>
              <strong className="font-medium">Data:</strong>{' '}
 {format(parseISO(nextMaintenance.date), 'dd/MM/yyyy', {
 locale: ptBR,
 })}
 </p>
 <p>
 <strong className="font-medium">Descrição:</strong>{' '}
 {nextMaintenance.description}
 </p>
 {nextMaintenance.observation && (
 <p><strong className="font-medium">Observação:</strong> {nextMaintenance.observation}</p>
 )}
 </div>
 )}
        <p className="text-sm text-muted-foreground mb-4">
            Informações da Manutenção Executada. Clique em uma linha para selecionar e apagar.
        </p>
        <div className="border rounded-md overflow-x-auto">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Placa do Veículo</TableHead>
                <TableHead>KM na Manutenção</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-center">Qtd.</TableHead>
                <TableHead className="text-right">Valor R$</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead className="text-center">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {maintenanceExpenses.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">Nenhum registro de manutenção encontrado.</TableCell>
                </TableRow>
                ) : (
                maintenanceExpenses.map((item) => {
                    const vehicleOfExpense = allVehicles.find(v => v.id === item.vehicleId);
                    return (
                    <TableRow 
                        key={item.id} 
                        onClick={() => setSelectedExpenseId(item.id)}
                        className={cn("cursor-pointer", selectedExpenseId === item.id && "bg-muted")}
                    >
                        <TableCell>{format(parseISO(item.date), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>
                            <Badge variant="outline">{vehicleOfExpense?.plate || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell>{item.odometer.toLocaleString('pt-BR')} km</TableCell>
                        <TableCell className="font-medium">{item.description}</TableCell>
                        <TableCell>{item.maintenanceType || 'N/A'}</TableCell>
                        <TableCell className="text-center">{item.quantity || '-'}</TableCell>
                        <TableCell className="text-right font-semibold">R$ {item.amount.toFixed(2)}</TableCell>
                        <TableCell>
                            {item.fileName && item.fileDataUri ? (
                                <Button variant="link" asChild className="p-0 h-auto text-xs sm:text-sm">
                                    <a href={item.fileDataUri} download={item.fileName}>
                                        <FileText className="mr-1 h-4 w-4" /> Baixar
                                    </a>
                                </Button>
                            ) : (
                                '-'
                            )}
                        </TableCell>
                        <TableCell className="text-center">
                            <Button variant="ghost" size="icon" onClick={(e) => {e.stopPropagation(); onOpenForm(item);}} className="mr-1">
                                <Edit className="h-4 w-4" />
                            </Button>
                        </TableCell>
                    </TableRow>
                    );
                })
                )}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
