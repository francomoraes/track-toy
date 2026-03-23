# 02 — Estrutura do Monorepo

## Direcao atual

Para o MVP, a estrutura foi simplificada para ser facil de explicar e sustentar:

- `package.json` na raiz, com scripts e tooling compartilhado
- `frontend/package.json`, com o app Next.js
- logica de jogo em `frontend/src/game-core`

Nao existe pacote separado para game-core nesta fase. Se no futuro houver necessidade real de compartilhamento com backend, essa extracao pode ser feita sem quebrar o frontend.

## Estrutura de Pastas

```
track-toy/
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── eslint.config.mjs
│   ├── next.config.ts
│   ├── postcss.config.mjs
│   ├── next-env.d.ts
│   └── src/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── globals.css
│       ├── components/
│       │   ├── game/
│       │   └── ui/
│       ├── game-core/
│       │   ├── types/
│       │   ├── mechanisms/
│       │   ├── rules/
│       │   ├── phases/
│       │   └── index.ts
│       ├── services/
│       │   ├── storage/
│       │   └── api/
│       └── store/
│
├── backend/                       # reservado para Bloco B (futuro)
├── .docs/
├── .husky/
├── eslint.config.mjs              # Config compartilhada na raiz
├── prettier.config.mjs            # Config compartilhada na raiz
├── tsconfig.base.json             # Base compartilhada
├── tsconfig.nextjs.json           # Preset para o frontend
├── tsconfig.library.json          # Preset para bibliotecas
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── .gitignore
```

## Convencoes de organizacao

- Monorepo continua existindo, mas com estrutura orientada por produto (`frontend` / `backend`).
- Regras de jogo ficam em `frontend/src/game-core`.
- Integracoes externas (API, storage, auth) ficam em `frontend/src/services`.
- UI e renderizacao ficam em `frontend/src/components`.
- Extrair pacote compartilhado so quando existir necessidade real comprovada.

## Convencoes de Nomenclatura

| Artefato              | Padrao                                         |
| --------------------- | ---------------------------------------------- |
| Componentes React     | `PascalCase.tsx`                               |
| Hooks                 | `useXxx.ts`                                    |
| Stores Zustand        | `useXxxStore.ts`                               |
| Servicos NestJS       | `xxx.service.ts`                               |
| DTOs                  | `create-xxx.dto.ts`, `update-xxx.dto.ts`       |
| Schemas Mongoose      | `xxx.schema.ts`                                |
| Arquivos de teste     | `xxx.spec.ts` (unit) / `xxx.e2e-spec.ts` (e2e) |
| Variaveis de ambiente | `SCREAMING_SNAKE_CASE`                         |

## `pnpm-workspace.yaml`

```yaml
packages:
  - 'frontend'
```

## `game-core` — por que manter dentro do frontend agora?

- Mantem a explicacao simples para o MVP
- Evita custo estrutural prematuro
- Permite TDD de logica pura sem browser, React ou Three.js
- Facilita migracao futura para pacote compartilhado, se necessario

Exemplo de responsabilidades:

```
frontend/src/game-core/mechanisms/elevator/
  applyElevatorStep(state: ElevatorState, input: HoldInput): ElevatorState

frontend/src/game-core/phases/phase-01-elevator.ts
  createPhase01(): PhaseDefinition
  validatePhase01Completion(state: Phase01State): boolean
```
