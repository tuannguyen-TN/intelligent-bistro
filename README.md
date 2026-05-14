# The Intelligent Bistro

A high-fidelity mobile experience where an AI assistant manages restaurant ordering.

- **Mobile**: Expo (React Native) + NativeWind, Zustand for state, Expo Router for navigation, Reanimated for sheet animations.
- **Backend**: Fastify (Node.js + TypeScript). The `/chat` endpoint currently uses a deterministic local parser so the demo runs without any API key; the contract it returns (`{ reply, actions[] }`) matches what a Claude tool-use call will return, so dropping in the Anthropic SDK later is a one-file swap inside `apps/api/src/parser.ts`.
- **Shared**: `packages/shared` holds the `MenuItem`, `CartItem`, `CartAction`, `ChatRequest`, `ChatResponse` types used by both ends.

## Prerequisites

- Node 20+
- `yarn` (this repo uses yarn workspaces — `npm`/`pnpm` will not install correctly)
- The Expo Go app on a phone, or an iOS Simulator / Android emulator

## First-time setup

```bash
yarn install
cp apps/api/.env.example apps/api/.env   # placeholder values are fine for now
```

When you wire in the real Claude API, replace `ANTHROPIC_API_KEY` in `apps/api/.env`.

### Pointing the mobile app at the backend

If you run the app on a physical device, `localhost` on the phone refers to the phone itself. Edit `apps/mobile/app.json` and set `expo.extra.apiUrl` to your machine's LAN IP, e.g. `http://192.168.1.42:4000`. The Expo Simulator/emulator can use `localhost` as-is.

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
- `POST /chat` — body `{ message: string, cart: CartItem[] }`, returns `{ reply: string, actions: CartAction[], unmatched?: string[] }`.

`CartAction` is one of `add_item`, `remove_item`, `update_quantity`, or `clear_cart`. The mobile app's Zustand store applies any returned actions identically whether they came from the AI or a UI tap, so there is one source of truth for cart mutations.

## Try it

Open the chat overlay (the **Ask AI** button) and try:

- "Two spicy chicken sandwiches and a large water"
- "Add a mushroom burger with extra cheese and avocado"
- "Remove the salad"
- "Clear my cart"

## Project layout

```
apps/
  api/                 Fastify backend
    src/
      data/menu.ts     Bistro menu (seed data)
      parser.ts        NL → CartAction parser (swap for Claude tool use)
      index.ts         Fastify server
  mobile/              Expo app
    app/               Expo Router routes
    components/        MenuItemCard, CartDrawer, ChatOverlay, CategoryPills
    lib/               cart store, API client, formatters
packages/
  shared/              Shared TypeScript types
```

## Swapping in Claude

`apps/api/src/parser.ts` exports `parseUserMessage(message, cart) → ChatResponse`. Replace its body with an Anthropic SDK call using tool use:

1. Define tools matching the `CartAction` discriminated union: `add_item`, `remove_item`, `update_quantity`, `clear_cart`.
2. Pass the menu (`MENU`) and current cart in the system prompt so the model can ground item names and modifiers.
3. Map each returned `tool_use` block into a `CartAction` and return them as the `actions` array, with the text block as `reply`.

Nothing else needs to change — the mobile app already speaks this contract.
