import 'dotenv/config';

export default {
  name: 'Requital',
  version: '1.0.16',
  scheme: 'requital',
  extra: {
    clientId: process.env.CLIENT_ID,
    environment: process.env.NODE_ENV,
    functionUrl: process.env.FUNCTION_URL,
  },
  plugins: [[
    'expo-notifications',
    {
      'icon': './assets/favicon.png',
      'color': '#ffffff',
    },
  ]],
  slug: 'requital',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.requital.requital',
    buildNumber: '0.0.1',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FFFFFF',
    },
    package: 'com.requital.requital',
    googleServicesFile: './google-services.json',
  },
};
