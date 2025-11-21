"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRenovations } from '@/hooks/useRenovations';
import { useMaterials } from '@/hooks/useMaterials';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, PlusCircle, Trash2, Package, CheckCircle2, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function RenovationMaterialsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const renovationId = params.id as string;
  
  const { getRenovationById } = useRenovations();
  const { materials, addMaterial, updateMaterial, deleteMaterial } = useMaterials();
  
  const renovation = getRenovationById(renovationId);
  const renovationMaterials = materials.filter(m => m.renovationId === renovationId);

  const [newMaterial, setNewMaterial] = React.useState({
    name: '',
    quantity: 0,
    unit: '',
    estimatedCost: 0,
    notes: '',
  });

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

  const handleAddMaterial = () => {
    if (!newMaterial.name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'O nome do material é obrigatório',
      });
      return;
    }

    addMaterial({
      renovationId,
      name: newMaterial.name,
      quantity: newMaterial.quantity,
      unit: newMaterial.unit,
      unitPrice: newMaterial.estimatedCost / (newMaterial.quantity || 1),
      isPurchased: false,
      isAllocated: false,
    });

    setNewMaterial({
      name: '',
      quantity: 0,
      unit: '',
      estimatedCost: 0,
      notes: '',
    });

    toast({
      title: 'Material adicionado',
      description: 'O material foi adicionado à lista',
    });
  };

  const handleTogglePurchased = (materialId: string, currentStatus: boolean) => {
    const material = materials.find(m => m.id === materialId);
    if (material) {
      updateMaterial({
        ...material,
        isPurchased: !currentStatus,
        purchaseDate: !currentStatus ? new Date().toISOString().split('T')[0] : undefined,
      });
    }
  };

  const handleDeleteMaterial = (materialId: string) => {
    deleteMaterial(materialId);
    toast({
      title: 'Material removido',
      description: 'O material foi removido da lista',
    });
  };

  const purchasedMaterials = renovationMaterials.filter(m => m.isPurchased).length;
  const totalEstimatedCost = renovationMaterials.reduce((sum, m) => sum + m.totalPrice, 0);

  return (
    <div className="space-y-6">
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
          <h1 className="text-3xl font-bold font-headline">Materiais</h1>
          <p className="text-muted-foreground">{renovation.name}</p>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Materiais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{renovationMaterials.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Materiais Comprados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchasedMaterials} / {renovationMaterials.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Custo Estimado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalEstimatedCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Adicionar Novo Material */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Material</CardTitle>
          <CardDescription>
            Adicione um material à lista de compras da reforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Material *</Label>
              <Input
                id="name"
                placeholder="Ex: Cimento, Areia, Tinta"
                value={newMaterial.name}
                onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="0"
                value={newMaterial.quantity || ''}
                onChange={(e) => setNewMaterial({ ...newMaterial, quantity: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="unit">Unidade</Label>
              <Input
                id="unit"
                placeholder="Ex: kg, m², litros, unidades"
                value={newMaterial.unit}
                onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedCost">Custo Estimado</Label>
              <Input
                id="estimatedCost"
                type="number"
                placeholder="0.00"
                value={newMaterial.estimatedCost || ''}
                onChange={(e) => setNewMaterial({ ...newMaterial, estimatedCost: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Especificações, marca preferida, etc..."
              value={newMaterial.notes}
              onChange={(e) => setNewMaterial({ ...newMaterial, notes: e.target.value })}
              rows={2}
            />
          </div>
          <Button onClick={handleAddMaterial} className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Material
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Materiais */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Materiais</CardTitle>
          <CardDescription>
            {renovationMaterials.length === 0 ? 'Nenhum material na lista ainda' : `${renovationMaterials.length} material(is) na lista`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renovationMaterials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Adicione o primeiro material da sua reforma acima</p>
            </div>
          ) : (
            <div className="space-y-3">
              {renovationMaterials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-start gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 mt-1"
                    onClick={() => handleTogglePurchased(material.id, material.isPurchased)}
                  >
                    {material.isPurchased ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                  <Package className="h-5 w-5 text-muted-foreground mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-semibold ${material.isPurchased ? 'line-through text-muted-foreground' : ''}`}>
                        {material.name}
                      </h4>
                      {material.isPurchased && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Comprado
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {material.quantity > 0 && (
                        <div>
                          Quantidade: {material.quantity} {material.unit}
                        </div>
                      )}
                      {material.totalPrice > 0 && (
                        <div className="font-medium">
                          Custo estimado: {material.totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMaterial(material.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
