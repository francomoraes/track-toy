# 09 — Roadmap de Desenvolvimento

## Fase 0 — Isolamento e Governança (Semana 1)

**Objetivo:** Ambiente de dev funcional e isolado antes de escrever qualquer código de produto.

- [ ] Criar repositório no GitHub
- [ ] Configurar `.gitignore` inicial
- [ ] Instalar Docker Desktop e validar funcionamento
- [ ] Criar `docker/docker-compose.dev.yml` com PostgreSQL, MongoDB, Redis
- [ ] Validar que os 3 bancos sobem e aceitam conexão
- [ ] Criar `.env.example` e `.env.local`
- [ ] Configurar Husky + Commitlint (commits convencionais desde o início)
- [ ] Criar branch strategy (main, develop)

**Entrega:** `docker compose up` sobe os bancos. README com instruções de setup.

---

## Fase 1 — Fundação: Scaffold do Monorepo (Semana 1-2)

**Objetivo:** Estrutura do projeto com todas as dependências instaladas e compilando.

- [ ] Inicializar pnpm workspaces + Turborepo
- [ ] Criar `packages/typescript-config` com tsconfig base
- [ ] Criar `packages/eslint-config` com regras compartilhadas
- [ ] Criar `packages/prettier-config`
- [ ] Scaffold `packages/game-core` (Jest configurado, sem lógica ainda)
- [ ] Scaffold `packages/database` (Prisma schema inicial, client)
- [ ] Scaffold `apps/api` com NestJS (Fastify, módulos vazios, `pnpm start:dev` funciona)
- [ ] Scaffold `apps/web` com Next.js 15 (App Router, Tailwind, `pnpm dev` funciona)
- [ ] Configurar Turbo pipeline (`build`, `dev`, `test`, `lint`)
- [ ] `pnpm dev` na raiz sobe web + api simultaneamente

**Entrega:** Monorepo compilando, ESLint passando, testes vazios passando.

---

## Fase 2 — Auth e Usuários (Semana 2-3)

**Objetivo:** Fluxo completo de registro/login funcionando.

- [ ] Prisma schema para User, Account, Session, GameProfile
- [ ] Rodar primeira migration (`prisma migrate dev`)
- [ ] NestJS: `UsersModule` com CRUD básico (Prisma)
- [ ] NestJS: `AuthModule` com JWT strategy (Passport)
- [ ] NestJS: endpoint `POST /auth/register` e `POST /auth/login` com testes
- [ ] Next.js: configurar NextAuth (Auth.js v5) com provider Email
- [ ] Next.js: telas de Login e Cadastro
- [ ] Next.js: middleware de proteção de rotas autenticadas
- [ ] Testes: unit tests em `AuthService`, `UsersService`
- [ ] Testes: integration test do fluxo de login (Supertest)

**Entrega:** Usuário consegue criar conta, fazer login, ver 401 em rotas protegidas.

---

## Fase 3 — Game Core e Lógica de Jogo (Semana 3-4)

**Objetivo:** Toda a lógica de jogo testada e isolada no `game-core`.

- [ ] Definir tipos TypeScript completos (LevelConfig, GameEvent, Score, etc.)
- [ ] Implementar `calculateScore()` com TDD
- [ ] Implementar `validateLevelCompletion()` com TDD
- [ ] Criar definições das primeiras 5 fases (Mundo 1 — Cores)
- [ ] NestJS: `LevelsModule` (serve configs de fases do MongoDB)
- [ ] NestJS: `GameModule` com `GameService` (salva sessões, valida score server-side)
- [ ] Testes: cobertura >90% em `game-core`
- [ ] Testes: unit tests do `GameService` com mocks de Mongoose

**Entrega:** API `/levels` e `/game/sessions` funcionando com testes.

---

## Fase 4 — Jogo 3D (MVP) (Semana 4-7)

**Objetivo:** Jogo jogável no browser, mesmo que simples.

- [ ] Setup React Three Fiber + Drei + Rapier no Next.js
- [ ] Componente `<GameScene>` básico com Canvas
- [ ] Componente `<Track>` que gera pista a partir do LevelConfig
- [ ] Componente `<Car>` com animação de movimento
- [ ] Implementar game loop (Zustand store)
- [ ] Implementar bifurcações com modal de pergunta
- [ ] HUD: score, timer, vidas
- [ ] Tela de Level Complete (estrelas)
- [ ] Tela de Menu de Fases (seletor)
- [ ] Modo aberto: salvar progresso no localStorage
- [ ] Testes: hooks do jogo (useGameState, useGameStorage)
- [ ] Testes: E2E do fluxo de jogar fase no modo aberto

**Entrega:** É possível jogar a fase 1 no browser sem login.

---

## Fase 5 — Integração Auth + Jogo (Semana 7-8)

**Objetivo:** Modo autenticado funcionando end-to-end.

- [ ] Implementar `useGameStorage` que alterna entre localStorage e API
- [ ] Frontend: ao completar fase → chamar NestJS `/game/sessions`
- [ ] Frontend: tela de Dashboard com progresso do usuário
- [ ] Frontend: tela de Perfil
- [ ] NestJS: `RankingModule` com ranking global
- [ ] Frontend: tela de Ranking
- [ ] Testes: E2E do fluxo completo autenticado
- [ ] Testes: sincronização localStorage → nuvem ao fazer login

**Entrega:** Usuário logado tem progresso salvo e sincronizado.

---

## Fase 6 — Conteúdo e Polimento (Semana 8-10)

**Objetivo:** Jogo com conteúdo suficiente para portfólio.

- [ ] Implementar Mundos 2 (Números) e 3 (Formas)
- [ ] Assets 3D: pesquisar e integrar modelos do Kenney.nl
- [ ] Efeitos de partículas (conclusão de fase, coleta de item)
- [ ] Música e efeitos sonoros (Web Audio API ou Howler.js)
- [ ] Responsividade mobile + controles touch
- [ ] Tela de landing page (marketing)
- [ ] Loading states e error boundaries
- [ ] Acessibilidade básica (ARIA, teclado)

---

## Fase 7 — Otimização (Semana 10-11)

**Objetivo:** Identificar e corrigir gargalos.

- [ ] Analisar bundle size (`@next/bundle-analyzer`)
- [ ] Code splitting das cenas 3D (lazy load por fase)
- [ ] Otimizar modelos GLTF (Draco compression)
- [ ] Queries lentas no banco (EXPLAIN ANALYZE no Postgres)
- [ ] Implementar cache Redis para ranking e level configs
- [ ] BullMQ: processar atualização de ranking de forma assíncrona
- [ ] Lighthouse audit (Performance, Accessibility)

---

## Fase 8 — Deploy e CI/CD (Semana 11-12)

**Objetivo:** Projeto online, estável e com pipeline automatizado.

- [ ] Configurar Railway (API + PostgreSQL)
- [ ] Configurar MongoDB Atlas (cluster free tier)
- [ ] Configurar Upstash (Redis)
- [ ] Configurar Vercel (web)
- [ ] GitHub Actions: CI pipeline completo
- [ ] GitHub Actions: deploy automático para produção
- [ ] Configurar domínio customizado (opcional)
- [ ] Monitoramento básico (Sentry ou similar)
- [ ] README completo com: setup, arquitetura, features, screenshots

---

## Estimativa Total

| Fase | Duração estimada |
|---|---|
| 0 — Isolamento | 3-4 dias |
| 1 — Scaffold | 4-5 dias |
| 2 — Auth | 5-7 dias |
| 3 — Game Core | 5-7 dias |
| 4 — Jogo 3D MVP | 10-15 dias |
| 5 — Integração | 5-7 dias |
| 6 — Conteúdo | 7-10 dias |
| 7 — Otimização | 4-5 dias |
| 8 — Deploy | 3-4 dias |
| **Total** | **~46-64 dias úteis** |

**Nota:** Estimativas são para trabalho parcial (algumas horas por dia). O cronograma real depende da disponibilidade e da curva de aprendizado com tecnologias novas.

---

## Por onde começar AGORA

1. Criar o repositório no GitHub
2. Inicializar o monorepo com pnpm + Turborepo
3. Subir os bancos com Docker

Ou seja: **Fase 0 e Fase 1 em paralelo**, focando primeiro no scaffold básico que permita escrever os primeiros testes.

O próximo passo concreto é criar o `package.json` raiz e o `pnpm-workspace.yaml`.
