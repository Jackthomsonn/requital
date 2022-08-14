import 'dotenv/config';

const config = {
  environment: 'local',
  functionUrl: 'https://requital.eu.ngrok.io/requital-39e1f/us-central1',
};

if (process.env.APP_ENV === 'production') {
  config.functionUrl = 'https://us-central1-requital-39e1f.cloudfunctions.net';
  config.environment = 'production';
}

export default {
  name: 'Requital',
  version: '1.0.19',
  scheme: 'requital',
  extra: {
    ...config,
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
