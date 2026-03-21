# 02 — Estrutura do Monorepo

## Estrutura de Pastas

```
track-toy/
├── apps/
│   ├── web/                        # Next.js (frontend + API Routes)
│   │   ├── app/
│   │   │   ├── (marketing)/        # Landing page, sobre
│   │   │   ├── (game)/             # Layout do jogo
│   │   │   │   ├── play/           # Modo aberto (sem login)
│   │   │   │   └── dashboard/      # Modo autenticado
│   │   │   ├── api/                # Route Handlers (Next.js)
│   │   │   │   └── auth/           # NextAuth endpoints
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── game/               # Componentes da cena 3D
│   │   │   │   ├── Track/
│   │   │   │   ├── Car/
│   │   │   │   ├── Obstacles/
│   │   │   │   └── GameScene.tsx
│   │   │   └── ui/                 # Componentes de interface (HUD, menus)
│   │   ├── hooks/
│   │   ├── store/                  # Zustand stores
│   │   ├── lib/
│   │   │   ├── auth.ts             # NextAuth config
│   │   │   └── api-client.ts       # Fetch wrapper para o NestJS
│   │   └── __tests__/
│   │
│   └── api/                        # NestJS backend
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   │   ├── auth.module.ts
│       │   │   │   ├── auth.controller.ts
│       │   │   │   ├── auth.service.ts
│       │   │   │   └── strategies/    # JWT, Local
│       │   │   ├── users/
│       │   │   │   ├── users.module.ts
│       │   │   │   ├── users.controller.ts
│       │   │   │   ├── users.service.ts
│       │   │   │   └── dto/
│       │   │   ├── game/
│       │   │   │   ├── game.module.ts
│       │   │   │   ├── game.controller.ts
│       │   │   │   ├── game.service.ts
│       │   │   │   └── schemas/       # Mongoose schemas
│       │   │   ├── levels/
│       │   │   └── ranking/
│       │   ├── common/
│       │   │   ├── guards/
│       │   │   ├── decorators/
│       │   │   ├── filters/          # Exception filters
│       │   │   └── interceptors/
│       │   └── config/               # ConfigModule, env validation
│       └── test/
│
├── packages/
│   ├── game-core/                  # Lógica do jogo — framework-agnostic
│   │   ├── src/
│   │   │   ├── engine/             # Loop de jogo, física básica
│   │   │   ├── levels/             # Definições de fases (dados + tipos)
│   │   │   ├── scoring/            # Cálculo de pontuação
│   │   │   └── types/              # Tipos compartilhados
│   │   └── __tests__/
│   │
│   ├── ui/                         # Design system compartilhado (se necessário)
│   │
│   ├── database/                   # Prisma schema + migrações
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── src/
│   │       └── client.ts           # Prisma client singleton
│   │
│   ├── eslint-config/              # Config ESLint compartilhada
│   ├── typescript-config/          # tsconfig base
│   └── prettier-config/            # Prettier compartilhado
│
├── docker/
│   ├── docker-compose.yml          # Orquestração local completa
│   ├── docker-compose.dev.yml      # Override para dev (hot reload)
│   ├── Dockerfile.web
│   ├── Dockerfile.api
│   └── postgres/
│       └── init.sql
│
├── docs/                           # Esta pasta
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── turbo.json
├── pnpm-workspace.yaml
├── package.json                    # Root: scripts globais + devDependencies compartilhadas
├── .env.example
└── .gitignore
```

---

## Convenções de Nomenclatura

| Artefato | Padrão |
|---|---|
| Componentes React | `PascalCase.tsx` |
| Hooks | `useXxx.ts` |
| Stores Zustand | `useXxxStore.ts` |
| Serviços NestJS | `xxx.service.ts` |
| DTOs | `create-xxx.dto.ts`, `update-xxx.dto.ts` |
| Schemas Mongoose | `xxx.schema.ts` |
| Arquivos de teste | `xxx.spec.ts` (unit) / `xxx.e2e-spec.ts` (e2e) |
| Variáveis de ambiente | `SCREAMING_SNAKE_CASE` |

---

## `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

## `turbo.json` (rascunho)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "lint": {},
    "type-check": {
      "dependsOn": ["^build"]
    }
  }
}
```

---

## Pacote `game-core` — por que separar?

Este pacote contém a lógica pura do jogo:
- Sem dependências de browser, React ou Three.js
- Testável de forma isolada com Jest puro
- Pode ser usado tanto pelo frontend (execução) quanto pelo backend (validação server-side de resultados)
- Evita que um jogador faça requests fraudulentos de "completei a fase com 100%"

Exemplo de responsabilidades:
```
game-core/src/scoring/
  calculateScore(events: GameEvent[], levelConfig: LevelConfig): Score

game-core/src/levels/
  levelDefinitions: Record<string, LevelConfig>
  validateLevelCompletion(result: LevelResult, config: LevelConfig): boolean
```
