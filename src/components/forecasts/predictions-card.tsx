"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Calendar,
    Coffee,
    Fuel,
    TrendingUp,
    Calculator,
    Edit2,
    Save,
    X,
    UtensilsCrossed
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PredictionData {
    weeklyExpenses: number;
    weekendExpenses: number;
    foodExpenses: number;
    fuelExpenses: number;
}

export function PredictionsCard() {
    const { toast } = useToast();
    const [isEditing, setIsEditing] = React.useState(false);
    const [predictions, setPredictions] = React.useState<PredictionData>({
        weeklyExpenses: 0,
        weekendExpenses: 0,
        foodExpenses: 0,
        fuelExpenses: 0,
    });

    const [editValues, setEditValues] = React.useState<PredictionData>(predictions);

    // Carregar dados salvos do localStorage na inicialização
    React.useEffect(() => {
        const savedPredictions = localStorage.getItem('financeiro-zen-predictions');
        if (savedPredictions) {
            try {
                const parsed = JSON.parse(savedPredictions);
                setPredictions(parsed);
                setEditValues(parsed);
            } catch (error) {
                console.error('Erro ao carregar previsões salvas:', error);
            }
        }
    }, []);

    const handleSave = () => {
        setPredictions(editValues);
        localStorage.setItem('financeiro-zen-predictions', JSON.stringify(editValues));
        setIsEditing(false);
        toast({
            title: "Previsões salvas!",
            description: "Suas previsões de gastos foram atualizadas com sucesso.",
        });
    };

    const handleCancel = () => {
        setEditValues(predictions);
        setIsEditing(false);
    };

    const handleInputChange = (field: keyof PredictionData, value: string) => {
        // Remove caracteres não numéricos exceto vírgula e ponto
        const cleanValue = value.replace(/[^\d.,]/g, '');

        // Converte vírgula para ponto (padrão brasileiro)
        const normalizedValue = cleanValue.replace(',', '.');

        // Limita a 2 casas decimais
        const parts = normalizedValue.split('.');
        if (parts.length > 2) {
            return; // Não permite mais de um ponto decimal
        }
        if (parts[1] && parts[1].length > 2) {
            parts[1] = parts[1].substring(0, 2);
        }

        const finalValue = parts.join('.');
        const numValue = parseFloat(finalValue) || 0;

        // Limita o valor máximo para evitar números muito grandes
        if (numValue > 999999.99) {
            return;
        }

        setEditValues(prev => ({
            ...prev,
            [field]: numValue
        }));
    };

    const formatInputValue = (value: number) => {
        if (value === 0) return '';
        return value.toString().replace('.', ',');
    };

    const totalMonthlyPrediction = React.useMemo(() => {
        // Estimativa mensal: gastos semanais * 4 + final de semana * 4 + alimentação + combustível
        return (predictions.weeklyExpenses * 4) +
            (predictions.weekendExpenses * 4) +
            predictions.foodExpenses +
            predictions.fuelExpenses;
    }, [predictions]);

    const predictionItems = [
        {
            label: 'Gastos Semanais',
            value: predictions.weeklyExpenses,
            icon: Calendar,
            color: 'text-blue-700 dark:text-blue-300',
            bgColor: 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
            description: 'Gastos médios por semana'
        },
        {
            label: 'Final de Semana',
            value: predictions.weekendExpenses,
            icon: Coffee,
            color: 'text-purple-700 dark:text-purple-300',
            bgColor: 'bg-purple-100 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
            description: 'Gastos extras nos fins de semana'
        },
        {
            label: 'Alimentação',
            value: predictions.foodExpenses,
            icon: UtensilsCrossed,
            color: 'text-green-700 dark:text-green-300',
            bgColor: 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800',
            description: 'Gastos mensais com alimentação'
        },
        {
            label: 'Combustível',
            value: predictions.fuelExpenses,
            icon: Fuel,
            color: 'text-orange-700 dark:text-orange-300',
            bgColor: 'bg-orange-100 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
            description: 'Gastos mensais com combustível'
        }
    ];

    return (
        <Card className="w-full">
            <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="font-headline flex items-center gap-1.5 text-sm sm:text-base">
                        <TrendingUp className="h-3.5 w-3.5 text-primary" />
                        Previsões de Gastos
                    </CardTitle>
                    <div className="flex gap-1">
                        {isEditing ? (
                            <>
                                <Button size="sm" onClick={handleSave} className="h-7 gap-1 text-xs px-2">
                                    <Save className="h-3 w-3" />
                                    <span className="hidden xs:inline">Salvar</span>
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleCancel} className="h-7 gap-1 text-xs px-2">
                                    <X className="h-3 w-3" />
                                    <span className="hidden xs:inline">Cancelar</span>
                                </Button>
                            </>
                        ) : (
                            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} className="h-7 gap-1 text-xs px-2">
                                <Edit2 className="h-3 w-3" />
                                <span className="hidden xs:inline">Editar</span>
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-2 px-3 sm:px-4 pb-3">
                <div className="grid gap-1.5 sm:gap-2 grid-cols-2">
                    {predictionItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div key={index} className={`p-1.5 sm:p-2 rounded border ${item.bgColor}`}>
                                <div className="flex items-center justify-between gap-1">
                                    <div className="flex items-center gap-1">
                                        <Icon className={`h-3 w-3 ${item.color}`} />
                                        <Label className={`font-semibold text-xs ${item.color}`}>{item.label}</Label>
                                    </div>
                                    {isEditing ? (
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground font-medium">
                                                R$
                                            </span>
                                            <Input
                                                type="text"
                                                inputMode="decimal"
                                                value={(() => {
                                                    const field = item.label === 'Gastos Semanais' ? 'weeklyExpenses' :
                                                        item.label === 'Final de Semana' ? 'weekendExpenses' :
                                                            item.label === 'Alimentação' ? 'foodExpenses' : 'fuelExpenses';
                                                    return formatInputValue(editValues[field]);
                                                })()}
                                                onChange={(e) => {
                                                    const field = item.label === 'Gastos Semanais' ? 'weeklyExpenses' :
                                                        item.label === 'Final de Semana' ? 'weekendExpenses' :
                                                            item.label === 'Alimentação' ? 'foodExpenses' : 'fuelExpenses';
                                                    handleInputChange(field, e.target.value);
                                                }}
                                                onFocus={(e) => e.target.select()}
                                                onKeyDown={(e) => {
                                                    // Permite Enter para salvar
                                                    if (e.key === 'Enter') {
                                                        handleSave();
                                                    }
                                                    // Permite Escape para cancelar
                                                    if (e.key === 'Escape') {
                                                        handleCancel();
                                                    }
                                                }}
                                                className="w-24 sm:w-32 h-8 sm:h-9 text-right pl-6 sm:pl-8 pr-2 sm:pr-3 font-mono text-sm focus:ring-2 focus:ring-primary"
                                                placeholder="0,00"
                                            />
                                        </div>
                                    ) : (
                                        <Badge variant="secondary" className="font-mono font-semibold bg-background text-foreground border px-1 py-0 text-xs h-5">
                                            R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center justify-between pt-1 border-t">
                    <div className="flex items-center gap-1">
                        <Calculator className="h-3 w-3 text-primary" />
                        <span className="font-semibold text-xs">Total Mensal:</span>
                    </div>
                    <Badge variant="destructive" className="text-xs px-1.5 py-0 font-mono h-5">
                        R$ {totalMonthlyPrediction.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Badge>
                </div>

                {isEditing && (
                    <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs text-blue-700 dark:text-blue-300">
                        ⌨️ Use vírgula (,) • Enter salva • Esc cancela
                    </div>
                )}
            </CardContent>
        </Card>
    );
}