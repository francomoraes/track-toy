# Track Toy — Visão Geral do Projeto

> Jogo educativo infantil inspirado em brinquedos do tipo "Pista Montessori", com fases de dificuldade crescente, renderização 3D e dois modos de uso: aberto (sem login) e autenticado (persistência em nuvem).

---

## Objetivo do Projeto

- Portfólio técnico com stack moderna e bem justificada
- Estudo prático de renderização 3D com React (React Three Fiber)
- Estudo de monorepo, NestJS, bancos mistos (relacional + não-relacional)
- Produto real e jogável, com duas experiências distintas

---

## Modos de Uso

| Modo            | Auth                | Persistência   | Funcionalidades                                                     |
| --------------- | ------------------- | -------------- | ------------------------------------------------------------------- |
| **Aberto**      | Não                 | `localStorage` | Jogar, salvar progresso local, ver fases                            |
| **Autenticado** | Sim (OAuth / Email) | Banco de dados | Sincronização em nuvem, histórico, ranking, save entre dispositivos |

---

## Conceito do Jogo

O jogador controla um carrinho numa pista 3D isométrica/top-down.
Cada fase introduz um conceito educativo (cores, números, formas geométricas, sequências lógicas) e um nível de dificuldade mecânico (velocidade, obstáculos, bifurcações).

### Pilares de Design

1. **Acessibilidade**: funciona no browser, sem instalação
2. **Progressividade**: onboarding suave, curva de aprendizado clara
3. **Feedback visual rico**: 3D com física leve, efeitos de partículas
4. **Mobile-first**: controles touch + teclado

---

## Links Internos

- [01 — Arquitetura e Stack](./01-arquitetura-stack.md)
- [02 — Estrutura do Monorepo](./02-monorepo-estrutura.md)
- [03 — Design do Banco de Dados](./03-banco-de-dados.md)
- [04 — Design das APIs](./04-api-design.md)
- [05 — Design do Jogo (GDD)](./05-game-design.md)
- [06 — Estratégia de Testes (TDD)](./06-testes.md)
- [07 — Docker e Ambiente Local](./07-docker.md)
- [08 — CI/CD e Deploy](./08-cicd-deploy.md)
- [09 — Roadmap de Desenvolvimento](./09-roadmap.md)
