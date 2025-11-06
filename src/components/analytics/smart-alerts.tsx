"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertTriangle,
    CheckCircle,
    TrendingUp,
    TrendingDown,
    Target,
    DollarSign,
    Calendar,
    X,
    Bell,
    Settings
} from 'lucide-react';

interface SmartAlert {
    id: string;
    type: 'warning' | 'success' | 'info' | 'error';
    category: 'budget' | 'savings' | 'prediction' | 'trend' | 'goal';
    title: string;
    message: string;
    action?: string;
    actionHref?: string;
    priority: 'high' | 'medium' | 'low';
    createdAt: Date;
    dismissed?: boolean;
}

interface SmartAlertsProps {
    className?: string;
    maxAlerts?: number;
}

export function SmartAlerts({ className, maxAlerts = 5 }: SmartAlertsProps) {
    const [alerts, setAlerts] = React.useState<SmartAlert[]>([]);
    const [showDismissed, setShowDismissed] = React.useState(false);

    // Simular geração de alertas baseados em dados
    React.useEffect(() => {
        const generateAlerts = (): SmartAlert[] => {
            const now = new Date();
            return [
                {
                    id: '1',
                    type: 'warning',
                    category: 'trend',
                    title: 'Aumento nos Gastos com Lazer',
                    message: 'Seus gastos com lazer aumentaram 25% este mês. Considere revisar este orçamento.',
                    action: 'Ver Análise',
                    actionHref: '/analytics?tab=trends&category=lazer',
                    priority: 'high',
                    createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 horas atrás
                },
                {
                    id: '2',
                    type: 'success',
                    category: 'savings',
                    title: 'Meta de Economia Atingida',
                    message: 'Parabéns! Você atingiu 105% da sua meta de economia mensal.',
                    action: 'Ver Detalhes',
                    actionHref: '/analytics?tab=reports',
                    priority: 'medium',
                    createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 horas atrás
                },
                {
                    id: '3',
                    type: 'info',
                    category: 'prediction',
                    title: 'Precisão das Previsões Melhorou',
                    message: 'Suas previsões estão 87% precisas, uma melhoria de 5% em relação ao mês passado.',
                    action: 'Ver Comparação',
                    actionHref: '/analytics?tab=comparison',
                    priority: 'low',
                    createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 horas atrás
                },
                {
                    id: '4',
                    type: 'warning',
                    category: 'budget',
                    title: 'Orçamento de Alimentação Próximo do Limite',
                    message: 'Você já gastou 85% do orçamento mensal com alimentação.',
                    action: 'Ajustar Orçamento',
                    actionHref: '/forecasts',
                    priority: 'medium',
                    createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000), // 8 horas atrás
                },
                {
                    id: '5',
                    type: 'success',
                    category: 'trend',
                    title: 'Redução nos Gastos com Transporte',
                    message: 'Excelente! Você reduziu os gastos com transporte em 15% este mês.',
                    priority: 'low',
                    createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 horas atrás
                },
            ];
        };

        setAlerts(generateAlerts());
    }, []);

    const dismissAlert = (alertId: string) => {
        setAlerts(prev => prev.map(alert =>
            alert.id === alertId ? { ...alert, dismissed: true } : alert
        ));
    };

    const getAlertIcon = (type: SmartAlert['type']) => {
        switch (type) {
            case 'warning':
                return <AlertTriangle className="h-4 w-4" />;
            case 'success':
                return <CheckCircle className="h-4 w-4" />;
            case 'error':
                return <AlertTriangle className="h-4 w-4" />;
            default:
                return <Bell className="h-4 w-4" />;
        }
    };

    const getAlertColor = (type: SmartAlert['type']) => {
        switch (type) {
            case 'warning':
                return 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20';
            case 'success':
                return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20';
            case 'error':
                return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20';
            default:
                return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20';
        }
    };

    const getCategoryIcon = (category: SmartAlert['category']) => {
        switch (category) {
            case 'budget':
                return <DollarSign className="h-3 w-3" />;
            case 'savings':
                return <Target className="h-3 w-3" />;
            case 'prediction':
                return <TrendingUp className="h-3 w-3" />;
            case 'trend':
                return <TrendingDown className="h-3 w-3" />;
            case 'goal':
                return <Target className="h-3 w-3" />;
            default:
                return <Bell className="h-3 w-3" />;
        }
    };

    const formatTimeAgo = (date: Date) => {
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Agora mesmo';
        if (diffInHours === 1) return '1 hora atrás';
        if (diffInHours < 24) return `${diffInHours} horas atrás`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return '1 dia atrás';
        return `${diffInDays} dias atrás`;
    };

    const visibleAlerts = alerts
        .filter(alert => showDismissed || !alert.dismissed)
        .slice(0, maxAlerts);

    const activeAlertsCount = alerts.filter(alert => !alert.dismissed).length;

    if (visibleAlerts.length === 0) {
        return (
            <Card className={className}>
                <CardContent className="p-6 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-lg mb-2">Tudo em Ordem!</h3>
                    <p className="text-muted-foreground text-sm">
                        Não há alertas no momento. Suas finanças estão sob controle.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="font-headline flex items-center gap-2 text-lg sm:text-xl">
                            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            Alertas Inteligentes
                            {activeAlertsCount > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                    {activeAlertsCount}
                                </Badge>
                            )}
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Notificações baseadas na análise dos seus dados financeiros
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDismissed(!showDismissed)}
                            className="text-xs"
                        >
                            {showDismissed ? 'Ocultar Dispensados' : 'Mostrar Todos'}
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1">
                            <Settings className="h-3 w-3" />
                            <span className="hidden xs:inline text-xs">Config</span>
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {visibleAlerts.map((alert) => (
                    <Alert
                        key={alert.id}
                        className={`${getAlertColor(alert.type)} ${alert.dismissed ? 'opacity-60' : ''}`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1">
                                <div className={`p-1 rounded-full ${alert.type === 'warning' ? 'text-orange-600 dark:text-orange-400' :
                                        alert.type === 'success' ? 'text-green-600 dark:text-green-400' :
                                            alert.type === 'error' ? 'text-red-600 dark:text-red-400' :
                                                'text-blue-600 dark:text-blue-400'
                                    }`}>
                                    {getAlertIcon(alert.type)}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-sm">{alert.title}</h4>
                                        <Badge variant="outline" className="gap-1 text-xs">
                                            {getCategoryIcon(alert.category)}
                                            {alert.category}
                                        </Badge>
                                        {alert.priority === 'high' && (
                                            <Badge variant="destructive" className="text-xs">
                                                Urgente
                                            </Badge>
                                        )}
                                    </div>
                                    <AlertDescription className="text-xs">
                                        {alert.message}
                                    </AlertDescription>
                                    <div className="flex items-center justify-between pt-1">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            {formatTimeAgo(alert.createdAt)}
                                        </div>
                                        {alert.action && alert.actionHref && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 px-2 text-xs"
                                                asChild
                                            >
                                                <a href={alert.actionHref}>
                                                    {alert.action}
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {!alert.dismissed && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => dismissAlert(alert.id)}
                                    className="h-6 w-6 p-0 hover:bg-background/80"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                    </Alert>
                ))}

                {alerts.length > maxAlerts && (
                    <div className="text-center pt-2">
                        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                            Ver todos os {alerts.length} alertas
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}