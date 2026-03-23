# 08 — CI/CD e Deploy

## Estratégia de Branches

| Branch      | Propósito            | Deploy automático         |
| ----------- | -------------------- | ------------------------- |
| `main`      | Produção             | ✅ → Produção             |
| `develop`   | Integração contínua  | ✅ → Preview/Staging      |
| `feature/*` | Features individuais | ✅ → Preview URL (Vercel) |
| `fix/*`     | Bugfixes             | ✅ → Preview URL          |

---

## GitHub Actions

### `ci.yml` — roda em todo pull request

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo lint type-check

  test-game-core:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter game-core test --coverage

  test-api:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: tracktoy
          POSTGRES_PASSWORD: tracktoy_test
          POSTGRES_DB: tracktoy_test
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      mongo:
        image: mongo:7
        ports: ["27017:27017"]
    env:
      DATABASE_URL: postgresql://tracktoy:tracktoy_test@localhost:5432/tracktoy_test
      MONGODB_URI: mongodb://localhost:27017/tracktoy_test
      JWT_SECRET: test-secret
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter api run db:migrate # prisma migrate deploy
      - run: pnpm --filter api test --coverage

  test-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter web test --coverage

  e2e:
    runs-on: ubuntu-latest
    needs: [test-api, test-web] # só roda após unit tests passarem
    services:
      # mesmos services do test-api
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm --filter web build
      - run: pnpm --filter api build
      - run: pnpm e2e # roda playwright
        env:
          # variáveis de ambiente de teste
```

---

## Deploy

### Opção A: Vercel (web) + Railway (api, postgres, mongo)

**Menor custo de setup, ideal para portfólio:**

| Serviço              | Plataforma    | Tier gratuito           |
| -------------------- | ------------- | ----------------------- |
| `apps/web` (Next.js) | Vercel        | ✅ Hobby gratuito       |
| `apps/api` (NestJS)  | Railway       | ✅ $5/mês               |
| PostgreSQL           | Railway       | ✅ incluso              |
| MongoDB              | MongoDB Atlas | ✅ 512MB gratuito       |
| Redis                | Upstash       | ✅ 10k req/dia gratuito |

**Vantagens:** Deploy automático no push, zero config de infraestrutura, SSL automático.

### Opção B: VPS (Hetzner / DigitalOcean) com Docker

Para o estudo de infra/DevOps:

- Um VPS com Docker Compose
- Nginx como reverse proxy
- Certbot para SSL
- GitHub Actions faz deploy via SSH

### Recomendação para portfólio

**Comece com Opção A** (Railway + Vercel). É o menor tempo até ter algo online e funcionando. Se quiser estudar o lado de infra, adicione a Opção B depois.

---

## `deploy.yml` (para Railway + Vercel)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Railway
        uses: berviantoleo/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: tracktoy-api

  # Vercel faz o deploy do web automaticamente no push para main
  # via integração nativa com o repositório GitHub
```

---

## Variáveis de Ambiente em Produção

**Nunca commitar segredos.** Usar:

- **Vercel**: Dashboard → Settings → Environment Variables
- **Railway**: Dashboard → Variables
- **GitHub Actions**: Settings → Secrets and variables → Actions

Variáveis necessárias em produção:

```
DATABASE_URL              (Railway injetado automaticamente)
MONGODB_URI               (MongoDB Atlas connection string)
REDIS_URL                 (Upstash)
JWT_SECRET                (gerar: openssl rand -base64 32)
NEXTAUTH_SECRET           (gerar: openssl rand -base64 32)
NEXTAUTH_URL              (URL de produção do Vercel)
NEXT_PUBLIC_API_URL       (URL de produção do Railway)
GOOGLE_CLIENT_ID          (opcional, se usar OAuth Google)
GOOGLE_CLIENT_SECRET
```

---

## Migrations em Produção

Prisma migrations rodam como parte do deploy do NestJS:

```json
// apps/api/package.json
{
  "scripts": {
    "build": "nest build",
    "start:prod": "node dist/main",
    "db:migrate": "prisma migrate deploy",
    "prestart:prod": "prisma migrate deploy" // roda antes de subir o servidor
  }
}
```
