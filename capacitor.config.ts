import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.edu.app',
  appName: 'EduApp',
  webDir: 'public',
  server: {
    url: 'https://edu-flow-2026-platform.vercel.app',
    androidScheme: 'https',
    cleartext: false
  }
};

export default config;
