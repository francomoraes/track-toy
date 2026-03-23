# 03 — Design do Banco de Dados

## PostgreSQL — Schema Prisma (dados relacionais)

### Entidades

```prisma
// packages/database/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  avatarUrl     String?
  passwordHash  String?   // null se auth via OAuth
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  gameProfiles  GameProfile[]

  @@map("users")
}

// Tabelas NextAuth (Auth.js adapter)
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// Perfil de jogo — estatísticas agregadas (lê-se rápido)
model GameProfile {
  id              String   @id @default(cuid())
  userId          String   @unique
  totalScore      Int      @default(0)
  levelsCompleted Int      @default(0)
  highestLevel    Int      @default(0)
  totalPlayTime   Int      @default(0) // em segundos
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("game_profiles")
}
```

**Nota:** O progresso detalhado por fase (tentativas, tempo, estrelas) fica no MongoDB — é dado de jogo, não dado de usuário.

---

## MongoDB — Schemas Mongoose (dados de jogo)

### `LevelProgress` — progresso do usuário por fase

```typescript
// apps/api/src/modules/game/schemas/level-progress.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LevelProgressDocument = LevelProgress & Document;

@Schema({ timestamps: true, collection: 'level_progress' })
export class LevelProgress {
  @Prop({ required: true, index: true })
  userId: string; // FK para o User do PostgreSQL

  @Prop({ required: true })
  levelId: string; // ex: "level-01", "level-02"

  @Prop({ required: true })
  completed: boolean;

  @Prop({ default: 0 })
  stars: number; // 0-3

  @Prop({ default: 0 })
  bestScore: number;

  @Prop({ default: 0 })
  bestTime: number; // ms

  @Prop({ default: 0 })
  attempts: number;

  @Prop({ type: Object })
  lastAttemptData?: {
    score: number;
    duration: number;
    completedAt: Date;
    events: GameEvent[]; // log de eventos da partida
  };
}

export const LevelProgressSchema = SchemaFactory.createForClass(LevelProgress);
LevelProgressSchema.index({ userId: 1, levelId: 1 }, { unique: true });
```

### `GameSession` — sessão individual de jogo (replay / analytics)

```typescript
@Schema({ timestamps: true, collection: 'game_sessions' })
export class GameSession {
  @Prop({ required: true, index: true })
  userId: string; // null para jogadores anônimos (modo aberto)

  @Prop({ required: true })
  levelId: string;

  @Prop({ required: true, enum: ['anonymous', 'authenticated'] })
  mode: 'anonymous' | 'authenticated';

  @Prop({ default: false })
  completed: boolean;

  @Prop({ default: 0 })
  score: number;

  @Prop({ default: 0 })
  duration: number; // ms

  @Prop({ type: [Object] })
  events: GameEvent[]; // array de { type, timestamp, data }

  @Prop({ type: Object })
  metadata?: {
    deviceType: string;
    browserInfo: string;
  };
}
```

### `LevelConfig` — configuração de fases (editável sem deploy)

```typescript
@Schema({ collection: 'level_configs' })
export class LevelConfig {
  @Prop({ required: true, unique: true })
  levelId: string;

  @Prop({ required: true })
  order: number;

  @Prop({ required: true })
  name: string;

  @Prop({ type: Object })
  trackLayout: {
    segments: TrackSegment[];
    totalLength: number;
  };

  @Prop({ type: [Object] })
  obstacles: ObstacleConfig[];

  @Prop({ type: Object })
  educationalContent: {
    concept: 'colors' | 'numbers' | 'shapes' | 'sequences';
    items: EducationalItem[];
  };

  @Prop({ type: Object })
  scoring: {
    timeBonus: boolean;
    perfectBonus: number;
    starThresholds: [number, number, number]; // [1★, 2★, 3★]
  };

  @Prop({ default: true })
  isActive: boolean;
}
```

---

## Estratégia de Conexão

```
NestJS
  ├── PrismaService     → PostgreSQL (um único client singleton)
  └── MongooseModule    → MongoDB (connection pool automático)
```

No NestJS, `PrismaService` implementa `OnModuleInit` e `OnModuleDestroy` para gerenciar o lifecycle da conexão.

---

## Variáveis de Ambiente Necessárias

```env
# PostgreSQL
DATABASE_URL="postgresql://user:pass@localhost:5432/tracktoy"

# MongoDB
MONGODB_URI="mongodb://localhost:27017/tracktoy"

# Auth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="..."
JWT_EXPIRATION="7d"
```

---

## Decisão: Por que não usar apenas um banco?

**Por que não só PostgreSQL com JSONB?**
PostgreSQL suporta JSONB e funcionaria, mas:

- Mongoose/MongoDB tem melhor ergonomia para schemas de jogo que evoluem
- O MongoDB facilita queries de agregação em eventos de sessão (analytics)
- Objetivo pedagógico: estudar ambos lado a lado é o ponto

**Por que não só MongoDB?**

- Auth.js / NextAuth tem adapters maduros para Prisma/PostgreSQL
- Relacionamentos de usuário (user → account → session) se beneficiam de constraints ACID
- Mapeamento objeto-relacional é mais formal e seguro aqui
