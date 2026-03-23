# 06 — Estratégia de Testes (TDD)

## Filosofia

> Escrever testes não é sobre cobertura. É sobre design.

TDD força você a pensar na interface pública antes da implementação. Neste projeto isso é especialmente valioso porque a lógica dos mecanismos pode ser completamente isolada da renderização 3D — e o pacote `game-core` foi concebido exatamente com isso em mente.

**Regra prática:** se um comportamento não pode ser testado sem abrir o browser, há acoplamento demais. Lógica de mecanismo, fluxo do carro e cálculo de score devem viver em `game-core` e ser testáveis com Jest puro.

---

## Status por área

| Área                         | Status      | Nota                                                |
| ---------------------------- | ----------- | --------------------------------------------------- |
| `game-core` — mecanismos     | ✅ Definido | Tipos e comportamentos fechados                     |
| `game-core` — fluxo do carro | ✅ Definido | `evaluateCarFlow` especificado                      |
| `game-core` — scoring        | ✅ Definido | Sistema de estrelas fechado                         |
| `game-core` — fases MVP      | ✅ Definido | 3 fases do mundo 1 especificadas                    |
| `frontend` — hooks de jogo   | ✅ Definido | `useGameStore`, `useGameStorage`                    |
| `frontend` — componentes UI  | ✅ Definido | HUD, painéis, telas                                 |
| `frontend` — cena 3D         | ⚠️ Parcial  | Componentes definidos, contratos de props pendentes |
| E2E — modo local (MVP)       | ✅ Definido | Fluxo das 3 fases com localStorage                  |
| `apps/api` — backend         | 🔲 Pendente | Bloco B, ainda não especificado                     |
| E2E — modo autenticado       | 🔲 Pendente | Depende do backend                                  |

---

## Pirâmide de Testes

```
          /\
         /E2E\          ← Playwright (fluxos no browser, MVP local)
        /------\
       /Integr. \       ← RTL + MSW (hooks + componentes com API mockada)
      /----------\
     /    Unit    \     ← Jest puro (game-core: mecanismos, fluxo, score)
    /--------------\
```

---

## 1. `frontend/src/game-core` — Jest puro ✅

Setup:

```bash
pnpm add -D jest @types/jest ts-jest
```

```typescript
// frontend/src/game-core/jest.config.ts
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageThreshold: {
    global: { branches: 90, functions: 90, lines: 90, statements: 90 },
  },
};
```

### 1.1 Mecanismos — máquina de estados

Cada mecanismo tem um estado e responde a comandos. Testar as transições de estado de cada um de forma isolada.

```typescript
// game-core/__tests__/mechanisms/elevator-platform.spec.ts

describe('ElevatorPlatform', () => {
  it('estado inicial é baixo (height = 0)', () => {
    const p = createElevatorPlatform({ id: 'p1' });
    expect(p.state.height).toBe(0);
  });

  it('raise eleva a plataforma para height = 1', () => {
    const p = createElevatorPlatform({ id: 'p1' });
    const next = applyCommand(p, 'raise');
    expect(next.state.height).toBe(1);
  });

  it('raise em plataforma ja elevada nao muda estado', () => {
    const p = createElevatorPlatform({ id: 'p1', initialHeight: 1 });
    const next = applyCommand(p, 'raise');
    expect(next.state.height).toBe(1);
  });

  it('lower retorna a plataforma para height = 0', () => {
    const p = createElevatorPlatform({ id: 'p1', initialHeight: 1 });
    const next = applyCommand(p, 'lower');
    expect(next.state.height).toBe(0);
  });
});
```

```typescript
// game-core/__tests__/mechanisms/rotary-platform.spec.ts

describe('RotaryPlatform', () => {
  it('estado inicial é 0 graus', () => {
    const r = createRotaryPlatform({ id: 'r1' });
    expect(r.state.angle).toBe(0);
  });

  it('rotate_cw avança 90 graus', () => {
    const r = createRotaryPlatform({ id: 'r1' });
    const next = applyCommand(r, 'rotate_cw');
    expect(next.state.angle).toBe(90);
  });

  it('rotacao passa por 270 e volta a 0', () => {
    const r = createRotaryPlatform({ id: 'r1', initialAngle: 270 });
    const next = applyCommand(r, 'rotate_cw');
    expect(next.state.angle).toBe(0);
  });

  it('isAligned retorna true quando angulo corresponde a saida valida', () => {
    const r = createRotaryPlatform({ id: 'r1', exitAngle: 90 });
    const aligned = createRotaryPlatform({
      id: 'r1',
      exitAngle: 90,
      initialAngle: 90,
    });
    expect(isAligned(r)).toBe(false);
    expect(isAligned(aligned)).toBe(true);
  });
});
```

```typescript
// game-core/__tests__/mechanisms/drawbridge.spec.ts

describe('Drawbridge', () => {
  it('estado inicial é fechada (down = false)', () => {
    const b = createDrawbridge({ id: 'b1' });
    expect(b.state.down).toBe(false);
  });

  it('toggle abre a ponte', () => {
    const b = createDrawbridge({ id: 'b1' });
    const next = applyCommand(b, 'toggle');
    expect(next.state.down).toBe(true);
  });

  it('toggle duplo fecha novamente', () => {
    const b = createDrawbridge({ id: 'b1' });
    const next = applyCommand(applyCommand(b, 'toggle'), 'toggle');
    expect(next.state.down).toBe(false);
  });
});
```

### 1.2 Fluxo do carro — `evaluateCarFlow`

```typescript
// game-core/__tests__/car-flow.spec.ts

describe('evaluateCarFlow', () => {
  it('retorna can_advance quando todos os mecanismos no caminho estao liberados', () => {
    const state = buildMechanismStates({
      elevator: { height: 1 },
      bridge: { down: true },
    });
    const result = evaluateCarFlow(state, level1_3Config);
    expect(result.status).toBe('can_advance');
  });

  it('retorna blocked quando plataforma esta baixa', () => {
    const state = buildMechanismStates({
      elevator: { height: 0 },
      bridge: { down: true },
    });
    const result = evaluateCarFlow(state, level1_3Config);
    expect(result.status).toBe('blocked');
    expect(result.blockedBy).toBe('elevator');
  });

  it('retorna blocked quando ponte esta levantada', () => {
    const state = buildMechanismStates({
      elevator: { height: 1 },
      bridge: { down: false },
    });
    const result = evaluateCarFlow(state, level1_3Config);
    expect(result.status).toBe('blocked');
    expect(result.blockedBy).toBe('bridge');
  });
});
```

### 1.3 Scoring — `calculateScore`

```typescript
// game-core/__tests__/scoring.spec.ts

describe('calculateScore', () => {
  it('retorna 0 estrelas quando a fase nao foi completada', () => {
    const result = calculateScore([], mockLevelConfig, { completed: false });
    expect(result.stars).toBe(0);
    expect(result.total).toBe(0);
  });

  it('retorna 3 estrelas com zero erros e dentro do tempo ideal', () => {
    const events = buildMockEvents({ durationMs: 20_000, errors: 0 });
    const result = calculateScore(events, mockLevelConfig, { completed: true });
    expect(result.stars).toBe(3);
    expect(result.timeBonus).toBeGreaterThan(0);
  });

  it('retorna 2 estrelas com 1-2 erros mecanicos', () => {
    const events = buildMockEvents({ durationMs: 25_000, errors: 2 });
    const result = calculateScore(events, mockLevelConfig, { completed: true });
    expect(result.stars).toBe(2);
  });

  it('retorna 1 estrela com 3+ erros ou tempo muito acima do ideal', () => {
    const events = buildMockEvents({ durationMs: 90_000, errors: 5 });
    const result = calculateScore(events, mockLevelConfig, { completed: true });
    expect(result.stars).toBe(1);
  });

  it('contabiliza apenas eventos de tipo car_blocked como erros', () => {
    const events = [
      { type: 'command_triggered', timestamp: 0, data: {} },
      {
        type: 'car_blocked',
        timestamp: 500,
        data: { reason: 'wrong_sequence' },
      },
      { type: 'cycle_completed', timestamp: 20_000, data: {} },
    ] satisfies GameEvent[];
    const result = calculateScore(events, mockLevelConfig, { completed: true });
    expect(result.errors).toBe(1);
  });
});
```

---

## 2. `frontend` — hooks ✅

Setup:

```bash
pnpm add -D jest jest-environment-jsdom @testing-library/react @testing-library/user-event msw
```

### 2.1 `useGameStore`

```typescript
// frontend/__tests__/hooks/useGameStore.spec.ts

describe('useGameStore', () => {
  beforeEach(() => {
    useGameStore.setState(initialGameState);
  });

  it('startLevel seta currentLevelId e muda phase para running', () => {
    act(() => useGameStore.getState().startLevel('level-1-1'));
    const { phase, currentLevelId } = useGameStore.getState();
    expect(phase).toBe('running');
    expect(currentLevelId).toBe('level-1-1');
  });

  it('triggerCommand registra evento command_triggered', () => {
    act(() => {
      useGameStore.getState().startLevel('level-1-1');
      useGameStore.getState().triggerCommand('cmd-1');
    });
    const { events } = useGameStore.getState();
    expect(events).toContainEqual(
      expect.objectContaining({
        type: 'command_triggered',
        data: { commandId: 'cmd-1' },
      }),
    );
  });

  it('completeCycle incrementa cycleCount e dispara sucesso quando meta atingida', () => {
    act(() => {
      useGameStore.getState().startLevel('level-1-1');
      useGameStore.getState().completeCycle();
    });
    const { phase, cycleCount } = useGameStore.getState();
    expect(cycleCount).toBe(1);
    expect(phase).toBe('success');
  });

  it('failLevel muda phase para fail e registra motivo', () => {
    act(() => {
      useGameStore.getState().startLevel('level-1-1');
      useGameStore.getState().failLevel('car_stuck_no_valid_path');
    });
    expect(useGameStore.getState().phase).toBe('fail');
  });
});
```

### 2.2 `useGameStorage` — modo local

```typescript
// frontend/__tests__/hooks/useGameStorage.spec.ts

describe('useGameStorage (modo local, sem auth)', () => {
  beforeEach(() => localStorage.clear());

  it('getLevelProgress retorna null para fase sem historico', () => {
    const { result } = renderHook(() => useGameStorage());
    expect(result.current.getLevelProgress('level-1-1')).toBeNull();
  });

  it('saveSession persiste progresso no localStorage', () => {
    const { result } = renderHook(() => useGameStorage());
    act(() => {
      result.current.saveSession({
        levelId: 'level-1-1',
        completed: true,
        stars: 3,
        durationMs: 18_000,
        errors: 0,
        events: [],
      });
    });
    const stored = JSON.parse(localStorage.getItem('track-toy-progress')!);
    expect(stored['level-1-1']).toMatchObject({ completed: true, stars: 3 });
  });

  it('saveSession atualiza bestStars somente se resultado for melhor', () => {
    const { result } = renderHook(() => useGameStorage());
    act(() =>
      result.current.saveSession({
        levelId: 'level-1-1',
        stars: 2,
        completed: true,
        durationMs: 30_000,
        errors: 1,
        events: [],
      }),
    );
    act(() =>
      result.current.saveSession({
        levelId: 'level-1-1',
        stars: 1,
        completed: true,
        durationMs: 60_000,
        errors: 3,
        events: [],
      }),
    );
    expect(result.current.getLevelProgress('level-1-1')?.stars).toBe(2);
  });
});
```

### 2.3 Componentes de UI

**O que testar:** telas e painéis como unidades isoladas. Não testar componentes Three.js diretamente (ROI muito baixo — testar via E2E ou pela lógica que eles consomem).

```typescript
// frontend/__tests__/components/CommandPanel.spec.tsx

describe('<CommandPanel />', () => {
  it('renderiza apenas os controles ativos na fase', () => {
    render(<CommandPanel commands={[mockElevatorCommand]} />);
    expect(screen.getByText('Elevar')).toBeInTheDocument();
    expect(screen.queryByText('Girar')).not.toBeInTheDocument();
  });

  it('chama onCommand com o commandId correto ao clicar', async () => {
    const onCommand = vi.fn();
    render(<CommandPanel commands={[mockElevatorCommand]} onCommand={onCommand} />);
    await userEvent.click(screen.getByRole('button', { name: /elevar/i }));
    expect(onCommand).toHaveBeenCalledWith('cmd-1');
  });

  it('atalho de teclado "1" aciona o primeiro comando', async () => {
    const onCommand = vi.fn();
    render(<CommandPanel commands={[mockElevatorCommand]} onCommand={onCommand} />);
    await userEvent.keyboard('1');
    expect(onCommand).toHaveBeenCalledWith('cmd-1');
  });
});
```

---

## 3. E2E — Playwright ✅ (MVP local)

```bash
pnpm add -D @playwright/test
```

### Fluxos cobertos no MVP (modo local, sem login)

```typescript
// tests/e2e/fase-1-1.spec.ts
test('fase 1-1: elevar plataforma e completar ciclo', async ({ page }) => {
  await page.goto('/play/level-1-1');
  await page.getByRole('button', { name: 'Comecar' }).click();

  // Carro bloqueia na plataforma — painel deve destacar cmd-1
  await expect(page.getByTestId('cmd-1')).toHaveAttribute('data-state', 'highlighted');

  await page.getByTestId('cmd-1').click(); // Elevar plataforma

  // Aguarda animacao e ciclo completar
  await expect(page.getByTestId('level-complete')).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.getByTestId('stars-display')).toContainText('3');

  // Verifica localStorage
  const progress = await page.evaluate(() => localStorage.getItem('track-toy-progress'));
  expect(JSON.parse(progress!)['level-1-1']).toMatchObject({ completed: true });
});
```

```typescript
// tests/e2e/fase-1-3.spec.ts
test('fase 1-3: elevar plataforma e depois abrir ponte em sequencia', async ({ page }) => {
  await page.goto('/play/level-1-3');
  await page.getByRole('button', { name: 'Comecar' }).click();

  // Primeiro bloqueio: plataforma
  await page.getByTestId('cmd-1').click();

  // Segundo bloqueio: ponte
  await page.getByTestId('cmd-2').click();

  await expect(page.getByTestId('level-complete')).toBeVisible({
    timeout: 15_000,
  });
});
```

```typescript
// tests/e2e/progresso-local.spec.ts
test('progresso de fases completadas persiste entre sessoes', async ({ page }) => {
  // Completa fase 1-1
  await page.goto('/play/level-1-1');
  await page.getByRole('button', { name: 'Comecar' }).click();
  await page.getByTestId('cmd-1').click();
  await page.getByTestId('level-complete').waitFor();

  // Navega para mapa e verifica status
  await page.goto('/');
  await page.getByRole('button', { name: 'Selecionar Fase' }).click();
  await expect(page.getByTestId('fase-1-1-card')).toHaveAttribute('data-status', 'completed');

  // Recarga da pagina nao perde progresso
  await page.reload();
  await expect(page.getByTestId('fase-1-1-card')).toHaveAttribute('data-status', 'completed');
});
```

```typescript
// tests/e2e/tela-inicial.spec.ts
test('tela inicial renderiza e navega corretamente', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Jogar Agora' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Selecionar Fase' })).toBeVisible();

  await page.getByRole('button', { name: 'Selecionar Fase' }).click();
  await expect(page).toHaveURL(/\/fases/);
});
```

---

## 4. Pendente — Bloco B (backend)

> As seções abaixo serão detalhadas quando o backend for especificado.

### 🔲 `apps/api` — NestJS

- Unit tests de `GameService.createSession()` (validacao server-side de score com `game-core`)
- Unit tests de `AuthService`
- Integration tests (Supertest) de controllers com banco de test

### 🔲 `frontend` — modo autenticado

- `useGameStorage` alternando entre localStorage e fetch (MSW para mockar API)
- Migração de progresso local ao logar pela primeira vez

### 🔲 E2E — modo autenticado

- Fluxo de cadastro e login
- Jogar fase logado e verificar persistência no banco
- Sincronização entre dispositivos (progresso local -> nuvem)
- Ranking

---

## Cobertura esperada por pacote

| Pacote                | Meta de cobertura     | Observacao                   |
| --------------------- | --------------------- | ---------------------------- |
| `game-core`           | >90% branches + lines | Lógica pura, sem desculpas   |
| `frontend` hooks      | >80% lines            | Excluir arquivos de config   |
| `frontend` components | >70% lines            | Excluir componentes Three.js |
| `apps/api` (Bloco B)  | >80% lines            | A definir                    |
