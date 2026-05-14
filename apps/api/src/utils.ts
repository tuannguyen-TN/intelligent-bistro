import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT ?? 4000),
  host: process.env.HOST ?? '0.0.0.0',
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
  geminiModel: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
} as const;

export const hasGemini = env.geminiApiKey.length > 0;
