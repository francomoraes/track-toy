export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "test",
        "chore",
        "perf",
        "ci",
        "revert",
      ],
    ],

    "scope-enum": [
      1,
      "always",
      ["game-core", "web", "api", "db", "docs", "config", "deps", "ci"],
    ],
    "subject-case": [2, "always", "lower-case"],
    "subject-max-length": [2, "always", 100],
    "header-max-length": [2, "always", 120],
  },
};
