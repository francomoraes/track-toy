# 05 — Game Design Document (GDD)

## Conceito Central

Jogo de trilha mecânica educativa inspirado em brinquedo Montessori de carrinho por gravidade.

O jogador nao acelera nem dirige livremente o carro. O desafio esta em operar os mecanismos certos, na ordem certa e no tempo certo, para destravar o caminho do carrinho ao longo de um circuito fisico.

Pilares do conceito:

- Causa e efeito fisico claro e imediato
- Exploracao livre dos mecanismos: o jogador pode acionar qualquer controle a qualquer momento
- Descoberta por tentativa direta, sem punicao por curiosidade
- Coordenacao motora fina e timing (fases avancadas)
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
- Modelo hold-to-act: o mecanismo age enquanto o botao esta pressionado e para quando o jogador solta
- Nao existe botao de toggle: controles sao sempre posicionais (o jogador decide ate onde vai)
- Manivela: controle continuo por arrasto ou gesto; segura para girar, solta para parar

### Dificuldade

- Aumento por quantidade de mecanismos ativos simultaneamente
- Aumento por precisao de posicionamento necessaria (ex.: angulo exato da rotatoria)
- Aumento por janela de timing e sincronizacao (ex.: helicoptero)
- Variacoes de velocidade da gravidade (leve)
- O jogador nunca e punido por explorar: apertar botoes livremente nunca causa erro; erros so ocorrem quando o carrinho colide ou cai (fases avancadas)
- Só anotando ideias para não esquecer:
  - Em dificuldades maiores, se o carro bater, ele pode quebrar
  - Pode ter pistas sem "guard-reail" que daí o carro cai se não fechar o guard rail a tempo (seria mais um tipo de botão)
  - Pode aumentar a sensibilidade dos botões também, não sei direito como fazer isso no teclado do pc, mas fica a ideia.

---

## Progressao de Fases

A fase descrita pelo usuario vira uma fase avancada. As fases iniciais introduzem conceitos isolados.

### Mundo 1 — Fundamentos de causa e efeito (fases 1-5)

| Fase | Foco mecanico               | Objetivo                                 |
| ---- | --------------------------- | ---------------------------------------- |
| 1-1  | Plataforma elevatoria unica | Entender desnivel e liberacao por altura |
| 1-2  | Ponte elevadica unica       | Entender bloqueio e abertura de passagem |
| 1-3  | Rotatoria simples           | Alinhar pista em 90 graus                |
| 1-4  | Guindaste simples           | Elevar para reconectar trilha            |
| 1-5  | Mini-ciclo (2 mecanismos)   | Aplicar sequencia curta                  |

### Mundo 2 — Sequencia e reversao (fases 6-10)

| Fase | Foco mecanico                 | Objetivo                       |
| ---- | ----------------------------- | ------------------------------ |
| 2-1  | Rotatoria com entrada e saida | Ajuste duplo de orientacao     |
| 2-2  | Duas rotatorias               | Ordem correta entre mecanismos |
| 2-3  | Rampa com manivela            | Controle continuo ate topo     |
| 2-4  | Ponte + guindaste             | Sequencia com dois bloqueios   |
| 2-5  | Mini-ciclo completo           | Inicio e retorno ao inicio     |

### Mundo 3 — Sincronizacao (fases 11-15)

| Fase | Foco mecanico                  | Objetivo                       |
| ---- | ------------------------------ | ------------------------------ |
| 3-1  | Helicoptero sem timing estrito | Entender acoplamento magnetico |
| 3-2  | Helicoptero com janela ampla   | Sincronizar topo + botao       |
| 3-3  | Helicoptero com janela curta   | Precisao de tempo              |
| 3-4  | Rampa + helicoptero + ponte    | Cadeia de 3 mecanismos         |
| 3-5  | Desafio de sincronizacao       | Execucao consistente           |

### Mundo 4 — Circuito Montessori completo (fases 16-20)

| Fase | Foco mecanico           | Objetivo                                    |
| ---- | ----------------------- | ------------------------------------------- |
| 4-1  | Loop quase completo     | Todos mecanismos, timing tolerante          |
| 4-2  | Loop completo           | Sequencia correta sem ajuda                 |
| 4-3  | Loop com variao inicial | Posicoes iniciais alteradas                 |
| 4-4  | Loop com perturbacoes   | Pequenos atrasos e bloqueios extras         |
| 4-5  | Fase assinatura (hero)  | Versao completa inspirada no brinquedo real |

---

## Regras de Falha e Sucesso

### Sucesso

- Completar o objetivo da fase (normalmente fechar 1 ciclo)
- Opcional em fases avancadas: completar 2 ciclos sem erro para bonus

### Falha

- Todos os caminhos de saida simultaneamente bloqueados (carro preso sem nenhuma acao possivel para liberar)
- Colisao com obstaculo ou queda da pista (somente em fases avancadas com dinamica de dano)
- Obs: perder a janela do helicoptero nao e falha — o jogador simplesmente recua a rampa e tenta novamente

### Sistema de estrelas

Fases do Mundo 1 (MVP) — sem dinamica de colisao:

- 3 estrelas: completou dentro do tempo excelente (definido por fase)
- 2 estrelas: completou dentro do tempo bom
- 1 estrela: completou em qualquer tempo
- 0 estrelas: nao completou

Fases avancadas (com colisoes e quedas):

- 3 estrelas: completou sem colisoes e dentro do tempo excelente
- 2 estrelas: completou com 1-2 colisoes ou tempo acima do ideal
- 1 estrela: completou com danos ou muito tempo
- 0 estrelas: nao completou

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
  phase: "idle" | "running" | "blocked" | "success" | "fail";
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
  | "elevator_platform"
  | "rotary_platform"
  | "conveyor_ramp"
  | "helicopter_magnet"
  | "drawbridge"
  | "crane_lift";

// Hold-to-act: todas as acoes sao continuas enquanto o comando esta ativo
export interface CommandBinding {
  commandId: string; // ex: cmd-1 ... cmd-6
  mechanismId: string;
  action: "raise" | "lower" | "rotate_cw" | "rotate_ccw" | "enable_magnet";
  // nao existe 'toggle': o estado do mecanismo depende de quanto tempo o botao fica pressionado
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
    | "command_triggered"
    | "mechanism_state_changed"
    | "car_blocked"
    | "car_released"
    | "magnet_attached"
    | "magnet_detached"
    | "cycle_completed";
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

## Especificacao de Produto — Telas e Fluxos

### Tela Inicial

Layout centralizado com cena 3D de fundo em loop leve (carrinho completando mini-ciclo autonomamente para vender o conceito visualmente).

Elementos:

- Bloco central:
  - Botao **Jogar Agora** — entra diretamente na proxima fase disponivel
  - Botao **Selecionar Fase** — vai para o mapa de fases
  - Botao **Como Funciona** — tutorial rapido em overlay (animacao dos controles)
- Canto superior direito:
  - Indicador de progresso local (ex.: "2 / 5 fases")
  - Botao de perfil — no MVP local, abre configuracoes simples; na versao autenticada, abre menu de conta
- Rodape:
  - Configuracoes (som, sensibilidade da manivela)

---

### Mapa de Fases

Grid ou trilha visual com cards de fase.

Cada card mostra:

- Nome da fase
- Status: bloqueada (cadeado) / disponivel / completa
- Estrelas obtidas (0-3) se ja completada
- Mecanismo principal da fase como icone (preview do que vai aprender)

Regra de desbloqueio: cada fase exige a anterior completa (qualquer numero de estrelas).

---

### Estrutura de uma Fase

#### 1. Tela pre-fase (3-5 segundos ou skip)

- Objetivo da fase em linguagem simples (ex.: "Eleve a plataforma para o carrinho passar!")
- Mecanismo(s) disponivel(is) destacados no painel
- Botao Comecar

#### 2. Execucao

O jogador ve a cena 3D e o painel de comandos.

Fluxo padrao:

1. Carrinho inicia e rola por gravidade ate o primeiro bloqueio
2. HUD indica qual mecanismo esta impedindo o carro (highlight na cena + no painel)
3. Jogador opera o controle correto
4. Mecanismo anima, caminho se abre, carrinho retoma por gravidade
5. Repete para cada mecanismo da fase ate o ciclo completar

#### 3. Conclusao automatica

Quando o carrinho retorna ao ponto de partida (ou alcanca o objetivo definido no `LevelConfig`), a fase e considerada completa. Nao ha botao de "concluir manually" — o proprio carrinho chegando dispara o fim.

---

### Painel de Comandos

Posicao: lateral direita em desktop, bottom sheet retravel em mobile.

Composicao:

- 6 slots fixos, preenchidos so com os controles relevantes da fase
- Fases iniciais mostram 1-2 controles; fases avancadas mostram ate 6
- Cada slot tem:
  - Icone do mecanismo
  - Nome curto (ex.: "Elevar", "Girar", "Abrir Ponte")
  - Estado visual (disponivel / ativo / aguardando / bloqueado)
  - Atalho de teclado (numero 1-6) visivel

Tipos de controle por slot — todos seguem o modelo hold-to-act:

- **Botao de acao unica** (ex.: elevar plataforma, abrir ponte): segura para ativar, solta para parar na posicao atual
- **Botao direcional** (ex.: rotacao da plataforma): seta esquerda/direita — segura para girar continuamente, solta para parar
- **Manivela continua** (ex.: rampa, helicoptero): arrastar mouse (desktop) ou gesto circular (mobile); segura para continuar girando, solta para parar; barra de progresso ou angulo visivel

---

### HUD durante a fase

- **Cronometro (stopwatch)**: mede o tempo decorrido desde o inicio, sem limite. Sempre presente, mas com exibicao discreta nas fases iniciais. Base para ranking futuro.
- **Contador de ciclos**: "Ciclo 1 de 1" — visivel apenas quando o objetivo requer mais de 1 ciclo
- **Indicador de colisoes**: bolinhas ou icones de dano — presente apenas em fases avancadas com dinamica de colisao; invisivel nas fases do Mundo 1
- **FeedbackLog**: mensagem flutuante rapida e contextual:
  - Carro bloqueado: indica qual mecanismo esta impedindo (sem dizer o que fazer)
  - Carro liberado: confirmacao visual/sonora breve
  - Colisao (fases avancadas): "Bateu!"
  - Ciclo completo: animacao de celebracao

---

### Tela de Conclusao de Fase

Exibida quando o ciclo e completado com sucesso.

Elementos:

- Animacao de estrelas (1, 2 ou 3 preenchendo)
- Resumo: tempo total, erros cometidos, comandos usados
- Frase educativa: o que o mecanismo que o jogador usou faz no mundo real (ex.: "Guindastes assim sao usados em portos para mover conteineres!")
- Acoes:
  - **Repetir** — tenta melhorar a pontuacao
  - **Proxima fase** — avanca (destravada automaticamente)
  - **Mapa** — volta ao seletor

---

### Tela de Falha

Exibida quando o jogador deixa o carrinho completamente preso (nenhuma acao possivel valida).

Elementos:

- Breve explicacao do que deu errado (ex.: "O carrinho nao consegue sair — a plataforma giratoria esta bloqueando a saida.")
- Acoes:
  - **Tentar de novo** (mais comum)
  - **Ver dica** (opcional, penaliza 1 estrela potencial)
  - **Mapa**

---

### Escopo MVP (3 fases do Mundo 1)

| Fase | O que o jogador faz                                                    | Mecanismo                       |
| ---- | ---------------------------------------------------------------------- | ------------------------------- |
| 1-1  | Aciona 1 botao para elevar a plataforma, carrinho completa ciclo curto | Plataforma elevatoria           |
| 1-2  | Abre a ponte, carrinho atravessa e retorna                             | Ponte elevadica                 |
| 1-3  | Eleva plataforma E depois abre ponte em sequencia                      | Plataforma + Ponte (mini-ciclo) |

Essas 3 fases cobrem o suficiente para portfólio:

- Tutorial organico (1 mecanismo por vez)
- Primeira sequencia (2 mecanismos em ordem)
- Loop visual completo

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

| Plataforma       | Controle                                                          |
| ---------------- | ----------------------------------------------------------------- |
| Desktop          | Mouse (clicar botoes, arrastar manivela) + atalhos numericos 1..6 |
| Mobile           | Toque em botoes + gesto circular na manivela                      |
| Gamepad (futuro) | Seleciona comando e confirma acao                                 |
