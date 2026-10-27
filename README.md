# Rally

A tennis-coaching operations app built by Jacob Ramón using AI-assisted development.

## Features
- Weekly schedules, lesson plans, player profiles, and progress notes.
- Rules-based drill selection using player level, focus, lesson duration, and recent drill history.
- Calendar conflict checks and preview-before-save scheduling commands.
- Completed-session invoicing, hourly rates, payment tracking, and safeguards against changing invoiced sessions.
- Postgres persistence with optimistic concurrency, signed sessions, Google sign-in support, and optional Stripe coach subscriptions.
- Mobile installation guidance and an offline notice.

## Stack
Next.js, React, TypeScript, Tailwind CSS, Drizzle ORM, Neon Postgres, Stripe, Google authentication.

## Run locally
1. Use Node.js 22.13 or newer and run `npm ci`.
2. Copy `.env.example` to `.env.local` and configure your own database and authentication values.
3. Apply the migrations in `drizzle/` to your database.
4. Run `npm run dev`; use `npm run build` for production output.

Optional Google sign-in and Stripe subscriptions require your own provider setup. Before deploying a fork, replace the deployment-specific billing return origin in `lib/coach-billing.ts`. Never deploy with missing session secrets or shared development credentials.

## Tests and limitations
The `tests/` directory covers calendar actions, billing, profiles, drill selection, and scheduling. Run TypeScript tests with a compatible TypeScript test runner, such as `npx tsx --test tests/*.test.ts tests/*.test.tsx`.
Scheduling and lesson generation are rules-based, not an LLM integration. Payment integrations require separately configured accounts; this repository does not imply active subscribers.

## Privacy
This is a sanitized source snapshot. Player names in starter fixtures and examples are fictional. No client database, real invoices, credentials, or production account data are included.
