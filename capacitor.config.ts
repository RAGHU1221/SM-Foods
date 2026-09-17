import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.srimuruganfoods.pos',
  appName: 'Sri Murugan Foods POS',
  webDir: 'dist',
  bundledWebRuntime: false,
  android: {
    backgroundColor: '#b91c1c'
  }
};

export default config;
