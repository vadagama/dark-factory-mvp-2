# Dark Factory v4 Constitution

## Core Principles

### I. Детерминированное ядро — единственный владелец процесса и состояния

Ядро фабрики (`packages/core`) — единственный источник решений: состояния этапов
(`accepted`), merge, доставка. Ядро детерминированно: нет второго LLM-оркестратора,
полномочия агентов ограничены попыткой. Канон оперативного состояния — SQLite
(ADR-0002): доменное изменение и событие — в одной короткой транзакции; второй
процесс run/resume — только через IPC к владельцу; event sourcing не нужен.
Идемпотентность по ключам: `operationKey` / `executionKey` / `commandId`.

### II. Внешние исполнители — только через адаптеры

DSH — зафиксированный движок исполнения, доступный только через TypeScript SDK,
скрытый в `packages/dsh-adapter`. Ядро не импортирует SDK; SDK-типы не протекают
в домен (ADR-0001). Границы Git / VCS / CI-CD / Deployment — адаптеры-модули
(ADR-0006), ядро не знает платформ. Не всё исполняется в DSH: тесты, схемы,
worktree — детерминированные операции ядра.

### III. Декларативный процесс: YAML — не язык программирования

Процесс описывается декларативно: YAML `apiVersion: factory/v1` (Process/Gate/
Policy/ProductProfile), Markdown-роли и инструкции, JSON Schema (ADR-0004).
В декларациях запрещены `eval`, выражения и вычислимая логика — вся логика живёт
в ядре (TypeScript). Этап — контракт (условия запуска, исполнитель, поручение,
результаты, принятие); этап сужает разрешения, не расширяет. Секреты в
декларациях — только ссылки.

### IV. Гейт — ровно 4 исхода

`GateResult` ∈ {`passed`, `rework_required`, `blocked`, `decision_required`}
(ADR-0005); других исходов нет, `GateResult` не выбирает следующий этап — выбор
у ядра по графу процесса. Check ≠ Finding ≠ Gate; evidence привязан к субъекту
(repository, commit, digests). Исчерпание лимита — `failed` решением ядра.
retry ≠ rework: технические повторы (`retry.max_attempts`) и циклы доработки
(`rework.max_cycles`, новая Attempt) не смешиваются (ADR-0003).
`completed` от DSH ≠ принятый результат: принятие — только через гейт.

### V. CLI-first операторский интерфейс

Оператор работает через `df` (`packages/cli`): `start / status / resume / cancel /
submit-input / submit-decision` (ADR-0008). Команды идемпотентны по `commandId`:
same+same → прежняя квитанция, same+diff → конфликт. Ответ на вопрос несёт версию
вопроса; ответ на устаревшую версию отклоняется. Ручные правки состояния SQLite
запрещены — только через API ядра.

### VI. Неизменяемые релизы

Релиз фабрики — неизменяемый комплект с манифестом (factoryVersion, sourceCommit,
artifactDigest, dshVersion, dependencyLockDigest, processPackDigest,
knowledgeCommit, stateSchemaVersion, harnessContractVersion, rollbackPolicy)
(ADR-0009). Установка/активация/откат — через launcher `df release`; откат =
возврат предыдущего артефакта, не пересборка. Откат программы ≠ откат действий
и данных: внешние эффекты не отменяются автоматикой.

### VII. Спека — Spec Kit, конвейер — ядро

SDD-процедуры Spec Kit (constitution/specify/clarify/plan/tasks/analyze/
implement/converge) исполняются агентом через DSH как этапы фабрики
(`instruction: provider: spec-kit`); Workflow Engine Spec Kit не используется —
владелец процесса только ядро (ADR-0007). Знание хранится рядом с кодом:
`specs/<change>/`, `baseline/`, `.factory/product.yaml`; дублировать канонические
источники запрещено; изменение baseline — отдельный этап с гейтом.

### VIII. Безопасность: секреты вне git

В коде, декларациях и тестах — только ссылки на секреты, значения подставляются
в момент исполнения и не попадают в логи; артефакты проходят redaction (ADR-0011).
Действия фабрики — от machine-аккаунта; роли allow/deny + write_scopes; этап
сужает разрешения. DSH не выдаются токены merge/production. TypeScript-интерфейс
не является границей безопасности: недоверенные плагины — вне процесса ядра
(ADR-0010); плагины не меняют таблицы ядра и не выставляют `accepted`.

## Архитектурные границы и качество

- `pnpm build` и `pnpm test` — зелёные перед завершением любой задачи.
- Канонические доменные типы — в `packages/contracts` (zod); ядро не дублирует их.
- Новая функциональность покрывается тестами; изменения поведения сопровождаются
  обновлением `docs/hld.md` и/или ADR.
- Ядро не зависит от CLI, плагинов и SDK DSH; направление зависимостей:
  `cli → core → contracts`, адаптеры реализуют порты `plugin-api`.
- Идентификаторы (`stageId`, `stageRunId`, `attemptId`, `executionKey`,
  `operationKey`, `commandId`) уникальны и журналируются.

## Процесс разработки и SDD

- Фичи ведутся через SDD-процедуры (`speckit-specify` → `speckit-clarify` →
  `speckit-plan` → `speckit-tasks` → `speckit-implement`); артефакты — в
  `specs/<change>/`.
- Ветки задач: `feat/t-NNN-<slug>`; коммиты — Conventional Commits
  (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`).
- SDD-фича живёт в ветке задачи по trunk-based модели: `speckit-specify` начинается
  с автоматического создания и пуша ветки от свежего `main` (до записи артефактов
  в `specs/`), завершение `speckit-implement` — открытием MR против `main`;
  merge — только человек (`docs/development-workflow.md`).
- Definition of Done: сборка и тесты зелёные; соответствие ADR; тесты на новую
  функциональность; обновлённые документы; отсутствие секретов.

## Governance

- Конституция старше прочих практик: при противоречии правится конституция или
  код, но не обходом.
- Изменение архитектурного решения — новый ADR или amendment существующего
  (`docs/adr/`), не молчаливая правка.
- Версионирование конституции: MAJOR — удаление/переопределение принципов;
  MINOR — новый принцип или существенное расширение; PATCH — уточнения формулировок.
- Каждый PR/ревью проверяет соответствие принципам I–VIII и границам из
  `AGENTS.md`.

**Version**: 1.1.0 | **Ratified**: 2026-09-22 | **Last Amended**: 2026-09-22
