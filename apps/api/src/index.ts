import Fastify from 'fastify';
import cors from '@fastify/cors';
import type { ChatRequest } from '@bistro/shared';
import { MENU } from './data/menu.js';
import { parseUserMessage } from './parser.js';
import { geminiChat } from './ai/gemini.js';
import { env, hasGemini } from './utils.js';

const app = Fastify({ logger: { level: 'info' } });

await app.register(cors, { origin: true });

app.get('/health', async () => ({ ok: true }));

app.get('/menu', async () => ({ items: MENU }));

app.post<{ Body: ChatRequest }>('/chat', async (request, reply) => {
  const { message, cart } = request.body ?? ({ message: '', cart: [] } as ChatRequest);

  if (typeof message !== 'string' || !message.trim()) {
    return reply.code(400).send({ error: 'message is required' });
  }

  const safeCart = cart ?? [];

  if (hasGemini) {
    try {
      return await geminiChat(message, safeCart, request.body?.history);
    } catch (err) {
      app.log.error({ err }, 'Gemini chat failed — falling back to parser');
    }
  }

  return parseUserMessage(message, safeCart);
});

try {
  await app.listen({ port: env.port, host: env.host });
  app.log.info(`Bistro API listening on http://${env.host}:${env.port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
