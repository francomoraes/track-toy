# 09 — Roadmap de Desenvolvimento

## Estratégia geral

**MVP-first:** construir o jogo funcionando no browser com localStorage antes de qualquer backend ou infra.
Isso permite liberar portfólio o quanto antes e validar a experiência real do jogo antes de investir em auth, banco e deploy.

```
Bloco A — MVP local (portfólio)
  Fase 0 → Fase 1 → Fase 2 → Fase 3 → Fase 4 (deploy estático)

Bloco B — Versão autenticada (pós-MVP)
  Fase 5 → Fase 6 → Fase 7 → Fase 8
```

---

## Bloco A — MVP Local (portfólio funcional sem backend)

### Fase 0 — Isolamento e Governança

**Objetivo:** Ferramentas e ambiente configurados antes de qualquer linha de produto.

- [x] Criar repositório no GitHub
- [x] Configurar `.gitignore` inicial (node_modules, .env, dist, .next)
- [x] Configurar Husky + Commitlint (commits convencionais desde o início)
- [ ] Criar branch strategy (main, develop)
- [ ] Instalar Docker Desktop (para fases futuras — bancos ficam inativos por ora)

**Entrega:** Repositório criado, hooks de qualidade rodando, branch strategy definida.

---

### Fase 1 — Scaffold do Monorepo

**Objetivo:** Estrutura mínima compilando, com apenas os pacotes necessários para o MVP local.

- [ ] Inicializar pnpm workspaces + Turborepo
- [ ] Criar `packages/typescript-config` com tsconfig base
- [ ] Criar `packages/eslint-config` com regras compartilhadas
- [ ] Criar `packages/prettier-config`
- [ ] Scaffold `packages/game-core` (Jest configurado, sem lógica ainda)
- [ ] Scaffold `apps/web` com Next.js 15 (App Router, Tailwind, `pnpm dev` funciona)
- [ ] Configurar Turbo pipeline (`build`, `dev`, `test`, `lint`)

> `packages/database` e `apps/api` ficam para o Bloco B.

**Entrega:** `pnpm dev` sobe o Next.js, ESLint passando, Jest configurado.

---

### Fase 2 — Game Core (lógica pura com TDD)

**Objetivo:** Toda a lógica de jogo sem dependência de browser, React ou Three.js.

- [ ] Definir e fechar os tipos TypeScript: `LevelConfig`, `MechanismConfig`, `CommandBinding`, `GameEvent`, `Score`
- [ ] Implementar máquina de estados de cada mecanismo com TDD:
  - [ ] `ElevatorPlatform`: raise / lower, trava por altura
  - [ ] `RotaryPlatform`: rotação 0/90/180/270, trava de alinhamento
  - [ ] `Drawbridge`: toggle aberta/fechada
  - [ ] `CraneLift`: raise / lower
- [ ] Implementar `evaluateCarFlow(mechanismStates, trackLayout)` — decide se o carrinho pode avançar
- [ ] Implementar `calculateScore(events, config)` — computa estrelas, tempo, erros
- [ ] Escrever definições das 3 fases do MVP (mundo 1: plataforma, ponte, mini-ciclo)
- [ ] Cobertura de testes: >90% no `game-core`

> `ConveyorRamp` e `HelicopterMagnet` (mecanismos de sincronização) ficam para o Bloco A fase 3 apenas se o MVP incluir mundo 2. Caso contrário, ficam para o Bloco B.

**Entrega:** `pnpm test --filter game-core` passa com alta cobertura.

---

### Fase 3 — Jogo 3D (MVP jogável)

**Objetivo:** As 3 primeiras fases jogáveis no browser, salvas em localStorage.

#### Setup técnico
- [ ] Instalar React Three Fiber + Drei + Rapier no `apps/web`
- [ ] Instalar Zustand
- [ ] Configurar lazy loading da cena 3D (não bloquear SSR do Next.js)

#### Cena 3D
- [ ] Componente `<GameScene>` com `<Canvas>` + física básica
- [ ] Componente `<Car>` com movimento por gravidade simulado
- [ ] Componente `<ElevatorPlatform>` — animação de subida/descida
- [ ] Componente `<RotaryPlatform>` — animação de rotação
- [ ] Componente `<Drawbridge>` — animação de abertura
- [ ] Componente `<CraneLift>` — animação de elevação
- [ ] Câmera isométrica com follow suave no carro
- [ ] Iluminação básica (ambient + directional)

#### Estado e lógica
- [ ] Zustand store: `useGameStore` (ver tipos em 05-game-design.md)
- [ ] Hook `useGameStorage` (localStorage apenas, por ora)
- [ ] Hook `useMechanismController` — conecta comandos do painel ao store

#### Interface (HUD)
- [ ] `<CommandPanel>` — painel lateral direito com 6 slots
  - Mostrar apenas os controles ativos na fase atual
  - Atalhos de teclado 1–6
- [ ] `<StageStatus>` — ciclos, erros, timer (opcional por fase)
- [ ] `<ObjectivePanel>` — objetivo da fase em linguagem simples
- [ ] `<FeedbackLog>` — mensagens de feedback (acertou, errou, bloqueado)

#### Telas
- [ ] Tela inicial: cena 3D de fundo em loop + botões Jogar / Selecionar Fase / Como Funciona
- [ ] Mapa de fases: grid com status (bloqueada, disponível, completa + estrelas)
- [ ] Tela pré-fase: objetivo + destaque do primeiro mecanismo
- [ ] Tela de conclusão: estrelas + tempo + erros + "o que você aprendeu" + ações
- [ ] Tela de falha: motivo + retry

#### Dados
- [ ] `useGameStorage` salva progresso em `localStorage` (estrelas, melhor tempo, tentativas por fase)

**Entrega:** É possível abrir o browser, jogar as 3 fases e ver progresso salvo.

---

### Fase 4 — Polimento MVP + Deploy estático

**Objetivo:** Jogo apresentável para portfólio, online e acessível.

- [ ] Assets 3D do Kenney.nl integrados (carrinho, pistas, mecanismos base)
- [ ] Feedback visual: highlight de mecanismo ativo, seta indicando bloqueio
- [ ] Feedback sonoro: cliques, engrenagem, conclusão de fase (Howler.js)
- [ ] Responsividade mobile: painel inferior + gesto de toque
- [ ] Loading states e error boundaries na cena 3D
- [ ] Acessibilidade básica: ARIA nos controles do painel, teclado navegável
- [ ] Testes E2E Playwright: fluxo completo das 3 fases no modo local
- [ ] Deploy no Vercel (export estático ou SSR simples)
- [ ] README de portfólio: screenshots, GIF de gameplay, stack, instruções de setup

**Entrega:** Link público funcionando. Portfólio liberado.

---

## Bloco B — Versão Autenticada (pós-portfólio)

> Este bloco começa depois que o MVP está online e validado.

### Fase 5 — Scaffold Backend + Auth

**Objetivo:** NestJS + bancos + fluxo de login funcionando.

- [ ] Docker Compose com PostgreSQL, MongoDB, Redis
- [ ] Scaffold `packages/database` (Prisma schema + migrations)
- [ ] Scaffold `apps/api` com NestJS (Fastify adapter)
- [ ] `UsersModule` + `AuthModule` (JWT + Passport)
- [ ] Next.js: NextAuth (Auth.js v5) integrado com NestJS
- [ ] Telas de Login e Cadastro no frontend
- [ ] Testes: unit tests de `AuthService`, integration test de login

**Entrega:** Usuário consegue criar conta, fazer login.

---

### Fase 6 — Sincronização de Progresso

**Objetivo:** Progresso salvo na nuvem para usuários autenticados.

- [ ] NestJS: `GameModule` com endpoints de sessão e progresso
- [ ] Validação server-side de score com `game-core` (anti-cheat)
- [ ] `useGameStorage` alternando entre localStorage e API conforme auth
- [ ] Migração de progresso local ao fazer login pela primeira vez
- [ ] Dashboard: progresso do usuário em todas as fases
- [ ] Testes: E2E do fluxo autenticado completo

**Entrega:** Usuário logado tem progresso sincronizado entre dispositivos.

---

### Fase 7 — Conteúdo e Ranking

**Objetivo:** Mais conteúdo e camada social mínima.

- [ ] Mundos 2 e 3 (fases 6-15 conforme GDD)
- [ ] Mecanismos avançados: `ConveyorRamp`, `HelicopterMagnet`
- [ ] `RankingModule` no NestJS (ranking global + ranking por fase)
- [ ] Tela de ranking no frontend
- [ ] BullMQ: atualização de ranking assíncrona

---

### Fase 8 — Otimização + CI/CD completo

**Objetivo:** Pipeline automatizado, performance e monitoramento.

- [ ] GitHub Actions: CI completo (lint + test + build)
- [ ] GitHub Actions: deploy automático (Vercel + Railway)
- [ ] Bundle analysis (`@next/bundle-analyzer`)
- [ ] Code splitting da cena 3D por fase
- [ ] Otimização de modelos GLTF (Draco compression)
- [ ] Cache Redis para level configs e ranking
- [ ] Lighthouse audit
- [ ] Sentry para monitoramento de erros em produção

---

## Resumo

| Fase | Bloco | Foco |
|---|---|---|
| 0 | A | Ferramentas e governança |
| 1 | A | Scaffold monorepo (sem backend) |
| 2 | A | Game Core com TDD |
| 3 | A | Jogo 3D jogável + localStorage |
| 4 | A | Polimento + deploy portfólio |
| 5 | B | Backend + auth |
| 6 | B | Sync de progresso autenticado |
| 7 | B | Conteúdo + ranking |
| 8 | B | Otimização + CI/CD |

**Checkpoint de portfólio:** entre Fase 4 e Fase 5.
