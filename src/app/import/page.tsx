"use client";

import { DataImportForm } from '@/components/import/data-import-form';

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-headline font-semibold">Importar Dados</h1>
      <DataImportForm />
    </div>
  );
}
