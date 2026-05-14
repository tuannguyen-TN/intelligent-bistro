import type { CartAction, CartItem, ChatResponse, MenuItem } from '@bistro/shared';
import { MENU } from './data/menu.js';

/**
 * Heuristic NL parser used while the Claude API key is a placeholder.
 *
 * Public contract matches what a real tool-use call against Claude would
 * eventually return: a list of CartActions plus a short conversational reply.
 * Swap `parseUserMessage` for an Anthropic SDK call without touching callers.
 */

const NUMBER_WORDS: Record<string, number> = {
  a: 1,
  an: 1,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  dozen: 12,
  couple: 2,
  pair: 2,
};

interface ParsedChunk {
  quantity: number;
  text: string;
}

function splitChunks(message: string): ParsedChunk[] {
  const cleaned = message
    .toLowerCase()
    .replace(/\bplease\b|\bcan you\b|\bi['']?d like\b|\bi want\b|\bgive me\b|\bget me\b|\border me\b/g, '')
    .replace(/\b(add|order|get|grab|throw in|toss in)\b/g, '')
    .replace(/\band also\b|\b, and\b/g, ' and ');

  const segments = cleaned
    .split(/\s+(?:and|plus|,|then)\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  return segments.map((segment) => {
    const m = segment.match(/^(\d+|a|an|one|two|three|four|five|six|seven|eight|nine|ten|dozen|couple|pair)\b\s*/);
    let quantity = 1;
    let text = segment;
    if (m) {
      const token = m[1];
      quantity = /^\d+$/.test(token) ? parseInt(token, 10) : (NUMBER_WORDS[token] ?? 1);
      text = segment.slice(m[0].length).trim();
    }
    return { quantity, text };
  });
}

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function scoreMenuItem(item: MenuItem, text: string): number {
  const itemTokens = new Set([
    ...tokens(item.name),
    ...tokens(item.description),
    ...(item.tags ?? []).flatMap(tokens),
    ...tokens(item.category),
  ]);
  const queryTokens = tokens(text);
  if (queryTokens.length === 0) return 0;

  let score = 0;
  for (const t of queryTokens) {
    if (t.length < 3) continue;
    if (itemTokens.has(t)) score += 2;
    else if ([...itemTokens].some((it) => it.length >= 3 && (it.includes(t) || t.includes(it)))) {
      score += 1;
    }
  }
  if (tokens(item.name).every((t) => queryTokens.includes(t))) score += 3;
  return score;
}

function bestMatch(text: string): MenuItem | undefined {
  let best: { item: MenuItem; score: number } | undefined;
  for (const item of MENU) {
    const score = scoreMenuItem(item, text);
    if (score > 0 && (!best || score > best.score)) {
      best = { item, score };
    }
  }
  return best?.item;
}

function extractModifiers(item: MenuItem, text: string): { groupId: string; optionId: string }[] {
  const groups = item.modifierGroups ?? [];
  const result: { groupId: string; optionId: string }[] = [];
  const words = text.toLowerCase();

  for (const group of groups) {
    for (const option of group.options) {
      const phrase = option.label.toLowerCase();
      const idPhrase = option.id.replace(/-/g, ' ');
      if (words.includes(phrase) || words.includes(idPhrase)) {
        result.push({ groupId: group.id, optionId: option.id });
      }
    }
  }

  return result;
}

function isClearIntent(message: string): boolean {
  const m = message.toLowerCase();
  return (
    /\b(clear|empty|reset|start over|wipe|nuke)\b/.test(m) &&
    /\b(cart|order|everything|it)\b/.test(m)
  );
}

function isRemoveIntent(message: string): boolean {
  return /\b(remove|delete|drop|take off|cancel)\b/.test(message.toLowerCase());
}

function findCartLineByText(cart: CartItem[], text: string): CartItem | undefined {
  let best: { line: CartItem; score: number } | undefined;
  for (const line of cart) {
    const score = scoreMenuItem(
      { ...MENU.find((m) => m.id === line.itemId)!, name: line.name },
      text,
    );
    if (score > 0 && (!best || score > best.score)) best = { line, score };
  }
  return best?.line;
}

export function parseUserMessage(message: string, cart: CartItem[]): ChatResponse {
  const actions: CartAction[] = [];
  const unmatched: string[] = [];
  const matched: string[] = [];

  if (isClearIntent(message)) {
    return {
      actions: [{ type: 'clear_cart' }],
      reply: 'Cleared your cart. What would you like to start with?',
    };
  }

  if (isRemoveIntent(message)) {
    const chunks = splitChunks(message.replace(/\b(remove|delete|drop|take off|cancel)\b/gi, ''));
    for (const chunk of chunks) {
      const line = findCartLineByText(cart, chunk.text);
      if (line) {
        actions.push({ type: 'remove_item', lineId: line.lineId });
        matched.push(line.name);
      } else if (chunk.text) {
        unmatched.push(chunk.text);
      }
    }
    const reply = matched.length
      ? `Removed ${matched.join(' and ')} from your cart.`
      : "I couldn't find that on your cart.";
    return { actions, reply, unmatched: unmatched.length ? unmatched : undefined };
  }

  const chunks = splitChunks(message);
  for (const chunk of chunks) {
    const item = bestMatch(chunk.text);
    if (!item) {
      if (chunk.text.length > 1) unmatched.push(chunk.text);
      continue;
    }
    const modifiers = extractModifiers(item, chunk.text);
    actions.push({
      type: 'add_item',
      itemId: item.id,
      quantity: chunk.quantity,
      modifiers: modifiers.length ? modifiers : undefined,
    });
    matched.push(`${chunk.quantity} × ${item.name}`);
  }

  let reply: string;
  if (matched.length && unmatched.length) {
    reply = `Added ${matched.join(', ')}. I couldn't find: ${unmatched.join(', ')} — did you mean something else?`;
  } else if (matched.length) {
    reply = `Added ${matched.join(', ')} to your cart.`;
  } else if (unmatched.length) {
    reply = `I couldn't match anything on our menu for "${unmatched.join(', ')}". Try a different name or ask me what's available.`;
  } else {
    reply = 'Tell me what you\'d like — for example, "two spicy chicken sandwiches and a large water".';
  }

  return { actions, reply, unmatched: unmatched.length ? unmatched : undefined };
}
