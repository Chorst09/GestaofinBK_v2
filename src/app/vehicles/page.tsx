
"use client";

import * as React from 'react';
import { PlusCircle, Car, Edit, Trash2, Fuel } from 'lucide-react';
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
        <div>
          <h1 className="text-3xl font-headline font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Gestão de Veículos
          </h1>
          <p className="text-muted-foreground mt-1">
            Controle completo dos seus veículos e despesas
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {vehicles.length > 0 && (
            <Select onValueChange={setSelectedVehicleId} value={selectedVehicleId || ''}>
              <SelectTrigger className="w-full sm:w-[280px] bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200 shadow-sm">
                <SelectValue placeholder="Selecione um veículo" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map(vehicle => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    <div className="flex items-center gap-2">
                      <BankLogo logoKey={vehicle.logoKey} type="vehicle" className="h-4 w-4" />
                      {vehicle.name} ({vehicle.plate || `${vehicle.brand} ${vehicle.model}`})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button onClick={() => handleOpenVehicleForm(null)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Veículo
          </Button>
        </div>
      </div>
      
      {!selectedVehicle ? (
        <Card className="text-center py-16 bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-xl">
            <CardHeader>
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Car className="h-10 w-10 text-blue-600" />
                </div>
                <CardTitle className="mt-4 font-headline text-2xl">
                  {vehicles.length === 0 ? 'Nenhum veículo cadastrado' : 'Selecione um veículo'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription className="text-lg mb-6">
                  {vehicles.length === 0 
                    ? 'Comece adicionando seu primeiro veículo para gerenciar os gastos de forma inteligente.'
                    : 'Escolha um veículo no seletor acima para ver os detalhes e análises.'}
                </CardDescription>
                {vehicles.length === 0 && (
                  <Button 
                    className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg px-8 py-3 text-lg" 
                    onClick={() => handleOpenVehicleForm(null)}
                  >
                      <PlusCircle className="mr-2 h-5 w-5" /> Adicionar Primeiro Veículo
                  </Button>
                )}
            </CardContent>
        </Card>
      ) : (
        <div>
            <Card className="mb-6 bg-gradient-to-r from-slate-800 to-slate-900 text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-6">
                      <div className="relative">
                        {selectedVehicle.photoUrl ? (
                          <Image 
                              src={selectedVehicle.photoUrl} 
                              alt={`Foto de ${selectedVehicle.name}`} 
                              width={80} 
                              height={80} 
                              className="rounded-xl object-cover w-20 h-20 border-2 border-white/20 shadow-lg"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <BankLogo logoKey={selectedVehicle.logoKey} type="vehicle" className="h-10 w-10 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                          <h2 className="text-2xl font-bold font-headline text-white mb-1">{selectedVehicle.name}</h2>
                          <p className="text-slate-300 text-lg">{selectedVehicle.brand} {selectedVehicle.model}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm bg-white/10 px-3 py-1 rounded-full">Ano: {selectedVehicle.year}</span>
                            {selectedVehicle.plate && (
                              <span className="text-sm bg-white/10 px-3 py-1 rounded-full">Placa: {selectedVehicle.plate}</span>
                            )}
                          </div>
                      </div>
                  </div>
                  <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenVehicleForm(selectedVehicle)} className="text-white hover:bg-white/10">
                          <Edit className="h-5 w-5" />
                          <span className="sr-only">Editar Veículo</span>
                      </Button>
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                              <Trash2 className="h-5 w-5" />
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
              </CardContent>
            </Card>
            
            {/* Next Maintenance Card */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                 <NextMaintenanceCard nextMaintenance={nextMaintenance} />
                 <AddToCalendarCard nextMaintenance={nextMaintenance} /> {/* Add the new card */}
                 {/* You can add other cards here if needed */}
            </div>

            <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-slate-700 to-slate-800 p-1 rounded-xl shadow-inner">
                    <TabsTrigger value="dashboard" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium text-slate-300">
                      <Fuel className="h-4 w-4 mr-2" />
                      Abastecimentos
                    </TabsTrigger>
                    <TabsTrigger value="maintenanceControl" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium text-slate-300">
                      <Car className="h-4 w-4 mr-2" />
                      Controle de Manutenções
                    </TabsTrigger>
                    <TabsTrigger value="maintenanceSchedule" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium text-slate-300">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Agendar Manutenções
                    </TabsTrigger>
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
