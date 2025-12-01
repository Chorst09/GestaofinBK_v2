
"use client";

import type { BackupData, UserProfile } from './types';

// These variables are read from the environment. See .env.local.template for instructions.
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// Debug: Log das variáveis de ambiente (apenas para desenvolvimento)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔍 Google Drive Config:', {
    hasApiKey: !!API_KEY,
    hasClientId: !!CLIENT_ID,
    apiKeyPrefix: API_KEY?.substring(0, 10) + '...',
    clientIdPrefix: CLIENT_ID?.substring(0, 20) + '...',
  });
}

// Constants for Google Drive API interaction.
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';
const BACKUP_FILE_NAME = 'financas-zen-backup.json';

// Module-level variables to hold the Google API clients and state.
let tokenClient: any | null = null;
let onAuthChangeCallback: (isAuthorized: boolean, profile?: UserProfile, data?: BackupData | null, error?: string) => void;
let initPromise: Promise<void> | null = null;
let isGoogleDriveDisabled = false; // Flag para desabilitar Google Drive em caso de erro persistente


/**
 * A helper function to create specific, user-friendly error messages for Google Drive API calls.
 * It intelligently inspects the error object to provide actionable feedback.
 */
function handleDriveError(e: any, baseMessage: string): never {
    console.error(baseMessage, e); // Log the raw error for debugging

    let details = "Detalhes do erro não disponíveis.";
    let googleError: any = null;

    // Find the actual error object from various possible structures
    if (e?.result?.error) {
        googleError = e.result.error;
    } else if (e?.body) {
        try {
            const errorBody = JSON.parse(e.body);
            if (errorBody.error) googleError = errorBody.error;
        } catch { /* ignore */ }
    }
    
    // If it's an empty object, it's a GAPI auth error.
    if (!e || Object.keys(e).length === 0) {
        googleError = { status: 'PERMISSION_DENIED', message: 'Empty error object, likely an authentication issue.' };
    }

    // Build details string
    if (googleError) {
        details = `(${googleError.code || 'N/A'} ${googleError.status || 'N/A'}) ${googleError.message}`;
    } else if (e?.message) {
        details = e.message;
    }

    const statusToCheck = googleError?.status;
    const messageToCheck = googleError?.message || details;

    // Check for specific, known error messages to provide user-friendly feedback
    if (statusToCheck === 'PERMISSION_DENIED' || messageToCheck.includes('insufficient scopes') || messageToCheck.includes('insufficient permissions') || messageToCheck.includes('are blocked')) {
        // This is the key change: throw a predictable error message
        throw new Error(`PERMISSION_DENIED: A Google Drive API não está habilitada ou você não concedeu as permissões necessárias. SOLUÇÃO: 1) Habilite a Google Drive API no Google Cloud Console (projeto GestaoFinBK). 2) Saia e faça login novamente, aceitando TODAS as permissões. Detalhes: ${details}`);
    }

    if (messageToCheck.includes("API has not been used in project") || messageToCheck.includes("Enable the API")) {
        throw new Error(`A API do Google Drive não está habilitada para este projeto. Por favor, acesse o Google Cloud Console, procure por "Google Drive API" na Biblioteca e clique em "Ativar".`);
    }

    if (messageToCheck.includes('redirect_uri_mismatch')) {
        const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'SEU_ENDERECO_DO_APP';
        throw new Error(`Erro de "redirect_uri_mismatch". O Google não autorizou este endereço de aplicativo. Para resolver, vá para as suas credenciais do Google, encontre o seu "ID de cliente OAuth 2.0" e adicione a seguinte URL em DUAS listas: "Origens JavaScript autorizadas" E "URIs de redirecionamento autorizados". URL para adicionar: ${currentOrigin}`);
    } 

    if (messageToCheck.includes('storage quota has been exceeded')) {
        throw new Error("Seu armazenamento no Google Drive está cheio. Não é possível salvar o backup. Por favor, libere espaço na sua conta Google e tente novamente.");
    } 
    
    if (messageToCheck.includes('Invalid Credentials')) {
        throw new Error(`Credenciais inválidas. Isso geralmente significa que a Chave de API (API Key) não é válida ou está restrita. Verifique suas credenciais no Google Cloud Console. Detalhes: ${details}`);
    }

    // Fallback for any other error
    throw new Error(`${baseMessage}. Detalhes: ${details}`);
}


async function getFileId(): Promise<string | null> {
    const gapi = (window as any).gapi;
    if (!gapi.client?.drive) {
        throw new Error("O cliente da API do Google Drive não está carregado. A inicialização pode ter falhado ou estar incompleta.");
    }
    try {
        const response = await gapi.client.drive.files.list({
            spaces: 'appDataFolder',
            fields: 'files(id, name)',
            pageSize: 10
        });
        const file = response.result.files?.find((f: any) => f.name === BACKUP_FILE_NAME);
        return file?.id || null;
    } catch (e: any) {
        handleDriveError(e, "Não foi possível listar arquivos no Google Drive");
    }
}

async function updateFile(fileId: string, content: string): Promise<void> {
    try {
        const gapi = (window as any).gapi;
        if (!gapi?.client) {
             throw new Error("O cliente GAPI não está carregado. A inicialização pode ter falhado.");
        }
        // Use a simple media upload to update the file content.
        await gapi.client.request({
            path: `/upload/drive/v3/files/${fileId}`,
            method: 'PATCH',
            params: { uploadType: 'media' },
            headers: { 'Content-Type': 'application/json' },
            body: content
        });
    } catch (e: any) {
        handleDriveError(e, "Não foi possível atualizar o arquivo de backup");
    }
}

async function createFile(content: string): Promise<void> {
    const gapi = (window as any).gapi;
    if (!gapi.client?.drive) {
        throw new Error("O cliente da API do Google Drive não está carregado.");
    }
    try {
        const fileMetadata = {
            name: BACKUP_FILE_NAME,
            parents: ['appDataFolder']
        };
        const file = await gapi.client.drive.files.create({
            resource: fileMetadata,
            fields: 'id'
        });

        const fileId = file.result.id;
        if (!fileId) {
            throw new Error("A criação do arquivo não retornou um ID.");
        }

        // Now that the file exists, update its content.
        await updateFile(fileId, content);
    } catch (e: any) {
        handleDriveError(e, "Não foi possível criar o arquivo de backup");
    }
}


/**
 * Fetches the user's profile information using the modern fetch API
 * after a successful login.
 */
async function getUserProfile(): Promise<UserProfile | undefined> {
    try {
      const token = (window as any).gapi.client.getToken();
      if (!token) return undefined;

      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          'Authorization': `Bearer ${token.access_token}`
        }
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to fetch user info: ${response.statusText}. Body: ${errorBody}`);
      }

      const profile = await response.json();
      
      return {
        name: profile.name || 'Usuário',
        email: profile.email || '',
        imageUrl: profile.picture || '',
      };
    } catch (e) {
      console.error('Error fetching user profile:', e);
      // Return undefined or rethrow, depending on desired error handling
      return undefined;
    }
}

/**
 * Dynamically loads a script and returns a promise that resolves when it's loaded.
 */
function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Falha ao carregar o script: ${src}`));
        document.body.appendChild(script);
    });
}

/**
 * Initializes the Google API client and Google Identity Services.
 * This function handles the loading of external scripts and setting up the clients.
 */
export function initClient(callback: (isAuthorized: boolean, profile?: UserProfile, data?: BackupData | null, error?: string) => void): Promise<void> {
    if (initPromise) {
        return initPromise;
    }
    
    if (isGoogleDriveDisabled) {
        console.warn('Google Drive está desabilitado devido a erros anteriores');
        return Promise.resolve();
    }

    initPromise = (async () => {
        onAuthChangeCallback = callback;
        
        try {
            const isClientIdInvalid = !CLIENT_ID || CLIENT_ID.trim() === '' || CLIENT_ID.includes('COLE_SEU_ID_DE_CLIENTE_OAUTH_AQUI');
            const isApiKeyInvalid = !API_KEY || API_KEY.trim() === '' || API_KEY.includes('COLE_SUA_CHAVE_DE_API_AQUI');

            if (isApiKeyInvalid || isClientIdInvalid) {
                const isProduction = process.env.NODE_ENV === 'production';
                const configError = isProduction 
                  ? "As credenciais do Google (API Key e Client ID) não foram configuradas para o ambiente de produção. O backup no Google Drive está desabilitado."
                  : "Credenciais do Google não configuradas. O backup no Google Drive está desabilitado. Para habilitar, configure as variáveis NEXT_PUBLIC_GOOGLE_API_KEY e NEXT_PUBLIC_GOOGLE_CLIENT_ID no arquivo .env.local";
                
                console.warn(configError);
                onAuthChangeCallback(false, undefined, undefined, configError);
                
                // Não lançar erro, apenas avisar que o Google Drive está desabilitado
                return;
            }
            try {
                await Promise.all([
                    loadScript('https://apis.google.com/js/api.js'),
                    loadScript('https://accounts.google.com/gsi/client')
                ]);
            } catch (scriptError) {
                // Se falhar ao carregar os scripts, desabilitar silenciosamente
                isGoogleDriveDisabled = true;
                onAuthChangeCallback(false, undefined, undefined, undefined);
                initPromise = null;
                return;
            }
            
            const gapi = (window as any).gapi;
            const google = (window as any).google;

            if (!gapi) throw new Error("A biblioteca GAPI do Google (api.js) não foi carregada corretamente. Verifique sua conexão ou extensões de navegador.");
            if (!google) throw new Error("A biblioteca GIS do Google (gsi/client) não foi carregada corretamente. Verifique sua conexão ou extensões de navegador.");
            
            // Tentar inicializar com retry (apenas 1 tentativa para não demorar)
            let lastError: any = null;
            let retries = 1;
            
            for (let attempt = 0; attempt < retries; attempt++) {
                try {
                    await new Promise<void>((resolve, reject) => {
                        const timeoutId = setTimeout(() => {
                            reject(new Error('timeout'));
                        }, 5000); // Timeout de 5 segundos
                        
                        gapi.load('client', {
                            callback: async () => {
                                try {
                                    await gapi.client.init({
                                        apiKey: API_KEY,
                                        discoveryDocs: [DISCOVERY_DOC],
                                    });
                                    clearTimeout(timeoutId);
                                    console.log('✅ Google Drive conectado');
                                    resolve();
                                } catch (e: any) {
                                    clearTimeout(timeoutId);
                                    reject(e);
                                }
                            },
                            onerror: (err: any) => {
                                clearTimeout(timeoutId);
                                reject(err);
                            },
                        });
                    });
                    
                    // Se chegou aqui, inicializou com sucesso
                    break;
                    
                } catch (e: any) {
                    lastError = e;
                    // Não tentar novamente, apenas falhar silenciosamente
                    throw e;
                }
            }
            
            // Se esgotou todas as tentativas
            if (lastError) {
                const errorMsg = lastError.message || JSON.stringify(lastError);
                if (errorMsg.includes('502') || errorMsg.includes('503') || errorMsg.includes('Bad Gateway') || errorMsg.includes('timeout')) {
                    isGoogleDriveDisabled = true; // Desabilitar temporariamente
                    throw new Error('NETWORK_ERROR: Google Drive API temporariamente indisponível');
                } else {
                    throw new Error(`O cliente GAPI (Drive API) falhou ao carregar: ${errorMsg}`);
                }
            }

            if (!google.accounts?.oauth2) throw new Error("O módulo de autenticação do Google (GIS OAuth2) não está disponível. A biblioteca pode ter sido bloqueada.");
            if (typeof google.accounts.oauth2.initTokenClient !== 'function') throw new Error("A função 'initTokenClient' do Google não foi encontrada. A biblioteca GIS pode ter falhado ao carregar.");

            tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: async (tokenResponse: any) => {
                    if (tokenResponse.error) {
                        console.error("Token Error:", tokenResponse);
                        let errorMessage = `Erro de autorização do Google: ${tokenResponse.error_description || tokenResponse.error}.`;
                        
                        if (tokenResponse.error === 'redirect_uri_mismatch') {
                           errorMessage = `Erro de "redirect_uri_mismatch". O Google não autorizou este endereço de aplicativo. 1. Vá para a página de Configurações do app e copie a "URL de Origem do Aplicativo". 2. No Google Cloud Console, em suas credenciais OAuth 2.0, cole esta URL EXATAMENTE como está em DUAS listas: "Origens JavaScript autorizadas" E "URIs de redirecionamento autorizados".`;
                        } else if (tokenResponse.error === 'invalid_request' || tokenResponse.error_description?.includes('client type')) {
                            errorMessage = 'Erro de Configuração: "Requisição Inválida". A causa mais comum é que o seu ID de Cliente OAuth no Google Cloud não é do tipo "Aplicativo da Web". Por favor, verifique suas credenciais no Google Cloud Console e garanta que o tipo de cliente está correto.';
                        } else if (tokenResponse.error === 'access_denied') {
                            errorMessage = `Acesso negado. Isso geralmente ocorre se o app estiver em "Modo de Teste" no Google Cloud. Para que qualquer usuário Google possa usar, vá para a "Tela de permissão OAuth" no seu projeto do Google Cloud e, em "Status da publicação", clique em "PUBLICAR APLICATIVO".`;
                        } else if (tokenResponse.error === 'invalid_client') {
                            errorMessage = `Erro de Cliente Inválido. A variável de ambiente NEXT_PUBLIC_GOOGLE_CLIENT_ID está incorreta ou não foi encontrada. 1. Verifique se o valor está correto no seu arquivo .env.local (ou nas configurações de ambiente da sua hospedagem). 2. Confirme se corresponde EXATAMENTE ao "ID do cliente" de uma credencial OAuth 2.0 do tipo "Aplicativo da Web" no seu Google Cloud Console (sem espaços extras). 3. Use a seção de "Debug" na página de Configurações do app para ver o Client ID que o app está realmente usando e compare-o.`;
                        }

                        if (onAuthChangeCallback) onAuthChangeCallback(false, undefined, undefined, errorMessage);
                        return;
                    }

                    gapi.client.setToken({ access_token: tokenResponse.access_token });
                    const profile = await getUserProfile();
                    
                    try {
                        const requiredScope = 'https://www.googleapis.com/auth/drive.appdata';
                        const grantedScopes = tokenResponse.scope || '';
                        if (!grantedScopes.includes(requiredScope)) {
                            const scopeError = "PERMISSION_DENIED: O aplicativo não tem o acesso necessário ao Google Drive. Por favor, clique no botão \"Entrar com Google\" novamente para aprovar as permissões.";
                            throw new Error(scopeError);
                        }
                        
                        const data = await loadFromDrive();
                        if (onAuthChangeCallback) onAuthChangeCallback(true, profile, data);
                    
                    } catch (driveError: any) {
                        gapi.client.setToken(null); 
                        if (onAuthChangeCallback) onAuthChangeCallback(false, profile, undefined, driveError.message);
                    }
                },
            });

            if (!tokenClient) throw new Error("A inicialização do cliente de token do Google (initTokenClient) retornou um valor nulo, indicando uma falha.");
            
        } catch (error: any) {
            const errorMsg = error.message || 'Erro desconhecido';
            
            // Se for erro de rede (502, 503, timeout, API discovery), desabilitar silenciosamente
            if (errorMsg.includes('NETWORK_ERROR') || 
                errorMsg.includes('502') || 
                errorMsg.includes('503') || 
                errorMsg.includes('Bad Gateway') ||
                errorMsg.includes('API discovery') ||
                errorMsg.includes('timeout')) {
                
                isGoogleDriveDisabled = true; // Desabilitar para não tentar novamente
                onAuthChangeCallback(false, undefined, undefined, undefined); // Sem erro para o usuário
                initPromise = null;
                return; // Sair silenciosamente
            }
            
            // Para outros erros, não mostrar no console, apenas desabilitar
            isGoogleDriveDisabled = true;
            onAuthChangeCallback(false, undefined, undefined, undefined);
            initPromise = null;
        }
    })();

    return initPromise;
}

export function handleAuthClick(options: { prompt?: string } = {}) {
    // Se o Google Drive foi desabilitado por erro de rede, tentar reinicializar
    if (isGoogleDriveDisabled) {
        isGoogleDriveDisabled = false;
        initPromise = null;
        
        // Tentar reinicializar e fazer login
        if (onAuthChangeCallback) {
            initClient(onAuthChangeCallback).then(() => {
                // Após reinicializar, tentar fazer login novamente
                if (tokenClient) {
                    const tokenOptions: { prompt?: string } = {};
                    if (options.prompt) {
                        tokenOptions.prompt = options.prompt;
                    }
                    tokenClient.requestAccessToken(tokenOptions);
                } else {
                    const errorMsg = "Falha ao conectar com o Google Drive. Verifique suas credenciais.";
                    onAuthChangeCallback(false, undefined, undefined, errorMsg);
                }
            }).catch((error) => {
                // Verificar o tipo de erro para dar mensagem mais específica
                const errorMsg = error?.message || '';
                let userMessage = "Não foi possível conectar ao Google Drive. ";
                
                if (errorMsg.includes('NETWORK_ERROR') || errorMsg.includes('502') || errorMsg.includes('503') || errorMsg.includes('timeout')) {
                    userMessage += "O serviço está temporariamente indisponível.";
                } else if (errorMsg.includes('API has not been used') || errorMsg.includes('Enable the API')) {
                    userMessage += "A API do Google Drive não está habilitada no seu projeto.";
                } else if (errorMsg.includes('Invalid Credentials') || errorMsg.includes('API Key')) {
                    userMessage += "Suas credenciais estão incorretas.";
                } else {
                    userMessage += "Verifique sua conexão com a internet.";
                }
                
                isGoogleDriveDisabled = true; // Marcar como desabilitado novamente
                onAuthChangeCallback(false, undefined, undefined, userMessage);
            });
            return;
        }
    }
    
    if (!tokenClient) {
        const error = "Google Drive não está configurado. Para habilitar o backup na nuvem, configure as credenciais do Google OAuth no arquivo .env.local. O sistema continuará funcionando normalmente com armazenamento local.";
        console.warn(error);
        throw new Error(error);
    };
    
    const tokenOptions: { prompt?: string } = {};
    if (options.prompt) {
        tokenOptions.prompt = options.prompt;
    }
    
    tokenClient.requestAccessToken(tokenOptions);
}

/**
 * Reabilita o Google Drive após ter sido desabilitado por erro
 */
export function resetGoogleDrive() {
    isGoogleDriveDisabled = false;
    initPromise = null;
    tokenClient = null;
    console.log('✅ Google Drive reabilitado. Você pode tentar fazer login novamente.');
}

/**
 * Força a reinicialização do Google Drive
 */
export function forceReinitialize(callback: (isAuthorized: boolean, profile?: UserProfile, data?: BackupData | null, error?: string) => void): Promise<void> {
    console.log('🔄 Forçando reinicialização do Google Drive...');
    isGoogleDriveDisabled = false;
    initPromise = null;
    tokenClient = null;
    return initClient(callback);
}

export function handleSignoutClick(): Promise<void> {
    return new Promise((resolve) => {
        const gapi = (window as any).gapi;
        const google = (window as any).google;
        const token = gapi.client.getToken();
        
        if (token === null) {
            onAuthChangeCallback(false);
            resolve();
            return;
        }

        google.accounts.oauth2.revoke(token.access_token, () => {
            gapi.client.setToken(null);
            onAuthChangeCallback(false);
            resolve();
        });
    });
}

/**
 * Revokes the current token without triggering a full sign-out flow.
 * Used to force a re-authentication when permissions are insufficient.
 */
export function revokeCurrentToken(): Promise<void> {
    return new Promise((resolve, reject) => {
        const gapi = (window as any).gapi;
        const google = (window as any).google;

        if (!gapi || !google || !google.accounts || !google.accounts.oauth2) {
            // This should not happen if initClient was successful, but as a safeguard.
            return reject(new Error("Bibliotecas do Google não estão carregadas para revogar o token."));
        }

        const token = gapi.client.getToken();
        
        if (token === null || !token.access_token) {
            // No token to revoke, so we're done.
            resolve();
            return;
        }

        google.accounts.oauth2.revoke(token.access_token, (done: any) => {
            // Clear the token from the gapi client regardless of revoke success
            gapi.client.setToken(null);
            
            if (done && done.error) {
                // Log the error but don't reject the promise, as we want to proceed with login anyway.
                console.warn("Falha ao revogar token, mas prosseguindo com a tentativa de login. Erro:", done.error);
            }
            resolve();
        });
    });
}

export async function saveToDrive(data: BackupData) {
    const content = JSON.stringify(data);
    const fileId = await getFileId();

    if (fileId) {
        await updateFile(fileId, content);
    } else {
        await createFile(content);
    }
}

export async function saveDataAndSignOut(data: BackupData) {
    const gapi = (window as any).gapi;
    const token = gapi.client.getToken();

    if (token) {
        try {
            await saveToDrive(data);
        } catch (e) {
            console.error("Falha ao salvar os dados na saída, mas prosseguindo com o logout.", e);
            // Don't rethrow, as logging out is the primary user intent.
        }
    }
    
    await handleSignoutClick();
}


export async function loadFromDrive(): Promise<BackupData | null> {
    const fileId = await getFileId();
    if (!fileId) {
        return null;
    }
    const gapi = (window as any).gapi;
    if (!gapi.client?.drive) {
        throw new Error("O cliente da API do Google Drive não está carregado. A inicialização pode ter falhado ou estar incompleta.");
    }
    try {
        const response = await gapi.client.drive.files.get({
            fileId: fileId,
            alt: 'media'
        });
        return response.result as BackupData;
    } catch (e: any) {
       handleDriveError(e, "Não foi possível carregar o arquivo de backup");
    }
}
