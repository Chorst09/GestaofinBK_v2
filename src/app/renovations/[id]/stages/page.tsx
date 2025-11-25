"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRenovations } from '@/hooks/useRenovations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  PlusCircle, 
  Trash2,
  GripVertical,
  CheckCircle2,
  Circle,
  Hammer,
  Pause,
  DollarSign,
  Users,
  Package,
  Search
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RenovationStage, StageStatus } from '@/lib/types';

export default function RenovationStagesPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const renovationId = params.id as string;
  
  const { getRenovationById, updateRenovation } = useRenovations();
  const renovation = getRenovationById(renovationId);

  const [stages, setStages] = React.useState<RenovationStage[]>([]);
  const [newStage, setNewStage] = React.useState({
    name: '',
    description: '',
    budget: 0,
    startDate: '',
    endDate: '',
  });

  React.useEffect(() => {
    if (renovation) {
      setStages(renovation.stages || []);
    }
  }, [renovation]);

  if (!renovation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-bold mb-4">Reforma não encontrada</h2>
        <Button onClick={() => router.push('/renovations')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Reformas
        </Button>
      </div>
    );
  }

  const handleAddStage = () => {
    if (!newStage.name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'O nome da etapa é obrigatório',
      });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    
    const stage: RenovationStage = {
      id: `stage-${Date.now()}`,
      renovationId: renovationId,
      name: newStage.name,
      description: newStage.description,
      budget: newStage.budget,
      startDate: newStage.startDate || today,
      endDate: newStage.endDate || today,
      status: 'not_started',
      order: stages.length,
    };

    const updatedStages = [...stages, stage];
    setStages(updatedStages);
    
    updateRenovation({
      ...renovation,
      stages: updatedStages,
    });

    setNewStage({ name: '', description: '', budget: 0, startDate: '', endDate: '' });
    
    toast({
      title: 'Etapa adicionada',
      description: 'A etapa foi adicionada com sucesso',
    });
  };

  const handleDeleteStage = (stageId: string) => {
    const updatedStages = stages.filter(s => s.id !== stageId);
    setStages(updatedStages);
    
    updateRenovation({
      ...renovation,
      stages: updatedStages,
    });

    toast({
      title: 'Etapa removida',
      description: 'A etapa foi removida com sucesso',
    });
  };

  const handleStatusChange = (stageId: string, newStatus: StageStatus) => {
    const updatedStages = stages.map(s => 
      s.id === stageId ? { ...s, status: newStatus } : s
    );
    setStages(updatedStages);
    
    updateRenovation({
      ...renovation,
      stages: updatedStages,
    });
  };

  const getStatusConfig = (status: StageStatus) => {
    const configs = {
      not_started: { label: 'Não Iniciada', icon: Circle, color: 'text-gray-500', bgColor: 'bg-gray-100', borderColor: 'border-gray-300' },
      in_progress: { label: 'Em Andamento', icon: Hammer, color: 'text-blue-600', bgColor: 'bg-blue-100', borderColor: 'border-blue-300' },
      on_hold: { label: 'Pausada', icon: Pause, color: 'text-yellow-600', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-300' },
      completed: { label: 'Concluída', icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-100', borderColor: 'border-green-300' },
    };
    return configs[status];
  };

  const totalEstimated = stages.reduce((sum, s) => sum + s.budget, 0);
  const completedStages = stages.filter(s => s.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/renovations/${renovationId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-headline">Gerenciar Etapas</h1>
            <p className="text-muted-foreground">{renovation.name}</p>
          </div>
        </div>
      </div>

      {/* Botões de Navegação */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push(`/renovations/${renovationId}/expenses`)}
        >
          <DollarSign className="h-4 w-4 mr-2" />
          Adicionar Despesa
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push(`/renovations/${renovationId}/suppliers`)}
        >
          <Users className="h-4 w-4 mr-2" />
          Fornecedores
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push(`/renovations/${renovationId}/materials`)}
        >
          <Package className="h-4 w-4 mr-2" />
          Materiais
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push(`/renovations/${renovationId}/price-search`)}
        >
          <Search className="h-4 w-4 mr-2" />
          Pesquisa de Preços
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Etapas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stages.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Etapas Concluídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedStages} / {stages.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Orçamento Estimado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalEstimated.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Adicionar Nova Etapa</CardTitle>
          <CardDescription>
            Defina as etapas do seu projeto de reforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Etapa *</Label>
              <Input
                id="name"
                placeholder="Ex: Demolição, Elétrica, Pintura..."
                value={newStage.name}
                onChange={(e) => setNewStage({ ...newStage, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Orçamento Estimado</Label>
              <Input
                id="budget"
                type="number"
                placeholder="0.00"
                value={newStage.budget || ''}
                onChange={(e) => setNewStage({ ...newStage, budget: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início</Label>
              <Input
                id="startDate"
                type="date"
                value={newStage.startDate}
                onChange={(e) => setNewStage({ ...newStage, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Data de Término</Label>
              <Input
                id="endDate"
                type="date"
                value={newStage.endDate}
                onChange={(e) => setNewStage({ ...newStage, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva os detalhes desta etapa..."
              value={newStage.description}
              onChange={(e) => setNewStage({ ...newStage, description: e.target.value })}
              rows={3}
            />
          </div>
          <Button onClick={handleAddStage} className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Etapa
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Etapas da Reforma</CardTitle>
          <CardDescription>
            {stages.length === 0 ? 'Nenhuma etapa adicionada ainda' : `${stages.length} etapa(s) cadastrada(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Adicione a primeira etapa da sua reforma acima</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stages.map((stage, index) => (
                <div
                  key={stage.id}
                  className="flex items-start gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mt-1">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-semibold ${stage.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                            {index + 1}. {stage.name}
                          </h4>
                        </div>
                        {stage.description && (
                          <p className="text-sm text-muted-foreground mb-2">{stage.description}</p>
                        )}
                        <div className="text-sm font-medium">
                          Orçamento: {stage.budget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteStage(stage.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Select
                        value={stage.status}
                        onValueChange={(value) => handleStatusChange(stage.id, value as StageStatus)}
                      >
                        <SelectTrigger className="w-[180px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_started">
                            <div className="flex items-center gap-2">
                              <Circle className="h-4 w-4 text-gray-500" />
                              <span>Não Iniciada</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="in_progress">
                            <div className="flex items-center gap-2">
                              <Hammer className="h-4 w-4 text-blue-600" />
                              <span>Em Andamento</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="on_hold">
                            <div className="flex items-center gap-2">
                              <Pause className="h-4 w-4 text-yellow-600" />
                              <span>Pausada</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="completed">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span>Concluída</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {(() => {
                        const config = getStatusConfig(stage.status);
                        const StatusIcon = config.icon;
                        return (
                          <Badge variant="outline" className={`${config.color} ${config.borderColor}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
