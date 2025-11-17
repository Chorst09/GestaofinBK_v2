// Google Maps Loader
let isLoading = false;
let isLoaded = false;
const callbacks: Array<() => void> = [];

export function loadGoogleMaps(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Se já está carregado, resolve imediatamente
    if (isLoaded && window.google && window.google.maps) {
      resolve();
      return;
    }

    // Se está carregando, adiciona à fila de callbacks
    if (isLoading) {
      callbacks.push(() => resolve());
      return;
    }

    // Marca como carregando
    isLoading = true;

    // Verifica se o script já existe
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Cria callback global
    const callbackName = '__googleMapsCallback__';
    (window as any)[callbackName] = () => {
      isLoaded = true;
      isLoading = false;
      
      // Chama todos os callbacks pendentes
      callbacks.forEach(cb => cb());
      callbacks.length = 0;
      
      // Remove callback global
      delete (window as any)[callbackName];
      
      resolve();
    };

    // Cria e adiciona o script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}&loading=async`;
    script.async = true;
    script.defer = true;
    
    script.onerror = () => {
      isLoading = false;
      reject(new Error('Falha ao carregar Google Maps'));
    };

    document.head.appendChild(script);
  });
}

export function isGoogleMapsLoaded(): boolean {
  return isLoaded && !!window.google && !!window.google.maps;
}
