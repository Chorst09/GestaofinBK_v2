import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie'; // Para gerenciar cookies (state)
import { randomBytes } from 'crypto'; // Para gerar o state

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// Certifique-se de que esta URI de redirecionamento está configurada
// corretamente nas credenciais OAuth 2.0 no Google Cloud Console.
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

// Escopos necessários. Adicionado escopos para Google Calendar e Google Drive (AppData).
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/drive.appdata', // Essencial para acessar a pasta AppData
];

// Inicialize o cliente OAuth2.
// Importante: Em um ambiente serverless, este cliente pode ser reinicializado
// a cada requisição. Você precisará de uma forma de carregar as credenciais
// do usuário (tokens) e configurá-lo ANTES de fazer chamadas à API.
const oAuth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

// // Opcional: Listener para atualizar tokens automaticamente.
// // Requer que o oAuth2Client esteja configurado com um refresh_token
// // e que você salve os novos tokens no seu armazenamento (Google Drive neste caso).
// oAuth2Client.on('tokens', async (tokens) => {
//   console.log('Evento "tokens" acionado. Novos tokens recebidos:', tokens);
//   // TODO: Salvar os novos tokens (access_token e expiry_date, possivelmente refresh_token se mudou)
//   // no arquivo do Google Drive do usuário correspondente.
//   // Isso requer que você tenha acesso ao ID do usuário aqui, o que pode ser complexo
//   // dependendo de como você gerencia a sessão ou o contexto do usuário.
//   // Uma abordagem seria carregar o cliente por usuário antes de usá-lo.
//   console.log("[TODO] Salvar novos tokens do evento 'tokens' no Google Drive.");
// });


// Implementação para salvar tokens no Google Drive (pasta AppData).
// Requer o escopo 'https://www.googleapis.com/auth/drive.appdata'.
async function salvarTokensNoGoogleDrive(userId: string, tokens: any): Promise<void> {
  // TODO: Implementar a lógica real da API do Google Drive para encontrar/criar/atualizar o arquivo de tokens do usuário.
  // Esta função é chamada após a troca de código por tokens na rota GET.
  // O oAuth2Client JÁ ESTÁ CONFIGURADO com os tokens recebidos neste ponto.

  const drive = google.drive({ version: 'v3', auth: oAuth2Client });

  try {
    // 1. Formatar os dados dos tokens para salvar (como JSON).
    const tokenData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date instanceof Date ? tokens.expiry_date.toISOString() : new Date(tokens.expiry_date).toISOString(),
      scope: tokens.scope,
      token_type: tokens.token_type,
      // Inclua outros campos relevantes dos tokens se existirem (ex: id_token)
    };
    const fileContent = JSON.stringify(tokenData);

    // Nome do arquivo de tokens (deve ser único por usuário e consistente)
    const fileName = `google_calendar_tokens_${userId}.json`;
    const mimeType = 'application/json';
    const appDataFolder = 'appDataFolder'; // Identificador especial para a pasta AppData

    // 2. Buscar por um arquivo de tokens existente para o usuário na pasta AppData.
    console.log(`Buscando arquivo de tokens "${fileName}" na pasta AppData...`);
    const filesResponse = await drive.files.list({
      q: `name='${fileName}' and '${appDataFolder}' in parents`,
      spaces: appDataFolder, // Buscar no espaço 'appDataFolder'
      fields: 'files(id, name)',
    });

    const existingFiles = filesResponse.data.files;
    let fileId: string | null = existingFiles && existingFiles.length > 0 ? existingFiles[0].id : null;

    if (fileId) {
      // 3. Se o arquivo existir, atualizá-lo com os novos tokens.
      console.log(`Arquivo de tokens existente encontrado (${fileName}, ID: ${fileId}), atualizando...`);
      await drive.files.update({
        fileId: fileId,
        media: {
          mimeType: mimeType,
          body: fileContent,
        },
      });
      console.log(`Arquivo ${fileName} atualizado com sucesso.`);
    } else {
      // 4. Se o arquivo não existir, criá-lo na pasta AppData.
      console.log(`Arquivo de tokens não encontrado (${fileName}), criando novo na pasta AppData...`);
      const response = await drive.files.create({
        requestBody: {
          name: fileName,
          mimeType: mimeType,
          parents: [appDataFolder], // Criar na pasta AppData
        },
        media: {
          mimeType: mimeType,
          body: fileContent,
        },
        fields: 'id', // Solicitar o ID do arquivo criado na resposta
      });
      fileId = response.data.id;
      console.log(`Novo arquivo ${fileName} criado na pasta AppData com ID: ${fileId}.`);
    }

  } catch (error) {
    console.error(`Erro ao salvar tokens no Google Drive para o usuário ${userId}:`, error);
    // Dependendo da sua estratégia de tratamento de erros, você pode querer
    // relançar o erro ou lidar com ele de outra forma.
    throw new Error('Falha ao salvar tokens no Google Drive.');
  }
}

// Implementação para carregar tokens do Google Drive (pasta AppData).
// Requer o escopo 'https://www.googleapis.com/auth/drive.appdata'.
async function carregarTokensDoGoogleDrive(userId: string): Promise<any | null> {
  // TODO: Implementar a lógica real da API do Google Drive para carregar tokens do arquivo do usuário.
  // Esta função é chamada na rota POST para obter os tokens antes de fazer a chamada ao Calendar.
  // O principal desafio aqui é garantir que o oAuth2Client esteja configurado com
  // credenciais (pelo menos um refresh_token ou access_token válido) ANTES de chamar a API do Drive.
  // Em um ambiente serverless, pode ser necessário carregar alguma identificação do usuário
  // e suas credenciais iniciais (talvez de outro armazenamento rápido, como cache ou
  // um cookie seguro - embora cookies tenham limitações de tamanho e segurança para tokens)
  // para configurar o oAuth2Client antes de executar esta função.

  // Exemplo conceitual: Você teria que carregar as credenciais INICIAIS do usuário aqui
  // para configurar o oAuth2Client para fazer a chamada à API do Drive.
  // oAuth2Client.setCredentials(credenciaisIniciaisDoUsuario);

  const drive = google.drive({ version: 'v3', auth: oAuth2Client });

  try {
    const fileName = `google_calendar_tokens_${userId}.json`;
    const appDataFolder = 'appDataFolder';

    // 1. Buscar pelo arquivo de tokens do usuário na pasta AppData.
    console.log(`Buscando arquivo de tokens "${fileName}" na pasta AppData para carregar...`);
    const filesResponse = await drive.files.list({
      q: `name='${fileName}' and '${appDataFolder}' in parents`,
      spaces: appDataFolder,
      fields: 'files(id)',
    });

    const existingFiles = filesResponse.data.files;
    let fileId: string | null = existingFiles && existingFiles.length > 0 ? existingFiles[0].id : null;

    if (fileId) {
      // 2. Se o arquivo for encontrado, baixar seu conteúdo.
      console.log(`Arquivo de tokens encontrado no Drive (${fileName}, ID: ${fileId}), baixando conteúdo...`);
      const response = await drive.files.get({
        fileId: fileId,
        alt: 'media', // Para baixar o conteúdo do arquivo
      }, {
        responseType: 'json', // Ideal para obter o conteúdo como JSON diretamente (requer googleapis >= v88.0.0)
        // Se 'json' não funcionar, use 'text' e faça JSON.parse(response.data)
        // responseType: 'text'
      });

      // 3. Parsear o conteúdo (se responseType for 'text') e formatar os dados dos tokens.
      const tokenData = response.data; // Se responseType: 'json'
      // const tokenData = JSON.parse(response.data); // Se responseType: 'text'

      console.log(`Conteúdo do arquivo de tokens carregado. Formatando...`);
      // 4. Formatar os dados para serem usados pelo oAuth2Client.setCredentials.
      return {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        // A API do Google espera expiry_date como timestamp em milissegundos
        expiry_date: new Date(tokenData.expiry_date).getTime(),
        scope: tokenData.scope,
        token_type: tokenData.token_type,
        // Inclua outros campos se houver (ex: id_token)
      };

    } else {
      // Arquivo de tokens não encontrado para este usuário.
      console.log(`Arquivo de tokens não encontrado no Drive para o usuário ${userId}. Não é possível carregar tokens.`);
      return null;
    }

  } catch (error) {
    console.error(`Erro ao carregar tokens do Google Drive para o usuário ${userId}:`, error);
    // Dependendo da sua estratégia de tratamento de erros, você pode querer
    // relançar o erro ou retornar null.
    throw new Error('Falha ao carregar tokens do Google Drive.');
  }
}


export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const storedState = req.cookies.get('google_auth_state'); // Obter o state armazenado no cookie

  // Implementação do parâmetro state para proteção CSRF.
  if (state !== storedState) {
    console.error('Erro de CSRF: state inválido.');
    // Retornar erro ou redirecionar para uma página de erro.
    return NextResponse.json({ success: false, message: 'Erro de segurança: state inválido.' }, { status: 400 });
  }

  // Opcional: Limpar o cookie de state após a verificação.
  const stateCookie = serialize('google_auth_state', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0, // Expirar imediatamente
    path: '/',
  });

  if (code) {
    try {
      // Trocar o código de autorização por tokens.
      const { tokens } = await oAuth2Client.getToken(code);
      console.log('Tokens recebidos do Google:', tokens);

      // TODO: Substituir 'placeholder-user-id' pelo ID real do usuário logado.
      // A forma de obter o ID do usuário depende do seu sistema de autenticação.
      const userId = 'placeholder-user-id';

      // Salvar os tokens no Google Drive (pasta AppData).
      await salvarTokensNoGoogleDrive(userId, tokens);

      // Redirecionar o usuário para uma página de sucesso na sua aplicação.
      // Você pode incluir um parâmetro na URL para indicar sucesso.
      const successRedirectUrl = new URL('/settings?google-auth=success', url.origin);
      const response = NextResponse.redirect(successRedirectUrl);
      response.headers.set('Set-Cookie', stateCookie); // Limpar o cookie de state
      return response;

    } catch (error) {
      console.error('Erro ao trocar código por tokens ou salvar no Google Drive:', error);
      // Redirecionar para uma página de erro ou exibir uma mensagem.
      const errorRedirectUrl = new URL('/settings?google-auth=error', url.origin);
      const response = NextResponse.redirect(errorRedirectUrl);
      response.headers.set('Set-Cookie', stateCookie); // Limpar o cookie de state
      return response;
    }
  } else {
    // Se não houver código na URL, gerar a URL de autorização.
    const newState = randomBytes(16).toString('hex'); // Gerar um state único

    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline', // Solicita um refresh token
      scope: SCOPES.join(' '), // Juntar os escopos com espaço
      prompt: 'consent', // Força a tela de consentimento para obter o refresh token
      state: newState, // Incluir o state na URL de autorização
    });

    // Armazenar o state em um cookie HTTP Only para verificar no retorno.
    const stateCookie = serialize('google_auth_state', newState, {
      httpOnly: true, // Protege contra acesso via JavaScript
      secure: process.env.NODE_ENV === 'production', // Usar apenas em HTTPS em produção
      maxAge: 60 * 5, // Tempo de expiração do cookie (ex: 5 minutos)
      path: '/', // Disponível em todo o site
    });

    const response = NextResponse.redirect(authUrl);
    response.headers.set('Set-Cookie', stateCookie);
    return response;
  }
}

export async function POST(req: NextRequest) {
  // Esta função é chamada para criar um evento no Google Calendar.
  // Ela precisa carregar os tokens do Google Drive antes de usar a API do Calendar.

  // TODO: Substituir 'placeholder-user-id' pelo ID real do usuário logado.
  // A forma de obter o ID do usuário aqui (em uma requisição POST) é crucial
  // e dependerá do seu sistema de autenticação (ex: token de sessão, cabeçalho de autorização).
  const userId = 'placeholder-user-id';

  // 1. Carregar os tokens do Google Drive para o usuário.
  // IMPORTANTE: O oAuth2Client precisa estar minimamente configurado ANTES
  // de chamar carregarTokensDoGoogleDrive para que esta possa chamar a API do Drive.
  // Você precisará de uma forma de carregar as credenciais iniciais do usuário aqui.
  // Isso é um desafio significativo em ambientes serverless e pode exigir um
  // armazenamento temporário rápido ou a re-autenticação parcial.
  console.log(`Attempting to load tokens for user ${userId} from Google Drive...`);
  const savedTokens = await carregarTokensDoGoogleDrive(userId);

  if (!savedTokens || !savedTokens.access_token) {
    console.error(`Tokens não encontrados ou inválidos para o usuário ${userId}.`);
    return NextResponse.json({ success: false, message: 'Tokens de autenticação não encontrados ou inválidos. Por favor, autentique-se novamente com o Google Calendar.' }, { status: 401 });
  }

  // 2. Configurar o oAuth2Client com os tokens carregados.
  // Incluir o refresh_token aqui permite que a biblioteca googleapis renove o access_token automaticamente.
  oAuth2Client.setCredentials({
    access_token: savedTokens.access_token,
    refresh_token: savedTokens.refresh_token,
    expiry_date: savedTokens.expiry_date, // Timestamp em ms
  });

  // 3. Inicializar a API do Google Calendar com o cliente configurado.
  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

  // 4. Validar os dados de entrada da requisição POST.
  const maintenanceDetails = await req.json();
  console.log('Detalhes da manutenção recebidos:', maintenanceDetails);

  // Validação básica dos dados de entrada.
  if (!maintenanceDetails || !maintenanceDetails.title || !maintenanceDetails.startTime || !maintenanceDetails.endTime) {
    console.error('Dados de manutenção incompletos ou inválidos:', maintenanceDetails);
    return NextResponse.json({ success: false, message: 'Dados de manutenção incompletos (título, hora de início ou hora de término faltando).' }, { status: 400 });
  }

  // Formato do evento para a API do Google Calendar.
  const event = {
    summary: maintenanceDetails.title,
    description: maintenanceDetails.description || 'Manutenção agendada através do aplicativo.',
    start: {
      dateTime: maintenanceDetails.startTime, // Deve estar em formato ISO 8601 (ex: '2023-10-27T10:00:00-03:00')
      timeZone: maintenanceDetails.timeZone || 'America/Sao_Paulo', // Especifique o fuso horário correto
    },
    end: {
      dateTime: maintenanceDetails.endTime, // Deve estar em formato ISO 8601
      timeZone: maintenanceDetails.timeZone || 'America/Sao_Paulo',
    },
    // Adicione outras propriedades do evento conforme necessário (ex: attendees, location)
  };

  try {
    // 5. Criar o evento no Google Calendar.
    console.log('Criando evento no Google Calendar...', event);
    const res = await calendar.events.insert({
      calendarId: 'primary', // 'primary' refere-se ao calendário principal do usuário
      requestBody: event,
    });
    console.log('Evento criado com sucesso:', res.data);

    // 6. Retornar sucesso com o link para o evento.
    return NextResponse.json({ success: true, message: 'Evento criado com sucesso no Google Calendar!', eventLink: res.data.htmlLink });

  } catch (error: any) {
    console.error('Erro ao criar o evento do calendário:', error.message || error);
    // Pode inspecionar error.code ou error.errors para detalhes específicos da API do Google.
    // Ex: if (error.code === 401) { ... token expirado ou inválido ... }
    return NextResponse.json({ success: false, message: 'Erro ao criar o evento do calendário.' }, { status: error.code || 500 });
  }
}
