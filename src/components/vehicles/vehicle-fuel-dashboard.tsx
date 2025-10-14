
"use client";

import * as React from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Fuel, DollarSign, Gauge, SlidersHorizontal, Coins, Droplets, Car, FileText, Wrench, Shield, Ellipsis, PlusCircle, Edit, Trash2
} from 'lucide-react';

import type { Vehicle, VehicleExpense, FuelType } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface ProcessedFuelData {
  id: string;
  date: string;
  kmInitial: number | null;
  kmFinal: number;
  kmDriven: number;
  liters: number;
  totalCost: number;
  costPerLiter: number;
  kmPerLiter: number;
  station: string | null;
  costPerKm: number;
  originalExpense: VehicleExpense;
}

const otherExpenseTypeDetails: Record<string, { label: string; icon: React.ElementType }> = {
    maintenance: { label: 'Manutenção', icon: Wrench },
    documents: { label: 'Documentação', icon: FileText },
    insurance: { label: 'Seguro', icon: Shield },
    other: { label: 'Outro', icon: Ellipsis },
};

const fuelTypeLabels: Record<FuelType, string> = {
  alcohol: 'Álcool',
  common_gasoline: 'G. Comum',
  additive_gasoline: 'G. Aditivada',
  premium_gasoline: 'G. Premium',
};


interface VehicleFuelDashboardProps {
  vehicle: Vehicle;
  expenses: VehicleExpense[];
  allVehicles: Vehicle[];
  onOpenForm: (expense: VehicleExpense | null) => void;
  onDeleteExpense: (id: string) => void;
}

export function VehicleFuelDashboard({
  vehicle,
  expenses,
  allVehicles,
  onOpenForm,
  onDeleteExpense,
}: VehicleFuelDashboardProps) {
  const [tripDistance, setTripDistance] = React.useState(500);

  const { fuelData, otherExpenses } = React.useMemo(() => {
    // Sort expenses by date and then odometer to establish a clear timeline
    const sortedExpenses = [...expenses].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return a.odometer - b.odometer;
    });
    
    const fuelExpenses = sortedExpenses.filter(e => e.expenseType === 'fuel');
    const otherExpenses = sortedExpenses.filter(e => e.expenseType !== 'fuel');

    const processedFuelData: ProcessedFuelData[] = [];
    if (fuelExpenses.length > 0) {
        // Iterate through fuel expenses to calculate segment-specific data
        fuelExpenses.forEach((expense, index) => {
            if (index === 0) {
                 // The first entry has no preceding data, so consumption cannot be calculated.
                 processedFuelData.push({
                    id: expense.id, date: expense.date, kmInitial: null, kmFinal: expense.odometer, kmDriven: 0,
                    liters: expense.liters || 0, totalCost: expense.amount,
                    costPerLiter: (expense.liters || 0) > 0 ? expense.amount / (expense.liters || 1) : 0,
                    kmPerLiter: 0, station: expense.station || null, costPerKm: 0, originalExpense: expense,
                 });
                 return;
            }
            
            const previousExpense = fuelExpenses[index - 1];
            const kmInitial = previousExpense.odometer;
            const kmDriven = expense.odometer - kmInitial;
            
            // The fuel consumed during this segment is from the *previous* fill-up.
            const litersUsedFromPreviousFillup = previousExpense.liters || 0;
            
            const currentLiters = expense.liters || 0;
            const totalCost = expense.amount;
            
            const costPerLiter = currentLiters > 0 ? totalCost / currentLiters : 0;
            // Corrected calculation for Km/Liter
            const kmPerLiter = litersUsedFromPreviousFillup > 0 && kmDriven > 0 ? kmDriven / litersUsedFromPreviousFillup : 0;
            // Cost per km for the segment, based on the cost of the fill-up at the end of the segment.
            const costPerKm = kmDriven > 0 ? totalCost / kmDriven : 0;

            processedFuelData.push({
                id: expense.id, date: expense.date, kmInitial, kmFinal: expense.odometer, kmDriven,
                liters: currentLiters, totalCost, costPerLiter, kmPerLiter, station: expense.station || null, costPerKm, originalExpense: expense
            });
        });
    }

    // Sort descending for display
    return { fuelData: processedFuelData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), otherExpenses };
  }, [expenses]);
  
  const averages = React.useMemo(() => {
    // Sort all fuel expenses chronologically
    const sortedFuelExpenses = expenses
      .filter(e => e.expenseType === 'fuel')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.odometer - b.odometer);
      
    // Calculate totals based on all expenses for display
    const totalLitersAll = sortedFuelExpenses.reduce((sum, data) => sum + (data.liters || 0), 0);
    const totalCostAll = sortedFuelExpenses.reduce((sum, data) => sum + data.amount, 0);
    const avgCostPerLiter = totalLitersAll > 0 ? totalCostAll / totalLitersAll : 0;
    
    // For overall display, calculate the full range of driven KMs
    const totalKmDriven = sortedFuelExpenses.length >= 2
      ? sortedFuelExpenses[sortedFuelExpenses.length - 1].odometer - sortedFuelExpenses[0].odometer
      : 0;

    // --- New logic for average consumption calculation ---
    // We need at least 3 entries to calculate an average if we ignore the first one.
    // (e.g., #1 is ignored, #2 is start point, #3 is end point of first segment)
    if (sortedFuelExpenses.length < 3) {
      return {
        totalLiters: totalLitersAll,
        totalCost: totalCostAll,
        totalKmDriven: totalKmDriven,
        avgCostPerLiter,
        avgKmPerLiter: 0,
        avgCostPerKm: 0,
      };
    }
    
    // Start calculations from the second entry (index 1).
    const kmDrivenForAvg = sortedFuelExpenses[sortedFuelExpenses.length - 1].odometer - sortedFuelExpenses[1].odometer;

    let litersConsumedForAvg = 0;
    // Sum liters from the second refueling (index 1) up to the one before last.
    for (let i = 1; i < sortedFuelExpenses.length - 1; i++) {
        litersConsumedForAvg += sortedFuelExpenses[i].liters || 0;
    }

    let costForAvg = 0;
    // Sum costs from the third refueling (index 2) up to the last one.
    // This represents the cost of the fuel used for the KMs driven in the average calculation.
    for (let i = 2; i < sortedFuelExpenses.length; i++) {
        costForAvg += sortedFuelExpenses[i].amount;
    }

    const avgKmPerLiter = litersConsumedForAvg > 0 ? kmDrivenForAvg / litersConsumedForAvg : 0;
    const avgCostPerKm = kmDrivenForAvg > 0 ? costForAvg / kmDrivenForAvg : 0;

    return {
      totalLiters: totalLitersAll,
      totalCost: totalCostAll,
      totalKmDriven: totalKmDriven,
      avgCostPerLiter,
      avgKmPerLiter,
      avgCostPerKm,
    };
  }, [expenses]);
  
  const tripCost = React.useMemo(() => {
    return tripDistance * (averages.avgCostPerKm || 0);
  }, [tripDistance, averages.avgCostPerKm]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center gap-2 text-white">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <SlidersHorizontal className="h-5 w-5 text-blue-400" />
              </div>
              Médias (Combustível)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="flex items-center gap-2 text-slate-300">
                <Droplets size={16} className="text-blue-400"/>
                Total Litros
              </span> 
              <span className="font-semibold text-white">{averages.totalLiters.toFixed(2)} L</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="flex items-center gap-2 text-slate-300">
                <DollarSign size={16} className="text-green-400"/>
                Custo Total
              </span> 
              <span className="font-semibold text-white">R$ {averages.totalCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="flex items-center gap-2 text-slate-300">
                <Fuel size={16} className="text-red-400"/>
                Custo/Litro
              </span> 
              <span className="font-semibold text-white">R$ {averages.avgCostPerLiter.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="flex items-center gap-2 text-slate-300">
                <Gauge size={16} className="text-purple-400"/>
                Km/Litro
              </span> 
              <span className="font-semibold text-white">{averages.avgKmPerLiter.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="flex items-center gap-2 text-slate-300">
                <Car size={16} className="text-orange-400"/>
                Custo/Km
              </span> 
              <span className="font-semibold text-white">R$ {averages.avgCostPerKm.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-lg text-white flex items-center gap-2">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Car className="h-5 w-5 text-blue-400" />
              </div>
              Simulador de Viagem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label htmlFor="trip-distance" className="text-sm font-medium flex items-center gap-2 mb-3 text-slate-300">
                <Gauge size={16} className="text-purple-400"/>
                Km da Viagem
              </label>
              <Input 
                id="trip-distance" 
                type="number" 
                value={tripDistance} 
                onChange={(e) => setTripDistance(Number(e.target.value))} 
                placeholder="ex: 500" 
                className="bg-white/5 border-slate-600 text-white placeholder:text-slate-400 focus:bg-white/10"
              />
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-slate-600">
              <p className="text-sm font-medium flex items-center gap-2 mb-2 text-slate-300">
                <Coins size={16} className="text-green-400"/>
                Custo Estimado da Viagem
              </p>
              <p className="text-3xl font-bold font-headline text-white">R$ {tripCost.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-headline font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
              Histórico de Despesas
            </h3>
            <Button 
              onClick={() => onOpenForm(null)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Despesa
            </Button>
        </div>
        
        <Card className="shadow-xl border-0 bg-gradient-to-br from-slate-800 to-slate-900">
            <CardContent className="p-0">
            <Table>
                <TableHeader>
                <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Data</TableHead>
                    <TableHead className="text-slate-300">Tipo</TableHead>
                    <TableHead className="text-slate-300">Combustível</TableHead>
                    <TableHead className="text-right text-slate-300">Km Inicial</TableHead>
                    <TableHead className="text-right text-slate-300">Km Final</TableHead>
                    <TableHead className="text-right text-slate-300">Km Rodados</TableHead>
                    <TableHead className="text-right text-slate-300">Litros</TableHead>
                    <TableHead className="text-slate-300">Posto</TableHead>
                    <TableHead className="text-right text-slate-300">Custo Total</TableHead>
                    <TableHead className="text-right text-slate-300">R$/Litro</TableHead>
                    <TableHead className="text-right text-slate-300">Km/Litro</TableHead>
                    <TableHead className="text-right text-slate-300">R$/Km</TableHead>
                    <TableHead className="text-center text-slate-300">Ações</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {fuelData.length === 0 && otherExpenses.length === 0 && (
                    <TableRow className="border-slate-700">
                        <TableCell colSpan={13} className="h-24 text-center text-slate-300">Nenhuma despesa registrada para este veículo.</TableCell>
                    </TableRow>
                )}
                {fuelData.map((data) => (
                    <TableRow key={data.id} className="border-slate-700">
                    <TableCell className="text-white">{format(parseISO(data.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell><Badge variant="outline" className="border-slate-600 text-slate-300"><Fuel className="h-3 w-3 mr-1" /> Combustível</Badge></TableCell>
                    <TableCell className="text-white">{data.originalExpense.fuelType ? fuelTypeLabels[data.originalExpense.fuelType] : '-'}</TableCell>
                    <TableCell className="text-right text-white">{data.kmInitial || '-'}</TableCell>
                    <TableCell className="text-right text-white">{data.kmFinal}</TableCell>
                    <TableCell className="text-right text-white">{data.kmDriven > 0 ? data.kmDriven : '-'}</TableCell>
                    <TableCell className="text-right text-white">{data.liters.toFixed(2)}</TableCell>
                    <TableCell className="text-white">{data.station || '-'}</TableCell>
                    <TableCell className="text-right font-medium text-white">R$ {data.totalCost.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-white">{data.costPerLiter > 0 ? `R$ ${data.costPerLiter.toFixed(2)}` : '-'}</TableCell>
                    <TableCell className="text-right text-white">{data.kmPerLiter > 0 ? data.kmPerLiter.toFixed(2) : '-'}</TableCell>
                    <TableCell className="text-right text-white">{data.costPerKm > 0 ? `R$ ${data.costPerKm.toFixed(2)}` : '-'}</TableCell>
                    <TableCell className="text-center">
                        <Button variant="ghost" size="icon" onClick={() => onOpenForm(data.originalExpense)} className="mr-1 text-slate-300 hover:text-white hover:bg-slate-700">
                            <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>Tem certeza que deseja excluir esta despesa?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDeleteExpense(data.id)} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                    </TableRow>
                ))}
                {otherExpenses.map((expense) => {
                    const typeInfo = otherExpenseTypeDetails[expense.expenseType] || otherExpenseTypeDetails.other;
                    return (
                        <TableRow key={expense.id} className="border-slate-700">
                             <TableCell className="text-white">{format(parseISO(expense.date), 'dd/MM/yyyy')}</TableCell>
                             <TableCell>
                                <Badge variant="secondary" className="bg-slate-700 text-slate-300 border-slate-600"><typeInfo.icon className="h-3 w-3 mr-1" />{typeInfo.label}</Badge>
                             </TableCell>
                             <TableCell className="text-white">-</TableCell>
                             <TableCell colSpan={5} className="text-slate-300">{expense.description}</TableCell>
                             <TableCell className="text-right font-medium text-white">R$ {expense.amount.toFixed(2)}</TableCell>
                             <TableCell colSpan={3}></TableCell>
                             <TableCell className="text-center">
                                <Button variant="ghost" size="icon" onClick={() => onOpenForm(expense)} className="mr-1 text-slate-300 hover:text-white hover:bg-slate-700">
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                        <AlertDialogDescription>Tem certeza que deseja excluir esta despesa de '{expense.description}'?</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => onDeleteExpense(expense.id)} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                                    </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    )
                })}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
