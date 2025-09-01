import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c95528ce59a8440aa3f1c78cb50d9a60',
  appName: 'bill-bonus-builder',
  webDir: 'dist',
  server: {
    url: 'https://c95528ce-59a8-440a-a3f1-c78cb50d9a60.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false
    }
  }
};

export default config;
