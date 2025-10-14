"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export function GoogleOAuthDiagnostic() {
  const [diagnostics, setDiagnostics] = React.useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = React.useState(false);
  const [currentOrigin, setCurrentOrigin] = React.useState<string>('');
  const { toast } = useToast();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentOrigin(window.location.origin);
    }
  }, []);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    // 1. Verificar variáveis de ambiente
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!apiKey || apiKey.includes('cole_sua') || apiKey.includes('COLE_SUA')) {
      results.push({
        name: 'Google API Key',
        status: 'error',
        message: 'API Key não configurada ou usando valor de exemplo',
        details: 'Configure NEXT_PUBLIC_GOOGLE_API_KEY no arquivo .env.local'
      });
    } else {
      results.push({
        name: 'Google API Key',
        status: 'success',
        message: 'API Key configurada',
        details: `Chave: ${apiKey.substring(0, 10)}...`
      });
    }

    if (!clientId || clientId.includes('cole_seu') || clientId.includes('COLE_SEU')) {
      results.push({
        name: 'Google Client ID',
        status: 'error',
        message: 'Client ID não configurado ou usando valor de exemplo',
        details: 'Configure NEXT_PUBLIC_GOOGLE_CLIENT_ID no arquivo .env.local'
      });
    } else {
      results.push({
        name: 'Google Client ID',
        status: 'success',
        message: 'Client ID configurado',
        details: `ID: ${clientId.substring(0, 20)}...`
      });
    }

    // 2. Verificar se as bibliotecas do Google estão carregadas
    try {
      if (typeof window !== 'undefined') {
        const google = (window as any).google;
        if (google && google.accounts) {
          results.push({
            name: 'Google Libraries',
            status: 'success',
            message: 'Bibliotecas do Google carregadas com sucesso'
          });
        } else {
          results.push({
            name: 'Google Libraries',
            status: 'warning',
            message: 'Bibliotecas do Google não detectadas',
            details: 'Aguarde o carregamento ou recarregue a página'
          });
        }
      }
    } catch (error) {
      results.push({
        name: 'Google Libraries',
        status: 'error',
        message: 'Erro ao verificar bibliotecas do Google',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }

    // 3. Verificar conectividade com APIs do Google
    if (apiKey && !apiKey.includes('cole_sua')) {
      try {
        const response = await fetch(`https://www.googleapis.com/discovery/v1/apis/drive/v3/rest?key=${apiKey}`);
        if (response.ok) {
          results.push({
            name: 'Google API Connectivity',
            status: 'success',
            message: 'Conectividade com Google APIs funcionando'
          });
        } else {
          results.push({
            name: 'Google API Connectivity',
            status: 'error',
            message: 'Erro na conectividade com Google APIs',
            details: `Status: ${response.status} - Verifique se a API Key está correta`
          });
        }
      } catch (error) {
        results.push({
          name: 'Google API Connectivity',
          status: 'warning',
          message: 'Não foi possível testar conectividade',
          details: 'Verifique sua conexão com a internet'
        });
      }
    }

    // 4. Verificar configuração de origem
    results.push({
      name: 'URL de Origem',
      status: 'success',
      message: `Origem detectada: ${currentOrigin}`,
      details: 'Esta URL deve estar configurada no Google Cloud Console'
    });

    setDiagnostics(results);
    setIsRunning(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "URL copiada para a área de transferência",
    });
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">OK</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Aviso</Badge>;
    }
  };

  React.useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Diagnóstico do Google OAuth
        </CardTitle>
        <CardDescription>
          Verificação automática da configuração do Google OAuth
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Verificando...' : 'Executar Diagnóstico'}
          </Button>
        </div>

        {diagnostics.length > 0 && (
          <div className="space-y-3">
            {diagnostics.map((result, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                {getStatusIcon(result.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{result.name}</span>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{result.message}</p>
                  {result.details && (
                    <p className="text-xs text-muted-foreground mt-1 font-mono bg-muted p-1 rounded">
                      {result.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {currentOrigin && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <p className="font-medium">Para resolver o erro "redirect_uri_mismatch":</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-2 py-1 rounded text-sm flex-1">
                    {currentOrigin}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(currentOrigin)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm">
                  1. Copie a URL acima<br />
                  2. Acesse o <a 
                    href="https://console.cloud.google.com/apis/credentials" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    Google Cloud Console <ExternalLink className="h-3 w-3" />
                  </a><br />
                  3. Edite suas credenciais OAuth 2.0<br />
                  4. Cole a URL em <strong>"Origens JavaScript autorizadas"</strong><br />
                  5. Cole a URL em <strong>"URIs de redirecionamento autorizados"</strong>
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}