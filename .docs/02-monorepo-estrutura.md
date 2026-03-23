# 02 — Estrutura do Monorepo

## Direcao atual

Para o MVP, a estrutura foi simplificada para manter apenas tres `package.json`:

- `package.json` na raiz, com scripts e tooling compartilhado
- `apps/web/package.json`, com o app Next.js
- `packages/game-core/package.json`, com a logica pura do jogo

Configuracoes compartilhadas de TypeScript, ESLint e Prettier ficam na raiz. Isso reduz atrito no inicio e evita criar pacotes de infraestrutura antes de existir necessidade real.

## Estrutura de Pastas

```
track-toy/
├── apps/
│   └── web/
│       ├── package.json
│       ├── tsconfig.json
│       ├── eslint.config.mjs
│       ├── next.config.ts
│       ├── postcss.config.mjs
│       ├── next-env.d.ts
│       └── src/
│           ├── app/
│           │   ├── layout.tsx
│           │   ├── page.tsx
│           │   └── globals.css
│           ├── features/           # Fatias verticais por fluxo do jogo
│           │   ├── onboarding/
│           │   ├── phase-selection/
│           │   ├── phase-runtime/
│           │   ├── hud/
│           │   └── progression/
│           ├── entities/           # Modelos visuais e adaptadores de UI
│           │   ├── car/
│           │   ├── mechanism/
│           │   └── phase/
│           └── shared/
│               ├── ui/
│               ├── hooks/
│               └── lib/
│
├── packages/
│   └── game-core/
│       ├── package.json
│       ├── tsconfig.json
│       ├── jest.config.js
│       └── src/
│           ├── phases/             # Regras especificas de cada fase
│           │   ├── phase-01-elevator/
│           │   ├── phase-02-drawbridge/
│           │   └── phase-03-mini-cycle/
│           ├── mechanisms/         # Comportamentos mecanicos reutilizaveis
│           │   ├── elevator/
│           │   ├── drawbridge/
│           │   ├── conveyor/
│           │   └── magnet/
│           ├── entities/
│           │   └── car/
│           └── rules/
│               └── progression/
│
├── .docs/
├── .husky/
├── eslint.config.mjs               # Config compartilhada na raiz
├── prettier.config.mjs             # Config compartilhada na raiz
├── tsconfig.base.json              # Base compartilhada
├── tsconfig.nextjs.json            # Preset para o app web
├── tsconfig.library.json           # Preset para bibliotecas
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── .gitignore
```

---

## Convencoes de organizacao

- O monorepo continua existindo, mas so com os pacotes que carregam codigo de produto.
- O crescimento inicial deve seguir vertical slicing, nao pastas horizontais genericas.
- Qualquer extracao de novo pacote precisa ser justificada por reuso real ou isolamento tecnico claro.

## Convencoes de Nomenclatura

| Artefato              | Padrão                                         |
| --------------------- | ---------------------------------------------- |
| Componentes React     | `PascalCase.tsx`                               |
| Hooks                 | `useXxx.ts`                                    |
| Stores Zustand        | `useXxxStore.ts`                               |
| Serviços NestJS       | `xxx.service.ts`                               |
| DTOs                  | `create-xxx.dto.ts`, `update-xxx.dto.ts`       |
| Schemas Mongoose      | `xxx.schema.ts`                                |
| Arquivos de teste     | `xxx.spec.ts` (unit) / `xxx.e2e-spec.ts` (e2e) |
| Variáveis de ambiente | `SCREAMING_SNAKE_CASE`                         |

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

## `game-core` — por que separar?

Este pacote contem a logica pura do jogo:

- Sem dependências de browser, React ou Three.js
- Testável de forma isolada com Jest puro
- Pode ser usado tanto pelo frontend (execução) quanto pelo backend (validação server-side de resultados)
- Evita que um jogador faça requests fraudulentos de "completei a fase com 100%"

Exemplo de responsabilidades:

```
game-core/src/mechanisms/elevator/
  applyElevatorStep(state: ElevatorState, input: HoldInput): ElevatorState

game-core/src/phases/phase-01-elevator/
  createPhase01(): PhaseDefinition
  validatePhase01Completion(state: Phase01State): boolean
```
