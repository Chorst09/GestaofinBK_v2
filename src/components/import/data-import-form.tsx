
"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { TransactionFormData } from '@/lib/types';
import { useTransactions } from '@/hooks/useTransactions';
import { AlertCircle, UploadCloud } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAllCategories } from '@/hooks/useAllCategories';

// Basic CSV parser
function parseCSV(csvText: string, getCategoryByName: (name?: string) => any): TransactionFormData[] {
  const rows = csvText.trim().split('\n');
  if (rows.length < 2) {
    throw new Error("Arquivo CSV vazio ou faltando cabeçalho.");
  }

  const headerLine = rows[0].toLowerCase();
  const header = headerLine.split(',').map(h => h.trim().toLowerCase());

  const expectedHeaders = ['date', 'description', 'amount', 'type', 'category'];
  const missingHeaders = expectedHeaders.filter(eh => !header.includes(eh));
  if (missingHeaders.length > 0) {
    throw new Error(`Cabeçalhos CSV obrigatórios ausentes: ${missingHeaders.join(', ')}. Encontrados: ${header.join(', ')}`);
  }

  const dateIndex = header.indexOf('date');
  const descriptionIndex = header.indexOf('description');
  const amountIndex = header.indexOf('amount');
  const typeIndex = header.indexOf('type');
  const categoryIndex = header.indexOf('category');
  const cardBrandIndex = header.indexOf('cardbrand'); // Optional

  const dataRows = rows.slice(1);
  const transactions: TransactionFormData[] = [];

  dataRows.forEach((rowStr, index) => {
    const values = rowStr.split(',').map(v => v.trim());
    if (values.length < Math.max(dateIndex, descriptionIndex, amountIndex, typeIndex, categoryIndex) + 1) {
        console.warn(`Linha ${index + 2} ignorada: número de colunas insuficiente para os cabeçalhos mapeados.`);
        return;
    }

    const rawDate = values[dateIndex];
    const rawDescription = values[descriptionIndex];
    const rawAmount = values[amountIndex];
    const rawType = values[typeIndex]?.toLowerCase();
    const rawCategory = values[categoryIndex];
    const rawCardBrand = cardBrandIndex !== -1 && cardBrandIndex < values.length ? values[cardBrandIndex] : undefined;


    if (!rawDate || !rawDescription || !rawAmount || !rawType || !rawCategory) {
        console.warn(`Linha ${index + 2} ignorada: contém valores obrigatórios vazios.`);
        return;
    }

    const amount = parseFloat(rawAmount);
    const type = rawType as 'income' | 'expense';
    const categoryConfig = getCategoryByName(rawCategory);

    if (isNaN(amount)) {
      throw new Error(`Valor inválido na linha ${index + 2} do CSV: "${rawAmount}"`);
    }
    if (type !== 'income' && type !== 'expense') {
      throw new Error(`Tipo inválido na linha ${index + 2} do CSV: "${rawType}". Use 'income' ou 'expense'.`);
    }
    if (isNaN(new Date(rawDate).getTime())) {
      throw new Error(`Data inválida na linha ${index + 2} do CSV: "${rawDate}". Use formato AAAA-MM-DD.`);
    }
    if (!rawCategory) {
      throw new Error(`Categoria ausente na linha ${index + 2} do CSV.`);
    }

    const transaction: TransactionFormData = {
      date: new Date(rawDate).toISOString(),
      description: rawDescription,
      amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
      type: type,
      category: rawCategory,
    };

    if (rawCardBrand) {
      if (categoryConfig?.isCreditCard && type === 'expense') {
        transaction.cardBrand = rawCardBrand;
      } else {
        console.warn(`Bandeira de cartão "${rawCardBrand}" ignorada na linha ${index + 2} do CSV: Categoria "${rawCategory}" não é uma despesa de cartão de crédito ou o tipo é "${type}".`);
      }
    }
    transactions.push(transaction);
  });
  return transactions;
}

export function DataImportForm() {
  const [file, setFile] = React.useState<File | null>(null);
  const [isImporting, setIsImporting] = React.useState(false);
  const { toast } = useToast();
  const { addMultipleTransactions } = useTransactions();
  const { getCategoryByName } = useAllCategories();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'Nenhum arquivo selecionado',
        description: 'Por favor, selecione um arquivo CSV para importar.',
      });
      // setIsImporting(false); // Already false or will be set in finally
      return;
    }

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      const fileText = e.target?.result as string;
      let transactionsToImport: TransactionFormData[] = [];
      
      if (!file) { 
          toast({ variant: 'destructive', title: 'Erro interno', description: 'Referência ao arquivo foi perdida.' });
          setIsImporting(false);
          return;
      }
      const fileName = file.name.toLowerCase();

      try {
        if (fileName.endsWith('.csv')) {
          transactionsToImport = parseCSV(fileText, getCategoryByName);
          if (transactionsToImport.length === 0) {
            toast({ variant: 'warning', title: 'Arquivo CSV Vazio ou Sem Dados Válidos', description: 'Nenhuma transação válida encontrada no arquivo CSV.' });
            // No need to set isImporting to false here, finally block will do it.
            return; 
          }
        } else {
          // This case should ideally not be reached if input accept attribute is respected
          throw new Error("Formato de arquivo não suportado. Use .csv");
        }

        if (transactionsToImport.length > 0) {
          addMultipleTransactions(transactionsToImport);
          toast({
            title: 'Importação Concluída!',
            description: `${transactionsToImport.length} transações foram importadas com sucesso.`,
          });
        }
        
        setFile(null); 
        const fileInput = document.getElementById('file-import-input') as HTMLInputElement;
        if(fileInput) {
          fileInput.value = ""; 
        }

      } catch (error: any) {
        console.error("File Import Error:", error);
        toast({
          variant: 'destructive',
          title: 'Erro na Importação',
          description: error.message || 'Ocorreu um erro ao processar o arquivo.',
          duration: 7000,
        });
      } finally {
        setIsImporting(false);
      }
    };

    reader.onerror = () => {
        toast({ variant: 'destructive', title: 'Erro ao ler arquivo', description: 'Não foi possível ler o arquivo selecionado.' });
        setIsImporting(false);
    };

    reader.readAsText(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Importar Transações de CSV</CardTitle>
        <CardDescription>
          Faça upload de um arquivo CSV para adicionar múltiplas transações.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="file-import-input">Arquivo CSV</Label>
          <Input id="file-import-input" type="file" accept=".csv" onChange={handleFileChange} />
           {file && <p className="text-sm text-muted-foreground">Arquivo selecionado: {file.name}</p>}
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Formato do Arquivo CSV</AlertTitle>
          <AlertDescription>
            <strong className="block mb-1">Para arquivos CSV:</strong>
            <ul className="list-disc pl-5 text-sm mb-3">
              <li>A primeira linha deve ser o cabeçalho.</li>
              <li>Colunas obrigatórias (nomes exatos no cabeçalho, insensível a maiúsculas): Date, Description, Amount, Type, Category.</li>
              <li>Coluna opcional: CardBrand (usada para despesas na categoria 'Cartão de Crédito').</li>
              <li><strong>Date:</strong> Data da transação (ex: AAAA-MM-DD).</li>
              <li><strong>Amount:</strong> Valor numérico (use ponto como separador decimal, ex: 50.99).</li>
              <li><strong>Type:</strong> 'income' ou 'expense'.</li>
              <li><strong>Category:</strong> Nome da categoria (ex: Alimentação).</li>
            </ul>
          </AlertDescription>
        </Alert>

        <Button onClick={handleImport} disabled={!file || isImporting} className="w-full">
          {isImporting ? (
            <>
              <UploadCloud className="mr-2 h-4 w-4 animate-pulse" />
              Importando...
            </>
          ) : (
            <>
              <UploadCloud className="mr-2 h-4 w-4" />
              Importar Arquivo
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
