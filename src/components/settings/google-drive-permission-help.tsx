"use client";

import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, ExternalLink, CheckCircle } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface GoogleDrivePermissionHelpProps {
  error: string | null;
}

export function GoogleDrivePermissionHelp({ error }: GoogleDrivePermissionHelpProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  if (!error || !error.includes('PERMISSION_DENIED')) {
    return null;
  }

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Erro de Permissão no Google Drive</AlertTitle>
      <AlertDescription>
        <p className="mb-4">{error}</p>
        
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="mb-2">
              {isOpen ? 'Ocultar' : 'Ver'} Solução Passo a Passo
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">1. Habilitar a Google Drive API</p>
                  <p className="text-sm mt-1">
                    Acesse o Google Cloud Console e ative a API do Google Drive no projeto GestaoFinBK.
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 mt-1"
                    onClick={() => window.open('https://console.cloud.google.com/apis/library/drive.googleapis.com', '_blank')}
                  >
                    Abrir Google Cloud Console <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">2. Adicionar-se como Usuário de Teste</p>
                  <p className="text-sm mt-1">
                    Se o app estiver em "Modo de Teste", adicione seu email (chorstconsult@gmail.com) na lista de usuários de teste.
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 mt-1"
                    onClick={() => window.open('https://console.cloud.google.com/apis/credentials/consent', '_blank')}
                  >
                    Configurar Tela de Consentimento <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">3. Revogar Acesso Antigo</p>
                  <p className="text-sm mt-1">
                    Remova o acesso antigo do aplicativo para poder conceder novas permissões.
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 mt-1"
                    onClick={() => window.open('https://myaccount.google.com/permissions', '_blank')}
                  >
                    Gerenciar Permissões Google <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">4. Fazer Login Novamente</p>
                  <p className="text-sm mt-1">
                    Clique em "Sair" acima, depois em "Entrar com Google" e aceite TODAS as permissões solicitadas.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-muted p-3 rounded-md text-sm">
              <p className="font-semibold mb-1">💡 Dica:</p>
              <p>
                Após habilitar a API, aguarde 1-2 minutos antes de tentar fazer login novamente.
                As mudanças no Google Cloud podem levar alguns segundos para propagar.
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </AlertDescription>
    </Alert>
  );
}
