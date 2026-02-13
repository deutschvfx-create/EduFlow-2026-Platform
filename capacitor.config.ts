import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.edu.app',
  appName: 'EduApp',
  webDir: 'public',
  server: {
    url: 'https://uniwersitet-kontrolle.web.app',
    androidScheme: 'https',
    cleartext: false
  }
};

export default config;
