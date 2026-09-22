# Architecture Decision Records

Нумерация начата заново для Dark Factory v4. Каждый ADR опирается на страницу Notion v4
и анализ `docs/analysis/2026-09-22-init-architecture-comparison.md` (§4 — вопросы, §5 — состав).

| ADR | Название | Статус | Ключевые решения |
|---|---|---|---|
| [ADR-0001](ADR-0001-stack-and-host.md) | Стек и хост фабрики | Принято (2026-09-22) | TypeScript/Node 24, отдельное приложение (Q2), pnpm-воркспейс, zod, Vitest; DSH через SDK за адаптером; 9 слоёв одного процесса |
| [ADR-0002](ADR-0002-state-sqlite.md) | Состояние — SQLite как канон | Принято (2026-09-22) | SQLite-канон (Q1), короткие транзакции, идемпотентность operationKey/executionKey/commandId, backup вместо rebuild |
| [ADR-0003](ADR-0003-domain-model.md) | Модель домена ядра | Принято (2026-09-22) | Change/Run/StageRun/Attempt, generation, retry ≠ rework, гейт внутри ядра, автооткат запрещён |
| [ADR-0004](ADR-0004-declarative-process.md) | Декларативный процесс | Принято (2026-09-22) | YAML `factory/v1` + MD-роли, снимок конфигурации на Run, YAML — не язык программирования |
| [ADR-0005](ADR-0005-gates-and-rework.md) | Гейты и циклы доработки | Принято (2026-09-22) | Check ≠ Finding ≠ Gate, 4 исхода GateResult, evidence к commit/digest, доработка = новая Attempt |
| [ADR-0006](ADR-0006-integrations-and-delivery.md) | Интеграции и доставка | Принято (2026-09-22) | 4 границы адаптеров, merge gate ≠ delivery gate, автономный merge — 5 условий, GitHub-first + мульти-VCS адаптер (Q4) |
| [ADR-0007](ADR-0007-spec-kit-and-baseline.md) | Spec Kit и baseline | Принято (2026-09-22) | SDD-процедуры через DSH, маршруты Assessment/SDD/BugFixing, baseline/ рядом с кодом, OKF не переносится (Q6) |
| [ADR-0008](ADR-0008-operator-cli.md) | Операторский интерфейс — CLI-first | Принято (2026-09-22) | CLI `df` (Q3), 6 команд, commandId-идемпотентность, Console — после MVP |
| [ADR-0009](ADR-0009-release-model.md) | Релизная модель фабрики | Принято (2026-09-22) | Неизменяемый комплект + манифест, launcher `df release`, стадии 0.1–0.6 |
| [ADR-0010](ADR-0010-plugins.md) | Плагины и точки расширения | Принято (2026-09-22) | 2 уровня плагинов, `factory.plugin/v1`, порты, composition root, недоверенные — вне процесса |
| [ADR-0011](ADR-0011-security.md) | Безопасность и доверие | Принято (2026-09-22) | Machine-аккаунт, allow/deny + write_scopes, секреты вне git, DSH без токенов merge/production |
| [ADR-0012](ADR-0012-carried-decisions.md) | Переносимые решения v1 | Принято (2026-09-22) | Q4 GitHub-first, Q6 без OKF, Q7 DecisionPort отложен, Q9 риск-классы R0–R3, Q10 механики DSH как hints |
| [ADR-0013](ADR-0013-cli-toolkit.md) | Инструментарий CLI оператора | Принято (2026-09-22) | Commander + Clack в MVP, Ink — позже (чат с агентами); oclif/OpenTUI — не сейчас; плагины отделены от CLI-механизма |

Не переносятся из v1 (см. анализ §5): ADR-051 (Cordis-хост), ADR-053 (events.jsonl-канон),
ADR-054 (OKF), ADR-055 (оператор в DSH), ADR-057 (DecisionPort), ADR-020 (Native SDD Core).

Переносятся по смыслу из v1 (решения зафиксированы в ADR-0012): ADR-019 (VCS-first → Q4,
GitHub-first в ADR-0006), ADR-023 (риск-классы R0–R3 → Q9), ADR-058 (механики DSH внутри
попытки как hints в HarnessRequest → Q10).

Изменение принятого решения — новый ADR или amendment существующего.
