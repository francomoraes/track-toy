# 07 — Docker e Ambiente Local

## Objetivo

Isolar completamente o ambiente de desenvolvimento. Se algo quebrar nos bancos, configs ou dependências, o estrago fica dentro dos containers.

---

## Serviços no Docker Compose

```
docker-compose.yml
├── postgres   — banco relacional (usuários, auth)
├── mongo      — banco de jogo
├── redis      — cache e filas (BullMQ)
├── api        — NestJS (hot reload com volume montado)
├── web        — Next.js (hot reload com volume montado)
└── mongo-express  — (opcional) UI para inspecionar MongoDB em dev
```

---

## `docker/docker-compose.yml`

```yaml
version: "3.9"

services:
  postgres:
    image: postgres:16-alpine
    container_name: tracktoy-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-tracktoy}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-tracktoy_dev}
      POSTGRES_DB: ${POSTGRES_DB:-tracktoy}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U tracktoy"]
      interval: 10s
      timeout: 5s
      retries: 5

  mongo:
    image: mongo:7-jammy
    container_name: tracktoy-mongo
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER:-tracktoy}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD:-tracktoy_dev}
      MONGO_INITDB_DATABASE: tracktoy
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/tracktoy --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: tracktoy-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  mongo-express:
    image: mongo-express:latest
    container_name: tracktoy-mongo-ui
    restart: unless-stopped
    ports:
      - "8081:8081"
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: ${MONGO_USER:-tracktoy}
      ME_CONFIG_MONGODB_ADMINPASSWORD: ${MONGO_PASSWORD:-tracktoy_dev}
      ME_CONFIG_MONGODB_URL: mongodb://tracktoy:tracktoy_dev@mongo:27017/
      ME_CONFIG_BASICAUTH: false
    depends_on:
      mongo:
        condition: service_healthy
    profiles:
      - tools # só sobe com: docker compose --profile tools up

volumes:
  postgres_data:
  mongo_data:
  redis_data:

networks:
  default:
    name: tracktoy-network
```

---

## `docker/docker-compose.dev.yml` (override para desenvolvimento)

```yaml
# Sobe apenas os bancos + serviços de infra
# O app (web e api) roda fora do Docker para hot reload mais rápido
version: "3.9"

services:
  postgres:
    extends:
      file: docker-compose.yml
      service: postgres

  mongo:
    extends:
      file: docker-compose.yml
      service: mongo

  redis:
    extends:
      file: docker-compose.yml
      service: redis
```

**Recomendação para dev:** rodar apenas os bancos no Docker e o Next.js + NestJS fora do container. Hot reload é mais rápido sem a camada de volumes.

```bash
# Sobe apenas os bancos
docker compose -f docker/docker-compose.dev.yml up -d

# Roda o app localmente
pnpm dev
```

---

## Comandos Úteis

```bash
# Primeira vez: sobe tudo
docker compose -f docker/docker-compose.dev.yml up -d

# Verificar status
docker compose -f docker/docker-compose.dev.yml ps

# Logs de um serviço específico
docker compose -f docker/docker-compose.dev.yml logs -f postgres

# Parar tudo
docker compose -f docker/docker-compose.dev.yml down

# Destruir volumes (reset completo dos dados)
docker compose -f docker/docker-compose.dev.yml down -v

# Abrir shell no postgres
docker exec -it tracktoy-postgres psql -U tracktoy

# Abrir shell no mongo
docker exec -it tracktoy-mongo mongosh -u tracktoy -p tracktoy_dev
```

---

## `.env.local` para desenvolvimento

```env
# PostgreSQL (Docker local)
DATABASE_URL="postgresql://tracktoy:tracktoy_dev@localhost:5432/tracktoy"

# MongoDB (Docker local)
MONGODB_URI="mongodb://tracktoy:tracktoy_dev@localhost:27017/tracktoy?authSource=admin"

# Redis
REDIS_URL="redis://localhost:6379"

# NestJS
API_PORT=4000
JWT_SECRET="dev-secret-mude-em-producao"
JWT_EXPIRATION="7d"

# Next.js
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-nextauth-secret"
```

---

## `.env.example` (commitar no repo)

```env
DATABASE_URL=
MONGODB_URI=
REDIS_URL=

API_PORT=4000
JWT_SECRET=
JWT_EXPIRATION=7d

NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# OAuth (opcional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

---

## Segurança

- `.env.local` e `.env` nunca são commitados (`.gitignore`)
- Senhas de dev são óbvias por design (`tracktoy_dev`) — não usar em produção
- Produção usa variáveis injetadas pelo ambiente de deploy (Vercel, Railway, etc.)
- Redis em produção: autenticação obrigatória (`requirepass`)
