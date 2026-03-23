# 01 — Arquitetura e Stack

## Decisão: Monorepo com Turborepo

**Por quê Turborepo e não Nx?**

- Turborepo é mais simples de configurar e tem menos opinião sobre estrutura
- Build cache nativo e pipeline de tasks declarativo (`turbo.json`)
- Integração natural com pnpm workspaces (recomendado) ou npm workspaces
- Nx faz mais sentido em projetos enterprise com muitos times; aqui é overkill

**Alternativa descartada:** repositórios separados

- Inviabiliza compartilhar tipos, lógica de jogo e config entre frontend e backend
- Overhead de sincronização de versões entre pacotes

---

## Decisão: Next.js para o Frontend

Next.js (App Router, v14+) cobre:

- SSR/SSG para páginas de marketing, ranking público, SEO
- API Routes para endpoints simples (proxy, metadados de fase, etc.)
- React Server Components onde não há interatividade

**O Next.js substitui o backend?**
Não completamente. Ver próxima seção.

---

## Decisão: NestJS para o Backend

**Por que não fazer tudo dentro do Next.js?**

| Critério                         | Next.js API Routes         | NestJS                |
| -------------------------------- | -------------------------- | --------------------- |
| CRUD simples                     | ✅ Suficiente              | Overkill              |
| WebSockets (multiplayer futuro)  | ❌ Não suporta nativamente | ✅                    |
| Injeção de dependências / DI     | ❌ Manual                  | ✅ Nativo             |
| Módulos e separação de domínios  | ❌ Arquivo por arquivo     | ✅ Módulos            |
| Jobs assíncronos (BullMQ)        | ❌                         | ✅                    |
| Testabilidade (unit/integration) | Médio                      | ✅ Excelente com Jest |

**Conclusão:** Next.js para frontend + API Routes para coisas triviais. NestJS para lógica de domínio, auth, game progress, ranking.

---

## Decisão: Bancos de Dados Mistos

### PostgreSQL — para dados relacionais

- Usuários, sessões, autenticação
- Relações claras e ACID necessárias
- ORM: **Prisma** (type-safety excelente, migrations limpas, gera tipos TS)

### MongoDB — para dados de jogo

- Progresso por fase (documento flexível, schema pode evoluir)
- Configuração de fases (JSON semi-estruturado)
- Replay / histórico de partidas (log de eventos)
- ODM: **Mongoose** com decorators no NestJS (`@nestjs/mongoose`)

**Por que essa divisão faz sentido?**

- Dados de usuário são relacionais por natureza (tem FK, constraints, joins de auth)
- Dados de jogo são documentos: cada fase tem estrutura diferente, dados de replay são arrays variáveis, é natural num document store

---

## Decisão: Biblioteca 3D — React Three Fiber

**Por que React Three Fiber (R3F) e não Three.js puro?**

- R3F permite escrever a cena 3D como JSX declarativo, integrando com o ciclo de vida React
- Estado da cena reage a state/props como qualquer componente
- Ecossistema **@react-three/drei** fornece helpers prontos: OrbitControls, useGLTF, Text3D, etc.
- **@react-three/rapier** para física (colisões, gravidade) com Rapier WASM

**Alternativas descartadas:**

- `Babylon.js`: excelente, mas o wrapper React é menos maduro
- `PlayCanvas`: engine completa, mas foge do objetivo de estudar R3F
- Three.js puro sem R3F: muito boilerplate, gerenciamento de lifecycle manual

---

## Stack Completa

### Frontend (`frontend`)

| Tecnologia            | Versão-alvo | Motivo                                 |
| --------------------- | ----------- | -------------------------------------- |
| Next.js               | 15          | App Router, RSC, SSR                   |
| React                 | 19          | Concurrent features                    |
| React Three Fiber     | 8           | Cena 3D declarativa                    |
| @react-three/drei     | latest      | Helpers 3D                             |
| @react-three/rapier   | latest      | Física                                 |
| Zustand               | 5           | Estado do jogo (leve, sem boilerplate) |
| TailwindCSS           | 4           | Estilo rápido e consistente            |
| Framer Motion         | latest      | Animações de UI (fora da cena 3D)      |
| React Hook Form + Zod | latest      | Formulários e validação                |

### Backend (`apps/api`)

| Tecnologia                          | Versão-alvo | Motivo                                      |
| ----------------------------------- | ----------- | ------------------------------------------- |
| NestJS                              | 10          | Framework modular, DI, decorators           |
| Fastify adapter                     | —           | Performance superior ao Express             |
| Prisma                              | 5           | ORM com type-safety para PostgreSQL         |
| Mongoose                            | 8           | ODM para MongoDB                            |
| Passport + JWT                      | —           | Auth strategy                               |
| BullMQ                              | —           | Filas (ranking async, notificações futuras) |
| class-validator + class-transformer | —           | Validação de DTOs                           |

### Infra e Dev

| Tecnologia              | Motivo                                         |
| ----------------------- | ---------------------------------------------- |
| pnpm + workspaces       | Gerenciador de pacotes eficiente para monorepo |
| Turborepo               | Orquestração de builds e tasks                 |
| Docker + Docker Compose | Isolamento do ambiente local                   |
| GitHub Actions          | CI/CD                                          |
| ESLint + Prettier       | Linting e formatação consistente               |
| Husky + lint-staged     | Pre-commit hooks                               |
| Commitlint              | Commits convencionais                          |

### Auth

- **NextAuth.js (Auth.js v5)** no frontend para sessão/cookie
- **JWT** no NestJS para validação de requests autenticados
- Fluxo: NextAuth emite JWT → Next.js passa JWT no header → NestJS valida

---

## Diagrama de Alto Nível

```
Browser
  │
  ▼
┌─────────────────────────────┐
│  Next.js (frontend)         │
│  ├─ Pages / App Router      │
│  ├─ React Three Fiber (3D)  │
│  ├─ API Routes (proxy/meta) │
│  └─ NextAuth (sessão)       │
└────────────┬────────────────┘
             │ HTTP / fetch (JWT)
             ▼
┌────────────────────────────────┐
│  NestJS (apps/api)             │
│  ├─ Auth Module (JWT/Passport) │
│  ├─ Users Module (Prisma/PG)   │
│  ├─ Game Module (Mongoose/MDB) │
│  ├─ Ranking Module             │
│  └─ Levels Module              │
└──────┬─────────────┬───────────┘
       │             │
       ▼             ▼
  PostgreSQL      MongoDB
  (usuários,      (progresso,
   sessões)        fases, replay)
```
