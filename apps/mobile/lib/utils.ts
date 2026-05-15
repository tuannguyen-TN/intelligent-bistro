import Constants from 'expo-constants';

// Centralized access to the mobile app's environment + runtime config.
// apiUrl may come from apps/mobile/.env (EXPO_PUBLIC_API_URL) or from
// app.json's expo.extra.apiUrl — the .env value wins when both are set.
export const env = {
  apiUrl:
    process.env.EXPO_PUBLIC_API_URL ||
    (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ||
    '',
} as const;
