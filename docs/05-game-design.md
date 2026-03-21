# 05 — Game Design Document (GDD)

## Conceito Central

Jogo de trilha mecânica educativa inspirado em brinquedo Montessori de carrinho por gravidade.

O jogador nao acelera nem dirige livremente o carro. O desafio esta em operar os mecanismos certos, na ordem certa e no tempo certo, para destravar o caminho do carrinho ao longo de um circuito fisico.

Pilares do conceito:
- Causa e efeito fisico claro
- Resolucao de problema por sequenciamento de comandos
- Coordenacao motora fina e timing
- Loop ciclico (inicio -> mecanismos -> retorno ao inicio)

---

## Mecanica Principal (Core Loop)

### Visao geral
O carrinho se move por gravidade sempre que existe continuidade de altura e alinhamento de pista.
Quando encontra bloqueio mecanico, o jogador precisa atuar em um painel de comandos com 6 controles para liberar a progressao.

### Sequencia completa da fase avancada (referencia)

1. Plataforma elevatoria inicial
- O carrinho comeca abaixo do nivel da pista seguinte.
- Comando correto eleva a plataforma e libera a descida por gravidade.

2. Rotatoria 1
- O carrinho chega na rotatoria apontando para o lado bloqueado por anteparo.
- Jogador gira o controle da rotatoria em 90 graus para alinhar a saida.

3. Rotatoria 2 com manobra dupla
- O carrinho encosta pelo lado externo da plataforma.
- Jogador precisa reajustar o giro para permitir entrada.
- Depois gira novamente para permitir a saida correta.

4. Rampa rolante com manivela
- O carrinho para na base da rampa.
- Jogador gira a manivela para elevar o carrinho ate o topo.

5. Helicoptero magnetico sincronizado
- A mesma manivela move um helicoptero acima da rampa.
- Jogador deve sincronizar: helicoptero exatamente sobre o carrinho no topo.
- Aciona botao de magnetismo para acoplar o carrinho ao helicoptero.

6. Soltura na trave
- Helicoptero transporta o carrinho ate uma trave que descola o carro.
- Carrinho retorna para a pista e segue por gravidade.

7. Ponte elevadica
- Ponte pode estar levantada e interromper o caminho.
- Jogador aciona comando para baixar a ponte.

8. Guindaste final
- Carrinho para em plataforma abaixo do nivel da trilha final.
- Jogador eleva o guindaste para reconectar a trilha.
- Carrinho retorna ao ponto inicial, fechando um ciclo.

---

## Mecanicas Principais

### Carrinho
- Movimento passivo por gravidade (sem aceleracao manual)
- Colisao simples com bloqueios e anteparos
- Estados: parado, rolando, travado em mecanismo, transportado

### Mecanismos interativos
- Plataforma elevatoria
- Rotatoria (0, 90, 180, 270 graus)
- Rampa rolante acionada por manivela
- Helicoptero com acoplamento magnetico
- Ponte elevadica
- Guindaste elevatorio

### Painel de comandos
- 6 controles mapeados para mecanismos da fase
- Alguns controles possuem estado continuo (ex.: manivela)
- Outros sao discretos (ligado/desligado, subir/descer)

### Dificuldade
- Aumento por quantidade de mecanismos ativos
- Aumento por necessidade de sequencia correta
- Aumento por janela de timing e sincronizacao
- Variacoes de velocidade da gravidade (leve)

---

## Progressao de Fases

A fase descrita pelo usuario vira uma fase avancada. As fases iniciais introduzem conceitos isolados.

### Mundo 1 — Fundamentos de causa e efeito (fases 1-5)
| Fase | Foco mecanico | Objetivo |
|---|---|---|
| 1-1 | Plataforma elevatoria unica | Entender desnivel e liberacao por altura |
| 1-2 | Ponte elevadica unica | Entender bloqueio e abertura de passagem |
| 1-3 | Rotatoria simples | Alinhar pista em 90 graus |
| 1-4 | Guindaste simples | Elevar para reconectar trilha |
| 1-5 | Mini-ciclo (2 mecanismos) | Aplicar sequencia curta |

### Mundo 2 — Sequencia e reversao (fases 6-10)
| Fase | Foco mecanico | Objetivo |
|---|---|---|
| 2-1 | Rotatoria com entrada e saida | Ajuste duplo de orientacao |
| 2-2 | Duas rotatorias | Ordem correta entre mecanismos |
| 2-3 | Rampa com manivela | Controle continuo ate topo |
| 2-4 | Ponte + guindaste | Sequencia com dois bloqueios |
| 2-5 | Mini-ciclo completo | Inicio e retorno ao inicio |

### Mundo 3 — Sincronizacao (fases 11-15)
| Fase | Foco mecanico | Objetivo |
|---|---|---|
| 3-1 | Helicoptero sem timing estrito | Entender acoplamento magnetico |
| 3-2 | Helicoptero com janela ampla | Sincronizar topo + botao |
| 3-3 | Helicoptero com janela curta | Precisao de tempo |
| 3-4 | Rampa + helicoptero + ponte | Cadeia de 3 mecanismos |
| 3-5 | Desafio de sincronizacao | Execucao consistente |

### Mundo 4 — Circuito Montessori completo (fases 16-20)
| Fase | Foco mecanico | Objetivo |
|---|---|---|
| 4-1 | Loop quase completo | Todos mecanismos, timing tolerante |
| 4-2 | Loop completo | Sequencia correta sem ajuda |
| 4-3 | Loop com variao inicial | Posicoes iniciais alteradas |
| 4-4 | Loop com perturbacoes | Pequenos atrasos e bloqueios extras |
| 4-5 | Fase assinatura (hero) | Versao completa inspirada no brinquedo real |

---

## Regras de Falha e Sucesso

### Sucesso
- Completar o objetivo da fase (normalmente fechar 1 ciclo)
- Opcional em fases avancadas: completar 2 ciclos sem erro para bonus

### Falha
- Sequencia invalida que deixa o carrinho preso sem caminho valido
- Perda de sincronizacao critica (ex.: magnetismo fora da janela)
- Tempo maximo excedido (somente em fases com cronometro)

### Sistema de estrelas
- 3 estrelas: sem erro mecanico e com eficiencia alta
- 2 estrelas: 1-2 erros ou tempo acima do ideal
- 1 estrela: concluiu com assistencia / tentativas extras
- 0 estrelas: nao concluiu

---

## Arquitetura do Game Loop (frontend)

```text
GameScene (R3F)
|- Canvas (WebGL)
|  |- Physics (Rapier)
|  |  |- Track
|  |  |- Car
|  |  |- Mechanisms
|  |  |  |- ElevatorPlatform
|  |  |  |- RotaryPlatform
|  |  |  |- ConveyorRamp
|  |  |  |- HelicopterMagnet
|  |  |  |- Drawbridge
|  |  |  |- CraneLift
|  |- Camera
|  |- Lights
|
|- HUD (fora do canvas)
|  |- StageStatus
|  |- ObjectivePanel
|  |- CommandPanel (6 controles)
|  |- FeedbackLog
|
|- GameController (orquestra estado + eventos)
```

### Estado do jogo (Zustand)

```typescript
interface GameState {
  phase: 'idle' | 'running' | 'blocked' | 'success' | 'fail';
  currentLevelId: string;
  elapsedMs: number;
  stars: number;
  errors: number;
  cycleCount: number;
  events: GameEvent[];

  mechanisms: {
    platformHeight: number;
    rotaryA: 0 | 90 | 180 | 270;
    rotaryB: 0 | 90 | 180 | 270;
    rampProgress: number; // 0..1
    helicopterAngle: number; // 0..360
    magnetEnabled: boolean;
    bridgeDown: boolean;
    craneHeight: number;
  };

  startLevel: (levelId: string) => void;
  triggerCommand: (commandId: string) => void;
  rotateCrank: (delta: number) => void;
  evaluateFlow: () => void;
  completeCycle: () => void;
  failLevel: (reason: string) => void;
}
```

---

## Tipos do game-core

```typescript
export type MechanismType =
  | 'elevator_platform'
  | 'rotary_platform'
  | 'conveyor_ramp'
  | 'helicopter_magnet'
  | 'drawbridge'
  | 'crane_lift';

export interface CommandBinding {
  commandId: string;      // ex: cmd-1 ... cmd-6
  mechanismId: string;
  action: 'toggle' | 'rotate' | 'raise' | 'lower' | 'enable_magnet';
}

export interface LevelConfig {
  levelId: string;
  name: string;
  world: number;
  order: number;
  objective: {
    cyclesToComplete: number;
    maxTimeMs?: number;
  };
  mechanisms: MechanismConfig[];
  commandBindings: CommandBinding[];
  scoring: ScoringConfig;
}

export interface GameEvent {
  type:
    | 'command_triggered'
    | 'mechanism_state_changed'
    | 'car_blocked'
    | 'car_released'
    | 'magnet_attached'
    | 'magnet_detached'
    | 'cycle_completed';
  timestamp: number;
  data: Record<string, unknown>;
}
```

---

## Feedback e UX infantil

- Feedback imediato em cada comando (som, luz, movimento)
- Indicacao visual clara de bloqueio (seta vermelha) e caminho liberado (seta verde)
- Assistencia opcional por nivel:
  - Dica de proximo comando
  - Highlight no controle correto apos inatividade
  - Modo sem falha para exploracao livre

---

## Assets e Visual

### Estilo visual
- Toy-like low poly, cores quentes e acabamento de brinquedo de madeira
- Materiais simples, leitura clara de cada mecanismo
- Camera isometrica levemente inclinada para ver causa e efeito

### Assets 3D
- Kenney.nl para base de prototipo
- Modelos proprios no Blender para mecanismos especificos (rotatoria, guindaste, ponte)
- Formato glb para carregamento eficiente

### Audio
- Clique mecanico para botoes
- Som de engrenagem para manivela/rampa
- Feedback de acerto sincronizado e erro de timing

---

## Controles

| Plataforma | Controle |
|---|---|
| Desktop | Mouse (clicar botoes, arrastar manivela) + atalhos numericos 1..6 |
| Mobile | Toque em botoes + gesto circular na manivela |
| Gamepad (futuro) | Seleciona comando e confirma acao |
