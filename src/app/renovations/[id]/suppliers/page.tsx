"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRenovations } from '@/hooks/useRenovations';
import { useSuppliers } from '@/hooks/useSuppliers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, PlusCircle, Trash2, Users, Phone, Mail, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function RenovationSuppliersPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const renovationId = params.id as string;
  
  const { getRenovationById } = useRenovations();
  const { suppliers, addSupplier, deleteSupplier } = useSuppliers();
  
  const renovation = getRenovationById(renovationId);
  const renovationSuppliers = suppliers; // Todos os fornecedores (não há filtro por renovationId no tipo)

  const [newSupplier, setNewSupplier] = React.useState({
    name: '',
    category: '',
    contact: '',
    phone: '',
    email: '',
    address: '',
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

  const handleAddSupplier = () => {
    if (!newSupplier.name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'O nome do fornecedor é obrigatório',
      });
      return;
    }

    addSupplier({
      name: newSupplier.name,
      contact: newSupplier.contact,
      specialty: newSupplier.category,
      notes: `${newSupplier.notes}\nTelefone: ${newSupplier.phone}\nEmail: ${newSupplier.email}\nEndereço: ${newSupplier.address}`,
    });

    setNewSupplier({
      name: '',
      category: '',
      contact: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
    });

    toast({
      title: 'Fornecedor adicionado',
      description: 'O fornecedor foi cadastrado com sucesso',
    });
  };

  const handleDeleteSupplier = (supplierId: string) => {
    deleteSupplier(supplierId);
    toast({
      title: 'Fornecedor removido',
      description: 'O fornecedor foi removido com sucesso',
    });
  };

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
          <h1 className="text-3xl font-bold font-headline">Fornecedores</h1>
          <p className="text-muted-foreground">{renovation.name}</p>
        </div>
      </div>

      {/* Resumo */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Total de Fornecedores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{renovationSuppliers.length}</div>
        </CardContent>
      </Card>

      {/* Adicionar Novo Fornecedor */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Fornecedor</CardTitle>
          <CardDescription>
            Cadastre um fornecedor para esta reforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Fornecedor *</Label>
              <Input
                id="name"
                placeholder="Ex: Materiais de Construção Silva"
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                placeholder="Ex: Materiais, Mão de Obra, Elétrica"
                value={newSupplier.category}
                onChange={(e) => setNewSupplier({ ...newSupplier, category: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact">Pessoa de Contato</Label>
              <Input
                id="contact"
                placeholder="Nome do contato"
                value={newSupplier.contact}
                onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="(00) 00000-0000"
                value={newSupplier.phone}
                onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="contato@fornecedor.com"
                value={newSupplier.email}
                onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                placeholder="Rua, número, bairro"
                value={newSupplier.address}
                onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Informações adicionais sobre o fornecedor..."
              value={newSupplier.notes}
              onChange={(e) => setNewSupplier({ ...newSupplier, notes: e.target.value })}
              rows={2}
            />
          </div>
          <Button onClick={handleAddSupplier} className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Fornecedor
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Fornecedores */}
      <Card>
        <CardHeader>
          <CardTitle>Fornecedores Cadastrados</CardTitle>
          <CardDescription>
            {renovationSuppliers.length === 0 ? 'Nenhum fornecedor cadastrado ainda' : `${renovationSuppliers.length} fornecedor(es) cadastrado(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renovationSuppliers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Adicione o primeiro fornecedor da sua reforma acima</p>
            </div>
          ) : (
            <div className="space-y-3">
              {renovationSuppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="flex items-start gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <Users className="h-5 w-5 text-muted-foreground mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{supplier.name}</h4>
                      {supplier.specialty && (
                        <Badge variant="outline">{supplier.specialty}</Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {supplier.contact && (
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          <span>{supplier.contact}</span>
                        </div>
                      )}
                    </div>
                    {supplier.notes && (
                      <p className="text-sm text-muted-foreground mt-2 italic">{supplier.notes}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSupplier(supplier.id)}
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
