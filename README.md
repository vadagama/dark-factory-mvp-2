# dark-factory-mvp-2

Dark Factory v4 — агентная фабрика разработки: TypeScript-ядро + DSH как движок исполнения
(за SDK-адаптером) + Spec Kit как SDD-слой.

Ядро — детерминированный владелец процесса и состояния (SQLite): Change'и, этапы,
агентные попытки в DSH, гейты с четырьмя исходами, ограниченные циклы доработки,
операторский CLI `df`.

## Документация

- [docs/hld.md](docs/hld.md) — канонический HLD v4 (слои, домен, контракты, гейты)
- [docs/adr/index.md](docs/adr/index.md) — ADR-0001…0013 (стек, состояние, домен, процесс,
  гейты, интеграции, Spec Kit, CLI + инструментарий CLI, релизы, плагины, безопасность, переносы v1)
- [docs/analysis/2026-09-22-init-architecture-comparison.md](docs/analysis/2026-09-22-init-architecture-comparison.md) —
  анализ инициализации и открытые вопросы
- [AGENTS.md](AGENTS.md) — правила агентной разработки (карта репо, DoD, границы)
- [.specify/memory/constitution.md](.specify/memory/constitution.md) — конституция проекта

## Структура

```text
packages/
  contracts/      # доменные контракты (zod)
  core/           # ядро: домен, планирование, гейты, состояние
  plugin-api/     # публичная поверхность расширений
  cli/            # операторский CLI `df`
  dsh-adapter/    # HarnessAdapter на DSH SDK
docs/             # hld, adr, analysis
.specify/         # Spec Kit (SDD-процедуры)
```

## Quickstart

```bash
corepack enable     # если pnpm не установлен (Node 24, см. .nvmrc)
pnpm install
pnpm build
pnpm test
```

## Стадии MVP

0.1 Исполнение → 0.2 Процесс → 0.3 Разработка → 0.4 Релизы → 0.5 Параллельность →
0.6 Доставка (детали — `docs/adr/ADR-0009-release-model.md`).
