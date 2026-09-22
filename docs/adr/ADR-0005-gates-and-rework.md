# ADR-0005: Гейты и циклы доработки

## Статус

Принято (инициализация репозитория, 2026-09-22).

## Основание

Notion v4: [«Проверки, гейты и цикл доработки» (стр. 7)](../sources/notion-v4/07-gates-and-rework.md),
[«Ядро Dark Factory» (стр. 2)](../sources/notion-v4/02-core.md);
анализ §5; must-keep 2, 3, 6.

## Контекст

Гейт — точка решения ядра: принять результат этапа, потребовать доработку, заблокировать
или эскалировать человеку. Нужно строгое различение проверок, находок и вердиктов,
иначе «зелёные» проверки путаются с решениями.

## Решение

- **Check ≠ Finding ≠ Gate**:
  - `Check` — конкретная выполненная проверка с результатом;
  - `Finding` — объект-находка (id, source, severity, status, expected/actual),
    созданный проверкой или гейтом;
  - `Gate` — решение ядра по совокупности проверок/находок и политик.
- **Ровно 4 исхода `GateResult`**: `passed | rework_required | blocked |
  decision_required`. Приоритет причин: `blocked → decision_required →
  rework_required → passed`.
- **Исчерпание лимита** (`rework.max_cycles`) → исход `failed` решением ядра,
  а не новым прогоном гейта.
- **Evidence привязан к субъекту**: repository, commit, spec_digest, contracts_digest —
  вердикт всегда ссылается на конкретное состояние.
- **Check-типы MVP**: `artifact-exists`, `schema-valid`, `execution-succeeded`,
  `field-equals`, `same-subject`, `no-open-findings`, `human-decision`.
- **`addressed` ≠ закрыто**: находка считается закрытой только по статусу в
  `FindingStore`; пометка «обработано» её не закрывает.
- **Доработка = новая Attempt** (новая сессия DSH) в цикле rework, лимит
  `rework.max_cycles` на StageRun; retry (технический повтор) — отдельно (ADR-0003).
- **В Gate запрещены свободные выражения**: условия — только декларативные check-типы
  и политики (YAML не язык программирования, ADR-0004).
- **Локальные проверки — первичный источник**, CI — канал доставки и независимое
  подтверждение; merge gate ≠ delivery gate (ADR-0006).
- **Модули MVP ядра**: `CheckRunner`, `GateEvaluator`, `FindingStore`, `ReworkController`.

## Последствия

- Вердикты машиночитаемы и аудируемы: каждый verdict ссылается на evidence и findings.
- Ядро не доверяет `completed` от DSH: результат Attempt становится принятым только
  через гейт.
- Расширение check-типов — через плагины наблюдения/проверок (ADR-0010), не через
  выражения в YAML.
