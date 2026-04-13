# NutriControl - Controle Nutricional

## Overview

Full-stack nutritional tracking web app (React + Vite frontend + Express API). Mobile-first design (max 430px) with Brazilian Portuguese UI.

## Features
- **Diário alimentar**: rastreamento de calorias, macros (proteína/carboidrato/gordura), com busca na tabela TACO e entrada manual
- **Hidratação**: controle de consumo de água diário com botões de atalho
- **Calculadora nutricional**: cálculo automático de IMC, TMB, TDEE e metas com base no perfil
- **Perfil**: dados pessoais, nível de atividade, objetivo calórico, jejum intermitente
- **Receitas**: criação e gerenciamento de receitas personalizadas
- **Progresso**: gráficos de peso e calorias ao longo do tempo

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (`artifacts/nutri-app/`)
- **API framework**: Express 5 (`artifacts/api-server/`)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Charts**: Recharts

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/nutri-app run dev` — run frontend locally

## Architecture

- `lib/api-spec/openapi.yaml` — API contract source of truth
- `lib/db/src/schema/` — Drizzle DB schemas (profile, foods, diary, hydration, recipes, progress)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/nutri-app/src/pages/` — React page components (DiaryPage, RecipesPage, ProgressPage, ProfilePage)

## Database Tables
- `profile` — user profile with nutritional targets computed server-side
- `foods` — TACO food database (40+ Brazilian foods seeded)
- `diary_entries` — daily food log entries
- `hydration` — daily water intake tracking
- `recipes` — user-created recipes
- `weight_entries` — weight tracking history
