# The Intelligent Bistro

Backend URL: [https://intelligent-bistro.onrender.com]

A high-fidelity mobile experience where an AI assistant manages restaurant ordering.

- **Mobile**: Expo (React Native) + NativeWind, Zustand for state, Expo Router for navigation, Reanimated for sheet animations.
- **Backend**: Fastify (Node.js + TypeScript). The `/chat` endpoint is powered by Google Gemini with function calling; when no API key is set it falls back to a deterministic local parser so the demo still runs. Both paths return the same contract (`{ reply, actions[] }`), so the mobile app is agnostic to which brain answered.
- **Shared**: `packages/shared` holds the `MenuItem`, `CartItem`, `CartAction`, `ChatRequest`, `ChatResponse` types used by both ends.

## Prerequisites

- Node 20+
- `yarn` (this repo uses yarn workspaces — `npm`/`pnpm` will not install correctly)
- The Expo Go app on a phone, or an iOS Simulator / Android emulator
- (Optional) A Google Gemini API key — without it the chat uses the local parser fallback

## First-time setup

```bash
yarn install
cp apps/api/.env.example apps/api/.env
```

To enable the real LLM, set `GEMINI_API_KEY` in `apps/api/.env`. Leaving it blank is fine — `/chat` falls back to the deterministic parser. `GEMINI_MODEL` defaults to `gemini-2.5-flash`.

### Pointing the mobile app at the backend

The mobile app auto-detects the backend: it reads the Expo dev server's host (the address your phone already uses to load the JS bundle) and talks to port 4000 on the same machine. On a physical device or simulator on the same network this just works with no config, and it keeps working when you switch networks.

To point at a backend on a different machine, set `expo.extra.apiUrl` in `apps/mobile/app.json` (e.g. `http://192.168.1.42:4000`); when set, it takes priority over auto-detection.

## Running

Two terminals:

```bash
# terminal 1 — backend
yarn api

# terminal 2 — mobile
yarn mobile
```

Or both at once:

```bash
yarn dev
```

The API listens on `http://localhost:4000`. The Expo dev server prints a QR code; scan it with Expo Go.

## API

- `GET /health` — liveness check.
- `GET /menu` — returns `{ items: MenuItem[] }`.
- `POST /chat` — body `{ message: string, cart: CartItem[], history?: { role, content }[] }`, returns `{ reply: string, actions: CartAction[], unmatched?: string[] }`. `history` is the prior conversation turns, replayed so the LLM has context across messages.

`CartAction` is one of `add_item`, `remove_item`, `update_quantity`, or `clear_cart`. The mobile app's Zustand store applies any returned actions identically whether they came from the AI or a UI tap, so there is one source of truth for cart mutations.

## Try it

Open the chat overlay (the **Ask AI** button) and try:

- "Two spicy chicken sandwiches and a large water"
- "Add a mushroom burger with extra cheese and avocado"
- "Remove the salad"
- "Clear my cart"

With a Gemini key set, follow-ups work too — "make the first one extra spicy", "actually add one more".

## Project layout

```
apps/
  api/                 Fastify backend
    src/
      ai/gemini.ts     Gemini integration (function calling → CartActions)
      data/menu.ts     Bistro menu (seed data)
      parser.ts        Deterministic NL → CartAction parser (fallback)
      utils.ts         Centralized env config
      index.ts         Fastify server
  mobile/              Expo app
    app/               Expo Router routes
    components/        MenuItemCard, CartDrawer, ChatOverlay, CategoryPills
    lib/               cart store, API client, formatters
packages/
  shared/              Shared TypeScript types
```

## How the AI chat works

`/chat` chooses its brain at request time based on whether `GEMINI_API_KEY` is set (the `hasGemini` flag in `apps/api/src/utils.ts`):

- **With a key** — `apps/api/src/ai/gemini.ts` calls Gemini with four function declarations mirroring the `CartAction` union (`add_item`, `remove_item`, `update_quantity`, `clear_cart`). The current menu and cart are serialized into the system instruction so the model can ground item names, modifiers, and cart line ids. Returned function calls are validated against the real menu and cart — hallucinated ids are dropped — and mapped to `CartAction`s; the model's text becomes `reply`. Conversation `history` is replayed on every call so the assistant remembers earlier turns. If the Gemini call throws (bad key, quota, network), `/chat` logs it and falls back to the parser.
- **Without a key** — `apps/api/src/parser.ts` (`parseUserMessage`) handles the message with heuristic matching. It is stateless and ignores `history`.

Because both return the identical `{ reply, actions[] }` contract, nothing on the mobile side cares which one ran.
