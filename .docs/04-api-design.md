# 04 — Design das APIs

## Convenções

- Todos os endpoints REST usam prefixo `/api/v1`
- Respostas seguem o padrão: `{ data, meta?, error? }`
- Autenticação via header `Authorization: Bearer <jwt>`
- Validação de entrada com `class-validator` (DTOs no NestJS)
- Endpoints públicos não requerem token

---

## Auth (`/api/v1/auth`)

| Método | Rota             | Auth | Descrição                    |
| ------ | ---------------- | ---- | ---------------------------- |
| `POST` | `/auth/register` | ❌   | Cadastro com email/senha     |
| `POST` | `/auth/login`    | ❌   | Login, retorna JWT           |
| `POST` | `/auth/refresh`  | ❌   | Refresh do token             |
| `POST` | `/auth/logout`   | ✅   | Invalida sessão              |
| `GET`  | `/auth/me`       | ✅   | Dados do usuário autenticado |

**Nota:** O fluxo OAuth (Google, GitHub) é tratado pelo NextAuth no frontend. O NestJS recebe o JWT gerado pelo NextAuth e valida pela chave pública.

---

## Users (`/api/v1/users`)

| Método   | Rota             | Auth | Descrição                 |
| -------- | ---------------- | ---- | ------------------------- |
| `GET`    | `/users/profile` | ✅   | Perfil + stats do usuário |
| `PATCH`  | `/users/profile` | ✅   | Atualiza nome, avatar     |
| `DELETE` | `/users/account` | ✅   | Deleta conta (LGPD)       |

---

## Game Progress (`/api/v1/game`)

| Método | Rota                      | Auth | Descrição                        |
| ------ | ------------------------- | ---- | -------------------------------- |
| `GET`  | `/game/progress`          | ✅   | Progresso em todas as fases      |
| `GET`  | `/game/progress/:levelId` | ✅   | Progresso em uma fase específica |
| `POST` | `/game/sessions`          | ✅   | Registra resultado de uma sessão |
| `GET`  | `/game/sessions`          | ✅   | Histórico de sessões (paginado)  |

### `POST /game/sessions` — Body

```typescript
{
  levelId: string;          // "level-01"
  completed: boolean;
  score: number;
  duration: number;         // ms
  stars: number;            // 0-3
  events: GameEvent[];      // log completo de eventos
}
```

O NestJS **valida** o resultado usando `game-core` antes de persistir:

```typescript
// Evita cheating: recalcula score server-side e compara
const serverScore = calculateScore(events, levelConfig);
if (Math.abs(serverScore - dto.score) > TOLERANCE) {
  throw new BadRequestException('Score inválido');
}
```

---

## Levels (`/api/v1/levels`)

| Método | Rota                           | Auth | Descrição                                          |
| ------ | ------------------------------ | ---- | -------------------------------------------------- |
| `GET`  | `/levels`                      | ❌   | Lista todas as fases ativas (sem layout detalhado) |
| `GET`  | `/levels/:levelId`             | ❌   | Config completa de uma fase                        |
| `GET`  | `/levels/:levelId/leaderboard` | ❌   | Top 10 da fase                                     |

---

## Ranking (`/api/v1/ranking`)

| Método | Rota              | Auth | Descrição                          |
| ------ | ----------------- | ---- | ---------------------------------- |
| `GET`  | `/ranking/global` | ❌   | Ranking global por pontuação total |
| `GET`  | `/ranking/weekly` | ❌   | Ranking da semana                  |
| `GET`  | `/ranking/me`     | ✅   | Posição do usuário autenticado     |

---

## LocalStorage API (modo aberto, frontend only)

Não é uma API REST — é uma abstração no frontend que espelha a interface da API real:

```typescript
// frontend/lib/storage/local-game-storage.ts

export const localGameStorage = {
  getProgress: (): LevelProgress[] => { ... },
  getLevelProgress: (levelId: string): LevelProgress | null => { ... },
  saveSession: (result: SessionResult): void => { ... },
  clearAll: (): void => { ... },
};
```

O frontend usa uma abstração `useGameStorage()` que, dependendo do estado de auth, usa a API REST ou o `localGameStorage`. Isso isola completamente a lógica do jogo de "onde estão meus dados".

```typescript
// frontend/hooks/useGameStorage.ts

export function useGameStorage() {
  const { data: session } = useSession();

  if (session?.user) {
    return remoteGameStorage; // usa fetch para NestJS
  }
  return localGameStorage; // usa localStorage
}
```

---

## Tratamento de Erros

O NestJS expõe um `GlobalExceptionFilter` que padroniza todas as respostas de erro:

```json
{
  "error": {
    "code": "LEVEL_NOT_FOUND",
    "message": "Fase não encontrada",
    "statusCode": 404
  }
}
```

Erros de validação (400):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "details": [{ "field": "score", "message": "score deve ser um número positivo" }]
  }
}
```
