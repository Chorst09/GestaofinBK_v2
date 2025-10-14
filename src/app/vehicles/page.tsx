
"use client";

import * as React from 'react';
import { PlusCircle, Car, Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';

import { useVehicles } from '@/hooks/useVehicles';
import { useVehicleExpenses } from '@/hooks/useVehicleExpenses';
import { useScheduledMaintenances } from '@/hooks/useScheduledMaintenances';
import type { Vehicle, VehicleExpense, ScheduledMaintenance } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { VehicleForm } from '@/components/vehicles/vehicle-form';
import { VehicleExpenseForm } from '@/components/vehicles/vehicle-expense-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VehicleFuelDashboard } from '@/components/vehicles/vehicle-fuel-dashboard';
import { VehicleMaintenanceScheduler } from '@/components/vehicles/vehicle-maintenance-scheduler';
import { VehicleMaintenanceHistory } from '@/components/vehicles/vehicle-maintenance-history';
import { VehicleFuelCharts } from '@/components/vehicles/vehicle-fuel-charts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddToCalendarCard } from '@/components/vehicles/add-to-calendar-card'; // Import the new component
import { NextMaintenanceCard } from '@/components/vehicles/next-maintenance-card'; // Import the new component
import { BankLogo } from '@/components/layout/BankLogo';

export default function VehiclesPage() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useVehicles();
  const { 
    getExpensesForVehicle, 
    addVehicleExpense, 
    updateVehicleExpense, 
    deleteVehicleExpense, 
    deleteExpensesForVehicle,
    deleteAllMaintenanceForVehicle,
  } = useVehicleExpenses();
  const {
    getMaintenancesForVehicle,
    addMaintenance,
    updateMaintenance,
    deleteMaintenance,
    deleteAllMaintenancesForVehicle
  } = useScheduledMaintenances();

  const { toast } = useToast();

  const [isVehicleFormOpen, setVehicleFormOpen] = React.useState(false);
  const [editingVehicle, setEditingVehicle] = React.useState<Vehicle | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = React.useState<string | null>(null);
  
  const [expenseFormState, setExpenseFormState] = React.useState<{
    isOpen: boolean;
    editingExpense: VehicleExpense | null;
    defaultType: 'fuel' | 'maintenance' | 'documents' | 'insurance' | 'other';
  }>({ isOpen: false, editingExpense: null, defaultType: 'fuel' });

  React.useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(vehicles[0].id);
    }
    if (vehicles.length === 0) {
      setSelectedVehicleId(null);
    }
  }, [vehicles, selectedVehicleId]);

  const handleOpenVehicleForm = (vehicle: Vehicle | null) => {
    setEditingVehicle(vehicle);
    setVehicleFormOpen(true);
  };

  const handleVehicleFormSuccess = () => {
    setVehicleFormOpen(false);
    setEditingVehicle(null);
  };
  
  const handleOpenExpenseForm = (expense: VehicleExpense | null, type: 'fuel' | 'maintenance' | 'other' = 'fuel') => {
    setExpenseFormState({ isOpen: true, editingExpense: expense, defaultType: type });
  };
  
  const handleExpenseFormSuccess = () => {
    setExpenseFormState({ isOpen: false, editingExpense: null, defaultType: 'fuel' });
  };
  
  const selectedVehicle = React.useMemo(() => {
    if (!selectedVehicleId) return null;
    return vehicles.find(v => v.id === selectedVehicleId);
  }, [selectedVehicleId, vehicles]);
  
  const expensesForSelectedVehicle = React.useMemo(() => {
      if (!selectedVehicleId) return [];
      return getExpensesForVehicle(selectedVehicleId);
  }, [selectedVehicleId, getExpensesForVehicle]);

  const maintenancesForSelectedVehicle = React.useMemo(() => {
    if (!selectedVehicleId) return [];
    return getMaintenancesForVehicle(selectedVehicleId);
  }, [selectedVehicleId, getMaintenancesForVehicle]);

  // Find the next scheduled maintenance
  const nextMaintenance = React.useMemo(() => {
    if (!maintenancesForSelectedVehicle || maintenancesForSelectedVehicle.length === 0) return null;

    const futureMaintenances = maintenancesForSelectedVehicle.filter(m => new Date(m.date) >= new Date());

    if (futureMaintenances.length === 0) return null;

    // Sort to find the soonest
    futureMaintenances.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return futureMaintenances[0];
  }, [maintenancesForSelectedVehicle]);

  const handleDeleteVehicle = (id: string) => {
    const vehicleName = vehicles.find(v => v.id === id)?.name || "Veículo";
    deleteVehicle(id);
    deleteExpensesForVehicle(id);
    deleteAllMaintenancesForVehicle(id);
    toast({ title: "Veículo excluído", description: `O veículo "${vehicleName}" e todos os seus dados foram removidos.`});
  };

  return (
    <div className="space-y-6">
       <Dialog open={isVehicleFormOpen} onOpenChange={setVehicleFormOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-headline">{editingVehicle ? 'Editar Veículo' : 'Adicionar Novo Veículo'}</DialogTitle>
            <DialogDescription>{editingVehicle ? 'Atualize os detalhes do seu veículo.' : 'Preencha os detalhes do novo veículo.'}</DialogDescription>
          </DialogHeader>
          <VehicleForm
            onSubmitSuccess={handleVehicleFormSuccess}
            initialData={editingVehicle}
            onAddVehicle={addVehicle}
            onUpdateVehicle={updateVehicle}
          />
        </DialogContent>
      </Dialog>
      
      {/* Expense Form Dialog */}
      <Dialog open={expenseFormState.isOpen} onOpenChange={(isOpen) => setExpenseFormState(prev => ({ ...prev, isOpen }))}>
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle className="font-headline">{expenseFormState.editingExpense ? 'Editar Despesa' : 'Adicionar Nova Despesa'}</DialogTitle>
            </DialogHeader>
            <VehicleExpenseForm
                onSubmitSuccess={handleExpenseFormSuccess}
                initialData={expenseFormState.editingExpense}
                vehicles={vehicles}
                currentVehicleId={selectedVehicleId || ''}
                onAddExpense={addVehicleExpense}
                onUpdateExpense={updateVehicleExpense}
                defaultType={expenseFormState.defaultType}
            />
        </DialogContent>
      </Dialog>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-headline font-semibold">Gestão de Veículos</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {vehicles.length > 0 && (
            <Select onValueChange={setSelectedVehicleId} value={selectedVehicleId || ''}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Selecione um veículo" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map(vehicle => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.name} ({vehicle.plate || `${vehicle.brand} ${vehicle.model}`})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button onClick={() => handleOpenVehicleForm(null)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Veículo
          </Button>
        </div>
      </div>
      
      {!selectedVehicle ? (
        <Card className="text-center py-12">
            <CardHeader>
                <Car className="mx-auto h-12 w-12 text-muted-foreground" />
                <CardTitle className="mt-4 font-headline">
                  {vehicles.length === 0 ? 'Nenhum veículo cadastrado' : 'Selecione um veículo'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription>
                  {vehicles.length === 0 
                    ? 'Comece adicionando seu primeiro veículo para gerenciar os gastos.'
                    : 'Escolha um veículo no seletor acima para ver os detalhes.'}
                </CardDescription>
                {vehicles.length === 0 && (
                  <Button className="mt-4" onClick={() => handleOpenVehicleForm(null)}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Primeiro Veículo
                  </Button>
                )}
            </CardContent>
        </Card>
      ) : (
        <div>
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">

                    {selectedVehicle.photoUrl ? (
                      <Image 
                          src={selectedVehicle.photoUrl} 
                          alt={`Foto de ${selectedVehicle.name}`} 
                          width={48} 
                          height={48} 
                          className="rounded-lg object-cover w-12 h-12 border"
                      />
                    ) : (
                        <BankLogo logoKey={selectedVehicle.logoKey} type="vehicle" className="h-12 w-12 text-primary" />
                    )}
                    <div>
                        <h2 className="text-xl font-bold font-headline">{selectedVehicle.name}</h2>
                        <p className="text-muted-foreground">{selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.year})</p>
                    </div>
                </div>
                <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenVehicleForm(selectedVehicle)} className="mr-1">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar Veículo</span>
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Excluir Veículo</span>
                        </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                            Tem certeza que deseja excluir o veículo "{selectedVehicle.name}"? Todas as despesas associadas a ele também serão removidas. Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteVehicle(selectedVehicle.id)} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
            
            {/* Next Maintenance Card */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                 <NextMaintenanceCard nextMaintenance={nextMaintenance} />
                 <AddToCalendarCard nextMaintenance={nextMaintenance} /> {/* Add the new card */}
                 {/* You can add other cards here if needed */}
            </div>

            <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="dashboard">Abastecimentos</TabsTrigger>
                    <TabsTrigger value="maintenanceControl">Controle de Manutenções</TabsTrigger>
                    <TabsTrigger value="maintenanceSchedule">Agendar Manutenções</TabsTrigger>
                </TabsList>
                <TabsContent value="dashboard">
                    <VehicleFuelDashboard 
                        key={`${selectedVehicle.id}-fuel`}
                        vehicle={selectedVehicle} 
                        expenses={expensesForSelectedVehicle}
                        allVehicles={vehicles}
                        onOpenForm={handleOpenExpenseForm}
                        onDeleteExpense={deleteVehicleExpense}
                    />
                    <VehicleFuelCharts
                        key={`${selectedVehicle.id}-fuel-charts`}
                        expenses={expensesForSelectedVehicle}
                        allVehicles={vehicles}
                    />
                </TabsContent>
                <TabsContent value="maintenanceControl">
                    <VehicleMaintenanceHistory
                        key={`${selectedVehicle.id}-maintenance-history`}
                        vehicle={selectedVehicle}
                        allVehicles={vehicles}
                        expenses={expensesForSelectedVehicle}
                        onOpenForm={(expense) => handleOpenExpenseForm(expense, 'maintenance')}
                        onDeleteExpense={deleteVehicleExpense}
                        onDeleteAllMaintenance={deleteAllMaintenanceForVehicle}
                        nextMaintenance={nextMaintenance} // Pass the nextMaintenance data
                    />
                </TabsContent>
                <TabsContent value="maintenanceSchedule">
                    <VehicleMaintenanceScheduler
                        key={`${selectedVehicle.id}-maintenance-schedule`}
                        vehicle={selectedVehicle}
                        allVehicles={vehicles}
                        expenses={expensesForSelectedVehicle}
                        maintenances={maintenancesForSelectedVehicle}
                        onAddMaintenance={addMaintenance}
                        onUpdateMaintenance={updateMaintenance}
                        onDeleteMaintenance={deleteMaintenance}
                        onDeleteAllMaintenances={deleteAllMaintenancesForVehicle}
                    />
                </TabsContent>
            </Tabs>
        </div>
      )}
    </div>
  );
}
