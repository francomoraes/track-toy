// commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Tipos permitidos
    'type-enum': [
      2,
      'always',
      [
        'feat',     // nova funcionalidade
        'fix',      // correção de bug
        'docs',     // mudanças em documentação
        'style',    // formatação, sem mudança de lógica
        'refactor', // refatoração sem feat/fix
        'test',     // adição ou correção de testes
        'chore',    // build, config, dependências
        'perf',     // melhoria de performance
        'ci',       // mudanças em CI/CD
        'revert',   // reverter commit anterior
      ],
    ],
    // Escopo opcional mas recomendado
    'scope-enum': [
      1, // warn (não obrigatório ainda — expandir conforme monorepo crescer)
      'always',
      [
        'game-core',
        'web',
        'api',
        'db',
        'docs',
        'config',
        'deps',
        'ci',
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 100],
    'header-max-length': [2, 'always', 120],
  },
};
