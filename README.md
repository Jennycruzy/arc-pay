# ArcChain Pay

A decentralized payment dApp for creating and sharing crypto payment links.

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- wagmi + viem (Web3)

## Setup

```sh
npm install
npm run dev
```

## Environment Variables

Create a `.env` file:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

## Deployment

Build for production:

```sh
npm run build
```

Deploy the `dist/` folder to Vercel, Netlify, or any static hosting provider.
