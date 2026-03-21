# 06 — Estratégia de Testes (TDD)

## Filosofia

> Escrever testes não é sobre cobertura. É sobre design.

TDD força você a pensar na interface antes da implementação. Num projeto de jogo, isso é especialmente valioso porque a lógica de jogo precisa ser isolável — e a separação do pacote `game-core` já foi pensada com isso em mente.

---

## Pirâmide de Testes

```
        /\
       /E2E\        ← Playwright (fluxos reais no browser)
      /------\
     /Integr. \     ← Supertest (NestJS) + MSW (frontend)
    /----------\
   /    Unit    \   ← Jest (game-core, services, hooks, utils)
  /--------------\
```

- **Unitários**: maioria dos testes, rápidos, isolados
- **Integração**: middlewares, controllers, flows de auth, hooks com API mockada
- **E2E**: fluxos críticos de usuário (cadastro, jogar fase, ver progresso)

---

## Setup por Camada

### 1. `packages/game-core` — Jest puro

```bash
# Instalar
pnpm add -D jest @types/jest ts-jest
```

```typescript
// packages/game-core/jest.config.ts
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
};
```

**O que testar:**
- `calculateScore(events, config)` → retorna pontuação esperada
- `validateLevelCompletion(result, config)` → detecta resultados inválidos
- Geração correta de segmentos de pista
- Lógica das perguntas (resposta correta, tratamento de erros)

```typescript
// Exemplo TDD — escreva o teste antes da implementação
describe('calculateScore', () => {
  it('deve retornar 0 estrelas quando a fase não foi completada', () => {
    const result = calculateScore([], mockLevelConfig, { completed: false });
    expect(result.stars).toBe(0);
    expect(result.total).toBe(0);
  });

  it('deve adicionar bônus de tempo quando completado abaixo do tempo ideal', () => {
    const events = buildMockEvents({ duration: 30_000, errors: 0 });
    const result = calculateScore(events, mockLevelConfig, { completed: true });
    expect(result.timeBonus).toBeGreaterThan(0);
    expect(result.stars).toBe(3);
  });

  it('deve penalizar erros em bifurcações', () => {
    const events = buildMockEvents({ duration: 45_000, errors: 2 });
    const result = calculateScore(events, mockLevelConfig, { completed: true });
    expect(result.stars).toBe(1);
  });
});
```

---

### 2. `apps/api` (NestJS) — Jest + Supertest

```bash
pnpm add -D @nestjs/testing supertest @types/supertest
```

**Testes Unitários de Service:**
```typescript
describe('GameService', () => {
  let service: GameService;
  let mockLevelProgressModel: Model<LevelProgress>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GameService,
        { provide: getModelToken(LevelProgress.name), useValue: mockModel },
      ],
    }).compile();

    service = module.get(GameService);
  });

  it('deve rejeitar sessão com score inválido', async () => {
    const dto: CreateSessionDto = {
      levelId: 'level-01',
      score: 99999, // impossível
      completed: true,
      events: [],
      duration: 1000,
      stars: 3,
    };

    await expect(service.createSession('user-1', dto))
      .rejects.toThrow(BadRequestException);
  });
});
```

**Testes de Integração (Controller):**
```typescript
describe('GameController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // cria app com banco real (test DB) ou mocked
    app = await createTestApp();
  });

  it('POST /game/sessions deve retornar 401 sem auth', () => {
    return request(app.getHttpServer())
      .post('/api/v1/game/sessions')
      .send({ levelId: 'level-01', score: 100 })
      .expect(401);
  });

  it('POST /game/sessions deve salvar progresso autenticado', () => {
    return request(app.getHttpServer())
      .post('/api/v1/game/sessions')
      .set('Authorization', `Bearer ${testJWT}`)
      .send(validSessionPayload)
      .expect(201)
      .expect(({ body }) => {
        expect(body.data.stars).toBeGreaterThanOrEqual(0);
      });
  });
});
```

---

### 3. `apps/web` (Next.js) — Jest + React Testing Library + MSW

```bash
pnpm add -D jest jest-environment-jsdom @testing-library/react @testing-library/user-event msw
```

**O que testar no frontend:**
- Custom hooks (`useGameStorage`, `useGameState`)
- Componentes de UI isolados (HUD, modais, telas)
- **Não testar:** componentes Three.js (muito difícil, ROI baixo) — testar a lógica que eles consomem

```typescript
// Teste de hook com MSW (mock de API)
describe('useGameStorage no modo autenticado', () => {
  it('deve chamar a API ao salvar uma sessão', async () => {
    server.use(
      http.post('/api/v1/game/sessions', () => {
        return HttpResponse.json({ data: { stars: 3 } });
      })
    );

    const { result } = renderHook(() => useGameStorage(), {
      wrapper: AuthenticatedWrapper,
    });

    await act(async () => {
      await result.current.saveSession(mockSessionResult);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/game/sessions'),
      expect.any(Object)
    );
  });
});
```

---

### 4. E2E — Playwright

```bash
pnpm add -D @playwright/test
```

**Fluxos críticos a cobrir:**
1. Cadastro de novo usuário
2. Login com email/senha
3. Jogar fase no modo aberto (sem login)
4. Completar fase e verificar progresso salvo no localStorage
5. Login → jogar fase → verificar progresso sincronizado
6. Navegar para ranking

```typescript
// tests/e2e/game-open-mode.spec.ts
test('deve completar fase 1 no modo aberto e salvar no localStorage', async ({ page }) => {
  await page.goto('/play/level-01');
  await page.getByRole('button', { name: 'Jogar' }).click();

  // Simula resposta correta na primeira bifurcação
  await page.getByTestId('fork-option-left').click(); // ou right, dependendo do nível

  await expect(page.getByTestId('level-complete-modal')).toBeVisible();
  await expect(page.getByTestId('stars-display')).toContainText('3');

  // Verifica localStorage
  const progress = await page.evaluate(() =>
    localStorage.getItem('track-toy-progress')
  );
  expect(JSON.parse(progress!)).toMatchObject({
    'level-01': { completed: true, stars: 3 },
  });
});
```

---

## Cobertura e Thresholds

Configurar no `jest.config.ts` de cada pacote:

```typescript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 75,
    lines: 75,
    statements: 75,
  },
},
```

**Exceção:** `apps/web/components/game/` — componentes Three.js não precisam de cobertura de branches (são testados indiretamente pelos E2E).

---

## Ordem de Implementação com TDD

1. **`game-core`** — toda a lógica pura (testar first, 100% de cobertura aqui)
2. **`apps/api` services** — unit tests com mocks de banco
3. **`apps/api` controllers** — integration tests com supertest
4. **`apps/web` hooks** — unit tests com MSW
5. **`apps/web` componentes UI** — RTL para telas e modais
6. **E2E Playwright** — após cada feature estar integrada
