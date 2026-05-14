import { GoogleGenAI, Type, type FunctionDeclaration } from '@google/genai';
import type { CartAction, CartItem, ChatResponse, MenuItem } from '@bistro/shared';
import { MENU } from '../data/menu.js';
import { env } from '../utils.js';

/**
 * Real LLM-driven chat. Mirrors the contract of `parseUserMessage`: returns a
 * list of CartActions plus a short conversational reply, so callers don't care
 * which brain produced it. `index.ts` falls back to the parser if this throws.
 */

// Constructed lazily so the SDK's "API key should be set" warning never fires
// when there's no key — geminiChat is only ever reached when hasGemini is true.
let client: GoogleGenAI | undefined;
function getClient(): GoogleGenAI {
  client ??= new GoogleGenAI({ apiKey: env.geminiApiKey });
  return client;
}

// Function declarations mirror the CartAction discriminated union. Gemini
// "calls" these; we map the calls straight onto CartAction objects.
const FUNCTION_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'add_item',
    description: 'Add a menu item to the cart. Use only itemIds that appear in the MENU.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        itemId: { type: Type.STRING, description: 'The id of a menu item from the MENU.' },
        quantity: { type: Type.NUMBER, description: 'Positive integer count to add.' },
        modifiers: {
          type: Type.ARRAY,
          description: 'Selected modifier options for this item, if any.',
          items: {
            type: Type.OBJECT,
            properties: {
              groupId: { type: Type.STRING, description: 'A modifier group id on the item.' },
              optionId: { type: Type.STRING, description: 'An option id within that group.' },
            },
            required: ['groupId', 'optionId'],
          },
        },
        notes: { type: Type.STRING, description: 'Optional free-text note for the kitchen.' },
      },
      required: ['itemId', 'quantity'],
    },
  },
  {
    name: 'remove_item',
    description: 'Remove a line from the cart entirely. Use a lineId from the CART.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        lineId: { type: Type.STRING, description: 'The lineId of a cart line from the CART.' },
      },
      required: ['lineId'],
    },
  },
  {
    name: 'update_quantity',
    description: 'Set the quantity of an existing cart line. Use a lineId from the CART.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        lineId: { type: Type.STRING, description: 'The lineId of a cart line from the CART.' },
        quantity: { type: Type.NUMBER, description: 'New positive integer quantity.' },
      },
      required: ['lineId', 'quantity'],
    },
  },
  {
    name: 'clear_cart',
    description: 'Empty the entire cart.',
    parameters: { type: Type.OBJECT, properties: {} },
  },
];

function serializeMenu(menu: MenuItem[]): string {
  return menu
    .map((item) => {
      const lines = [
        `ITEM id=${item.id} | "${item.name}" | $${item.price.toFixed(2)} | ${item.category}`,
      ];
      for (const group of item.modifierGroups ?? []) {
        const opts = group.options.map((o) => o.id).join(', ');
        const multi = group.multi ? ', multi-select' : '';
        lines.push(`  group id=${group.id} (${group.label}${multi}): ${opts}`);
      }
      return lines.join('\n');
    })
    .join('\n');
}

function serializeCart(cart: CartItem[]): string {
  if (cart.length === 0) return 'CART: (empty)';
  return [
    'CART:',
    ...cart.map((line) => {
      const mods = line.modifiers.map((m) => m.optionId).join(', ');
      const modStr = mods ? ` | modifiers: ${mods}` : '';
      return `  lineId=${line.lineId} | ${line.quantity} × ${line.name}${modStr}`;
    }),
  ].join('\n');
}

function buildSystemInstruction(cart: CartItem[]): string {
  return [
    'You are the ordering assistant for "The Intelligent Bistro", a restaurant app.',
    'Help the customer build their cart by calling the provided tools.',
    '',
    'Rules:',
    '- Only ever use itemIds, group ids, and option ids that appear in the MENU below. Never invent ids.',
    '- For remove_item and update_quantity, only use lineId values from the CART below.',
    '- quantity must be a positive integer.',
    '- You may call multiple tools in one turn (e.g. adding several items).',
    '- If the customer asks for something not on the menu, do not call a tool — just reply and suggest alternatives.',
    '- Always also produce a short, friendly natural-language reply confirming what you did or asking a clarifying question.',
    '',
    serializeMenu(MENU),
    '',
    serializeCart(cart),
  ].join('\n');
}

const MENU_IDS = new Set(MENU.map((m) => m.id));

function validModifiers(
  itemId: string,
  raw: unknown,
): { groupId: string; optionId: string }[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const item = MENU.find((m) => m.id === itemId);
  if (!item) return undefined;
  const result: { groupId: string; optionId: string }[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const { groupId, optionId } = entry as Record<string, unknown>;
    const group = item.modifierGroups?.find((g) => g.id === groupId);
    const option = group?.options.find((o) => o.id === optionId);
    if (group && option) result.push({ groupId: group.id, optionId: option.id });
  }
  return result.length ? result : undefined;
}

// Map a Gemini function call onto a CartAction, dropping anything that
// references ids the menu/cart don't actually have.
function toAction(
  name: string,
  args: Record<string, unknown>,
  cart: CartItem[],
): CartAction | null {
  const cartLineIds = new Set(cart.map((l) => l.lineId));

  switch (name) {
    case 'add_item': {
      const itemId = String(args.itemId ?? '');
      const quantity = Math.floor(Number(args.quantity));
      if (!MENU_IDS.has(itemId) || !Number.isFinite(quantity) || quantity < 1) return null;
      return {
        type: 'add_item',
        itemId,
        quantity,
        modifiers: validModifiers(itemId, args.modifiers),
        notes: typeof args.notes === 'string' && args.notes.trim() ? args.notes.trim() : undefined,
      };
    }
    case 'remove_item': {
      const lineId = String(args.lineId ?? '');
      if (!cartLineIds.has(lineId)) return null;
      return { type: 'remove_item', lineId };
    }
    case 'update_quantity': {
      const lineId = String(args.lineId ?? '');
      const quantity = Math.floor(Number(args.quantity));
      if (!cartLineIds.has(lineId) || !Number.isFinite(quantity) || quantity < 1) return null;
      return { type: 'update_quantity', lineId, quantity };
    }
    case 'clear_cart':
      return { type: 'clear_cart' };
    default:
      return null;
  }
}

// Used only when Gemini calls tools but returns no accompanying text.
function synthesizeReply(actions: CartAction[]): string {
  if (actions.length === 0) return "I'm not sure what to change — could you rephrase?";
  const parts: string[] = [];
  for (const action of actions) {
    if (action.type === 'add_item') {
      const item = MENU.find((m) => m.id === action.itemId);
      parts.push(`${action.quantity} × ${item?.name ?? action.itemId}`);
    } else if (action.type === 'remove_item') {
      parts.push('removed an item');
    } else if (action.type === 'update_quantity') {
      parts.push(`updated a quantity to ${action.quantity}`);
    } else {
      parts.push('cleared your cart');
    }
  }
  return `Done — ${parts.join(', ')}.`;
}

export async function geminiChat(
  message: string,
  cart: CartItem[],
  history?: { role: 'user' | 'assistant'; content: string }[],
): Promise<ChatResponse> {
  const contents = [
    ...(history ?? []).map((h) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }],
    })),
    { role: 'user', parts: [{ text: message }] },
  ];

  const response = await getClient().models.generateContent({
    model: env.geminiModel,
    contents,
    config: {
      systemInstruction: buildSystemInstruction(cart),
      tools: [{ functionDeclarations: FUNCTION_DECLARATIONS }],
    },
  });

  const actions: CartAction[] = [];
  for (const call of response.functionCalls ?? []) {
    if (!call.name) continue;
    const action = toAction(call.name, call.args ?? {}, cart);
    if (action) actions.push(action);
  }

  const text = response.text?.trim();
  const reply = text && text.length > 0 ? text : synthesizeReply(actions);

  return { actions, reply };
}
