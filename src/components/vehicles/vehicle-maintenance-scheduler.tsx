
"use client";

import * as React from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Trash, Trash2, Edit, FileText } from 'lucide-react';

import type { Vehicle, VehicleExpense, ScheduledMaintenance, ScheduledMaintenanceFormData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { VehicleMaintenanceForm } from './vehicle-maintenance-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Badge } from '../ui/badge';

interface VehicleMaintenanceSchedulerProps {
  vehicle: Vehicle;
  allVehicles: Vehicle[];
  expenses: VehicleExpense[];
  maintenances: ScheduledMaintenance[];
  onAddMaintenance: (data: ScheduledMaintenanceFormData) => void;
  onUpdateMaintenance: (data: ScheduledMaintenance) => void;
  onDeleteMaintenance: (id: string) => void;
  onDeleteAllMaintenances: (vehicleId: string) => void;
}

export function VehicleMaintenanceScheduler({
  vehicle,
  allVehicles,
  expenses,
  maintenances,
  onAddMaintenance,
  onUpdateMaintenance,
  onDeleteMaintenance,
  onDeleteAllMaintenances,
}: VehicleMaintenanceSchedulerProps) {
  const { toast } = useToast();
  const [isFormOpen, setFormOpen] = React.useState(false);
  const [editingMaintenance, setEditingMaintenance] = React.useState<ScheduledMaintenance | null>(null);

  const latestOdometer = React.useMemo(() => {
    const expenseOdometerReadings = expenses.map(e => e.odometer);
    const maintenanceOdometerReadings = maintenances.map(m => m.odometer);
    const allOdometerReadings = [...expenseOdometerReadings, ...maintenanceOdometerReadings];
    if (allOdometerReadings.length === 0) return 0;
    return Math.max(...allOdometerReadings);
  }, [expenses, maintenances]);


  const handleOpenForm = (maintenance: ScheduledMaintenance | null) => {
    setEditingMaintenance(maintenance);
    setFormOpen(true);
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditingMaintenance(null);
  };

  const handleDeleteAll = () => {
    onDeleteAllMaintenances(vehicle.id);
    toast({ title: "Registros removidos", description: `Todos os registros de manutenção para ${vehicle.name} foram excluídos.` });
  };

  return (
    <Card className="mt-6">
      <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-headline">{editingMaintenance ? 'Editar Registro de Manutenção' : 'Registrar Nova Manutenção'}</DialogTitle>
          </DialogHeader>
          <VehicleMaintenanceForm
            onSubmitSuccess={handleFormSuccess}
            initialData={editingMaintenance}
            vehicles={allVehicles}
            currentVehicleId={vehicle.id}
            onAddMaintenance={onAddMaintenance}
            onUpdateMaintenance={onUpdateMaintenance}
          />
        </DialogContent>
      </Dialog>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                 <CardTitle className="font-headline">Diário de Manutenções</CardTitle>
                 {latestOdometer > 0 && (
                    <div className="text-sm text-muted-foreground mt-1">
                        KM Atual do Veículo: <span className="font-bold text-foreground">{latestOdometer.toLocaleString('pt-BR')} km</span>
                    </div>
                )}
            </div>
          <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2">
            <Button onClick={() => handleOpenForm(null)} size="sm">
              <Plus className="mr-2 h-4 w-4" /> Novo Registro
            </Button>
            {maintenances.length > 0 && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button variant="destructive" size="sm">
                            <Trash className="mr-2 h-4 w-4" /> Apagar Tabela
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">KM do Serviço</TableHead>
                <TableHead className="text-right">Próxima Revisão (KM)</TableHead>
                <TableHead className="text-right">KM Restante</TableHead>
                <TableHead className="text-center">Qtd.</TableHead>
                <TableHead className="text-right">Valor (R$)</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {maintenances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">Nenhum registro de manutenção encontrado.</TableCell>
                </TableRow>
              ) : (
                maintenances.map((item) => {
                  const kmRestante = item.nextServiceOdometer && latestOdometer > 0 ? item.nextServiceOdometer - latestOdometer : null;
                  
                  let badgeVariant: "secondary" | "default" | "destructive" = "secondary";
                  if (kmRestante !== null) {
                      if (kmRestante < 0) {
                          badgeVariant = "destructive";
                      } else if (kmRestante <= 600) {
                          badgeVariant = "default";
                      }
                  }

                  return (
                    <TableRow key={item.id}>
                      <TableCell>{format(parseISO(item.date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell className="text-right">{item.odometer.toLocaleString('pt-BR')} km</TableCell>
                      <TableCell className="text-right">{item.nextServiceOdometer ? item.nextServiceOdometer.toLocaleString('pt-BR') : '-'}</TableCell>
                      <TableCell className="text-right">
                          {kmRestante !== null ? (
                              <Badge variant={badgeVariant}>
                                  {kmRestante.toLocaleString('pt-BR')} km
                              </Badge>
                          ) : '-'}
                      </TableCell>
                      <TableCell className="text-center">{item.quantity || '-'}</TableCell>
                      <TableCell className="text-right font-semibold">
                          {item.amount !== undefined ? `R$ ${item.amount.toFixed(2)}` : '-'}
                      </TableCell>
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
                          <Button variant="ghost" size="icon" onClick={() => handleOpenForm(item)} className="mr-1">
                              <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>Tem certeza que deseja excluir o registro de '{item.description}'?</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => onDeleteMaintenance(item.id)} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                              </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
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
