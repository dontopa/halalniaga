import { registerSW } from 'virtual:pwa-register';

export const registerServiceWorker = () => {
  if (!('serviceWorker' in navigator)) return;

  registerSW({
    immediate: true,
    onOfflineReady() {
      window.dispatchEvent(new Event('halalniaga:offline-ready'));
    },
    onRegisterError(error) {
      console.warn('HALALNiaga service worker registration failed', error);
    },
  });
};
