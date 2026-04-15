declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            photo_url?: string;
            is_premium?: boolean;
          };
          start_param?: string;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        enableClosingConfirmation: () => void;
        openInvoice: (
          url: string,
          callback?: (status: 'paid' | 'cancelled' | 'failed' | 'pending') => void,
        ) => void;
        showAlert: (message: string, callback?: () => void) => void;
        platform: string;
        colorScheme: 'dark' | 'light';
        themeParams: Record<string, string>;
      };
    };
  }
}

export function initTelegram() {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#000000');
    tg.setBackgroundColor('#000000');
    tg.enableClosingConfirmation();
  }
}

export function getTelegramUser() {
  return window.Telegram?.WebApp?.initDataUnsafe?.user ?? null;
}

export function getInitData(): string {
  // Check WebApp initData first, then URL hash
  const tgInitData = window.Telegram?.WebApp?.initData;
  if (tgInitData) return tgInitData;

  const hash = window.location.hash;
  if (hash.includes('tgWebAppData')) {
    const params = new URLSearchParams(hash.slice(1));
    return params.get('tgWebAppData') || '';
  }

  return '';
}

export function getStartParam(): string | undefined {
  return window.Telegram?.WebApp?.initDataUnsafe?.start_param;
}

export function isTelegramContext(): boolean {
  return !!window.Telegram?.WebApp?.initData;
}

export function openStarsInvoice(
  url: string,
): Promise<'paid' | 'cancelled' | 'failed' | 'pending'> {
  return new Promise((resolve) => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.openInvoice) {
      resolve('failed');
      return;
    }
    tg.openInvoice(url, (status) => resolve(status));
  });
}
