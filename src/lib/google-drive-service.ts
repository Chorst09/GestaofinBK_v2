
"use client";

import type { BackupData, UserProfile } from './types';

// These variables are read from the environment. See .env.local.template for instructions.
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// Constants for Google Drive API interaction.
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';
const BACKUP_FILE_NAME = 'financas-zen-backup.json';

// Module-level variables to hold the Google API clients and state.
let tokenClient: any | null = null;
let onAuthChangeCallback: (isAuthorized: boolean, profile?: UserProfile, data?: BackupData | null, error?: string) => void;
let initPromise: Promise<void> | null = null;


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
    if (statusToCheck === 'PERMISSION_DENIED' || messageToCheck.includes('insufficient scopes') || messageToCheck.includes('insufficient permissions')) {
        // This is the key change: throw a predictable error message
        throw new Error(`PERMISSION_DENIED: O aplicativo não tem o acesso necessário ao Google Drive. Por favor, clique no botão "Entrar com Google" novamente para aprovar as permissões. Detalhes: ${details}`);
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

    initPromise = (async () => {
        onAuthChangeCallback = callback;

        const isClientIdInvalid = !CLIENT_ID || CLIENT_ID.trim() === '' || CLIENT_ID.includes('COLE_SEU_ID_DE_CLIENTE_OAUTH_AQUI');
        const isApiKeyInvalid = !API_KEY || API_KEY.trim() === '' || API_KEY.includes('COLE_SUA_CHAVE_DE_API_AQUI');

        if (isApiKeyInvalid || isClientIdInvalid) {
            const isProduction = process.env.NODE_ENV === 'production';
            const configError = isProduction 
              ? "As credenciais do Google (API Key e Client ID) não foram configuradas para o ambiente de produção. Adicione as variáveis de ambiente nas configurações do seu provedor de hospedagem."
              : "Credenciais do Google não configuradas. Por favor, crie ou verifique seu arquivo .env.local e adicione sua Chave de API e ID de Cliente OAuth, conforme as instruções no arquivo .env.local.template.";
            onAuthChangeCallback(false, undefined, undefined, configError);
            throw new Error(configError);
        }

        try {
            await Promise.all([
                loadScript('https://apis.google.com/js/api.js'),
                loadScript('https://accounts.google.com/gsi/client')
            ]);
            
            const gapi = (window as any).gapi;
            const google = (window as any).google;

            if (!gapi) throw new Error("A biblioteca GAPI do Google (api.js) não foi carregada corretamente. Verifique sua conexão ou extensões de navegador.");
            if (!google) throw new Error("A biblioteca GIS do Google (gsi/client) não foi carregada corretamente. Verifique sua conexão ou extensões de navegador.");
            
            await new Promise<void>((resolve, reject) => {
                gapi.load('client', {
                    callback: async () => {
                        try {
                            await gapi.client.init({
                                apiKey: API_KEY,
                                discoveryDocs: [DISCOVERY_DOC],
                            });
                            resolve();
                        } catch (e: any) {
                            reject(new Error(`O cliente GAPI (Drive API) falhou ao carregar: ${JSON.stringify(e)}`));
                        }
                    },
                    onerror: (err: any) => reject(new Error(`O cliente GAPI (Drive API) falhou ao carregar: ${JSON.stringify(err)}`)),
                    timeout: 10000,
                    ontimeout: () => reject(new Error('O carregamento do cliente GAPI (Drive API) expirou.'))
                });
            });

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
            console.error("Google Drive initialization failed:", error);
            const errorMessage = `A inicialização do Google Drive falhou: ${error.message}. Se o problema persistir, tente recarregar a página, desativar extensões (como bloqueadores de anúncio) ou verificar a sua conexão com a internet.`;
            onAuthChangeCallback(false, undefined, undefined, errorMessage);
            initPromise = null; // Reset promise on failure
        }
    })();

    return initPromise;
}

export function handleAuthClick(options: { prompt?: string } = {}) {
    if (!tokenClient) {
        throw new Error("Cliente Google não inicializado. A inicialização pode ter falhado. Verifique sua conexão com a internet, desative bloqueadores de anúncio e tente recarregar a página. Se o erro persistir, verifique o console para mais detalhes.");
    };
    
    const tokenOptions: { prompt?: string } = {};
    if (options.prompt) {
        tokenOptions.prompt = options.prompt;
    }
    
    tokenClient.requestAccessToken(tokenOptions);
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
