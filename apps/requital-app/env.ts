import * as AuthSession from 'expo-auth-session';


export const appRedirectUri = AuthSession.makeRedirectUri({ native: 'requital://', useProxy: true })

export const inTestMode = true;
