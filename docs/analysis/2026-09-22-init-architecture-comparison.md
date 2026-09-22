# Анализ инициализации dark-factory-mvp-2: архитектура v4

- **Дата**: 2026-09-22
- **Статус**: черновик для обсуждения — открытые вопросы (§4) и состав ADR (§5) требуют утверждения;
  Q3/Q4 утверждены 2026-09-22 (§4 обновлён, добавлен ADR-0013)
- **Ветка**: `init`
- **Источники**:
  - Notion «Архитектура v4» (2026-09-21, 12 страниц) — самое свежее видение, база нового проекта;
  - `dark-factory-mvp`: `docs/hld-v4.md` (2026-09-20), `docs/core-v4.md` (2026-09-20), черновики ADR-051…058;
  - `dark-factory-mvp`: v1-документация и код (Python-ядро) — только как источник must-keep.

---

## 1. Цель

Инициализировать новый репозиторий `dark-factory-mvp-2` как greenfield-реализацию Dark Factory v4:
TypeScript-ядро + DSH как движок исполнения + Spec Kit как SDD-слой. Не переносить концепции v1,
противоречащие новой архитектуре; непротиворечащие детали переносить в виде новых ADR после утверждения.

## 2. Сравнение трёх версий архитектуры

| Измерение | v1 (dark-factory-mvp, live) | hld-v4/core-v4 (черновик 09-20) | Notion v4 (09-21, база mvp-2) |
|---|---|---|---|
| Язык/хост | Python, модульный монолит | TypeScript, Node 24, Cordis-сервис в хосте DSH | TypeScript, отдельное приложение; Cordis в ядро не встраивается |
| Состояние | PostgreSQL (state store) | Git + `events.jsonl` — канон; SQLite — перестраиваемая проекция | **SQLite — канон** оперативного состояния + компактный журнал событий в SQLite; backup вместо rebuild |
| Процесс | Код стадий + pydantic-graph | Декларативный `flow.yaml` + валидатор | YAML Process/Gate/Policy/Profile + MD роли/инструкции; executor'ы harness/command/integration/gate |
| Домен | Change, стадии, попытки | ~80% домена v2/v3 + worktree-приёмка | Change/Run/StageRun/Attempt/Artifact/Workspace/ExternalOperation/Question/Decision; generation; retry ≠ rework |
| SDD | Native SDD Core (ADR-020) + Spec Kit bootstrap | Spec Kit as-is + OKF-расширение (factory-okf) | Spec Kit as-is: 3 маршрута (Assessment/SDD/BugFixing); baseline/ рядом с кодом; OKF не требуется |
| DSH | PydanticAI за HarnessPort (не DSH) | DSH-хост, механики DSH внутри попытки (ADR-058) | DSH через TypeScript SDK за адаптером; Attempt → одна сессия DSH; структурированный отчёт файл-протоколом |
| Оператор | FastAPI + React Console | DSH Web-плагин + локальный endpoint (ADR-055) | **CLI-first** (6 команд, без постоянного сервера); Console — будущая |
| Гейты | Код-гейты стадий | Гейты по evidence + риск-политика R0–R3 | Check ≠ Finding ≠ Gate; GateResult: passed/rework_required/blocked/decision_required; evidence на версиях |
| Git/доставка | GitLab CI, GitOps Argo | GitHub-first (ADR-019), локальные проверки primary | 4 границы адаптеров (Git/VCS/CI-CD/Deployment); ветки `factory/change-NN/...`; merge gate ≠ delivery gate; последовательная очередь интеграции |
| Релизы фабрики | Helm/Argo | — (не описано) | Monorepo, неизменяемый релиз-комплект с манифестом, launcher `df release`, стабильные этапы 0.1–0.6 |
| Плагины | — | 11 пакетов `factory-*` | 2 уровня (фабрика/DSH), минимальный Plugin API, границы доверия; пакеты `packages/contracts`, `packages/plugin-api` |

Вывод: Notion v4 — более новая и более детальная проработка того же замысла, что hld-v4;
она заменяет спорные инфраструктурные решения (канон состояния, хост, операторский интерфейс)
и добавляет недостающие (доставка, релизы, плагины). hld-v4 ценен как источник must-keep.

## 3. Что не переносится из v1

По смыслу ADR-056 (подтверждено Notion v4): Python-код `src/`, PydanticAI/Pydantic, FastAPI,
PostgreSQL, React Console, Helm/Argo/K8s-деплой, Native SDD Core как каноническая модель,
пилотный сценарий `prd-calc` (заменён сценариями из Notion стр. 9).

Переносится по смыслу (без копирования файлов): скиллы в формате Agent Skills (уже установлены
через Spec Kit), конвенции AGENTS.md/DoD, каталог текстов ролей/инструкций/чек-листов — как
будущий Process Pack, ADR-база по смыслу (см. §5).

## 4. Открытые вопросы — предлагаемые ответы

| # | Вопрос | Варианты | Рекомендация | Обоснование |
|---|---|---|---|---|
| Q1 | **Канон состояния** | (а) SQLite-канон (Notion); (б) Git + `events.jsonl` канон, SQLite — проекция (ADR-053) | **(а) SQLite-канон** | Notion новее и детальнее: доменное изменение + событие в одной транзакции, протокол записи артефактов (temp→validate→rename→register), `prepared/unknown` статусы внешних операций, backup вместо rebuild. Отказ от rebuild-теста — осознанная потеря, компенсируется 8 сценариями восстановления (Notion стр. 10 §9). Журнал событий остаётся в SQLite — проекции/rebuild можно добавить позже |
| Q2 | **Хост ядра** | (а) Отдельное приложение (Notion); (б) Cordis-сервис в DSH (ADR-051) | **(а) Отдельное приложение** | Notion: «фабрика может оставаться отдельным приложением и не встраивать Cordis в собственное ядро»; DSH — зафиксированный движок за SDK-адаптером. Проще MVP: один процесс, локальный IPC. Cordis — форма поставки в будущем |
| Q3 | **Интерфейс оператора MVP** | (а) CLI-first (Notion); (б) DSH Web-плагин + endpoint (ADR-055) | **(а) CLI-first** | 6 команд (start/status/resume/cancel/submit-input/submit-decision), без постоянного HTTP-сервера; второй процесс — через IPC к владельцу. Console — после MVP (снимок + события по sequence уже предусмотрены). Утверждено 2026-09-22; инструментарий CLI зафиксирован в ADR-0013 (Commander + Clack, Ink — позже) |
| Q4 | **VCS-платформа первой** | (а) GitHub (ADR-019); (б) GitLab (примеры Notion: `small.vcs-gitlab`, GitLab CI/MR) | **(а) GitHub** — утверждено 2026-09-22 | Первым — GitHub; VCS Provider-адаптер допускает GitHub или GitLab в зависимости от задачи/продукта — платформа выбирается конфигурацией, ядро знает только контракт адаптера (ADR-0006). GitLab — второй целевой provider (примеры Notion: SMALL-контекст, e-commerce, OMS/WMS/кассы/1С) |
| Q5 | **Критерий готовности MVP-2** | (а) Фича Go/React + багфикс до тест-сервера (Notion стр. 9); (б) сквозной `prd-calc` (v1 M4) | **(а)** | Notion: «разработка небольшой фичи существующего Go/React-продукта и исправление воспроизводимого дефекта. Оба должны дойти до тестового сервера с подтверждением результата» |
| Q6 | **OKF-слой (ADR-054)** | (а) Не переносить: baseline/ рядом с кодом + фронтматтер + валидация в гейтах; (б) переносить factory-okf | **(а)** | Notion заменяет OKF-проекцию каталогом `baseline/` + `baseline-impact.md` + `.factory/product.yaml` + гейтом согласованности. Базовые проверки (уникальность id, разрешимость ссылок, покрытие задачами) — check-типы гейтов. factory-okf — по потребности после пилота |
| Q7 | **DecisionPort (ADR-057)** | (а) Отложить; (б) переносить | **(а) Отложить** | Notion не требует семантического decision-слоя: решения — через Question/submit-decision и политики риска. Вернуться после пилота |
| Q8 | **Имя репозитория** | (а) `dark-factory-mvp-2` (факт); (б) `dark-factory` (ADR-056, Notion стр. 11) | **(а)** | Репозиторий уже создан; имя пакетов внутри от внешнего имени не зависит. Переименование — отдельное решение позже |
| Q9 | **Риск-классы R0–R3 (ADR-023)** | переносить по смыслу / нет | **Переносить** | Согласуется с Notion: политика риска в гейтах решает auto/human merge и delivery |
| Q10 | **Механики DSH внутри попытки (ADR-058)** | переносить по смыслу / нет | **Переносить** как hints в HarnessRequest при поддержке HarnessCapabilities | Не противоречит Notion (DSH-плагины, capabilities); сверить с фактическим SDK при реализации 0.1 |
| Q11 | **Must-keep v1 (11 принципов)** | переносить / нет | **Переносить** в тексте новых ADR | Все 11 согласуются с Notion v4; см. §5 ADR-0011 и распределение по ADR |

## 5. Состав ADR нового репозитория — на утверждение

Нумерация начинается заново. Каждый ADR опирается на соответствующую страницу Notion v4;
must-keep и переносимые по смыслу решения v1 вписаны в текст.

| Новый ADR | Содержание | Основание | Заменяет/переносит |
|---|---|---|---|
| ADR-0001 | Стек и хост: TypeScript/Node 24, отдельное приложение (не Cordis), pnpm, zod, Vitest; DSH через SDK за HarnessAdapter | Notion стр. 1, 4, 11 | ADR-051 (частично), ADR-052 (частично) |
| ADR-0002 | Состояние: SQLite — канон, компактный журнал событий в SQLite, backup-протокол; Git — версии файлов; идемпотентность operationKey/executionKey/commandId | Notion стр. 1, 8, 10 | ADR-053 (не переносится), must-keep 8 |
| ADR-0003 | Модель домена: Change/Run/StageRun/Attempt/Artifact/Workspace/ExternalOperation/Question/Decision; generation; retry ≠ rework; один владелец состояния | Notion стр. 2, 6, 10 | must-keep 1–3 |
| ADR-0004 | Декларативный процесс: YAML Process/Gate/Policy/ProductProfile + MD Role/Instruction/Skill; executor'ы harness/command/integration/gate; валидация и снимок конфигурации; YAML — не язык программирования | Notion стр. 3, 12 | ADR-052, must-keep 4, 9 |
| ADR-0005 | Гейты и проверки: Check ≠ Finding ≠ Gate; GateResult; evidence привязан к commit/digest; локальные проверки — первичный источник, CI — доставка | Notion стр. 3, 7 | must-keep 2, 3, 6 |
| ADR-0006 | Интеграции и доставка: Git/VCS/Delivery адаптеры; ветки `factory/change-NN/...`; последовательная очередь интеграции; merge gate ≠ delivery gate; DeliveryAdapter-контракт | Notion стр. 8 | ADR-019 (переносится: GitHub-first — Q4 утверждён), must-keep 8, 10 |
| ADR-0007 | Спека и baseline: Spec Kit as-is (Assessment/SDD/BugFixing), workflow engine не используется; baseline/ рядом с кодом, `.factory/product.yaml`, фронтматтер, гейт согласованности baseline | Notion стр. 5, 9 | ADR-054 (не переносится; OKF — по Q6) |
| ADR-0008 | Оператор: CLI-first, 6 команд, commandId-идемпотентность; Console — после MVP | Notion стр. 10 | ADR-055 (не переносится) |
| ADR-0009 | Релизная модель: monorepo `packages/*`, манифест релиза, launcher, стабильные этапы 0.1–0.6; rollback-политика; изоляция кандидата | Notion стр. 11, 12 | ADR-056 (имя — по Q8) |
| ADR-0010 | Плагины: 2 уровня (фабрика/DSH), минимальный Plugin API (манифест, namespace, разрешения-декларации), границы доверия; недоверенные — вне процесса | Notion стр. 12 | — |
| ADR-0011 | Безопасность: machine-аккаунт, роли allow/deny + write_scopes, untrusted продуктовый слой, redaction, секреты вне git; TypeScript-интерфейс — не граница безопасности | Notion стр. 4, 12 + must-keep 5, 10 | must-keep 5, 7, 10 |
| ADR-0012 | Переносимые решения v1: риск-классы (Q9), механики DSH (Q10), VCS-first GitHub (Q4, утверждено 2026-09-22) | ADR-019, ADR-023, ADR-058 по смыслу | — |
| ADR-0013 | Инструментарий CLI: Commander + Clack в MVP; Ink — позже (интерактивный чат с агентами); oclif/OpenTUI — не сейчас; плагины отделены от CLI-команд | Notion-страница «CLI» (2026-09-22), Q3 | — (дополнение к ADR-0008) |

**Не переносятся** (противоречат Notion v4 или поглощены): ADR-051 (Cordis-хост), ADR-053
(events.jsonl-канон), ADR-054 (OKF-канонический слой), ADR-055 (оператор в DSH), ADR-057
(DecisionPort — отложено), ADR-020/Native SDD Core.

## 6. Предлагаемая структура репозитория (на момент 0.1–0.2)

```text
dark-factory-mvp-2/
├── AGENTS.md                  # правила конвейера v4 (создать после утверждения ADR)
├── README.md
├── docs/
│   ├── adr/                   # ADR-0001… (после утверждения §5)
│   ├── analysis/              # этот документ
│   └── hld.md                 # HLD v4, канонизированный из Notion (после ADR)
├── packages/
│   ├── contracts/             # канонические доменные контракты (zod)
│   ├── core/                  # ядро: Run/StageRun/Attempt, планирование, гейты
│   ├── plugin-api/            # публичная поверхность расширений
│   ├── cli/                   # factory CLI
│   └── dsh-adapter/           # HarnessAdapter на DSH SDK
├── plugins/factory/           # vcs, delivery, workspace, context
├── plugins/dsh/               # только при подтверждённом пробеле SDK
├── processes/  roles/  instructions/  skills/  gates/  policies/  schemas/
├── tests/contracts/
├── releases/                  # манифесты релизов
├── .specify/                  # Spec Kit (установлен)
└── .agents/skills/speckit-*   # SDD-скиллы (установлены)
```

Не создаётся сейчас: `dark-factory-knowledge`, `dark-factory-gitops` (отдельные репо позже,
Notion стр. 11), `baseline/` (живёт в продуктовых репозиториях).

## 7. Дорожная карта

Стабильные этапы (Notion стр. 11) как верхний уровень:

| Этап | Содержание | Условие стабильности |
|---|---|---|
| 0.1 Исполнение | CLI → адаптер → DSH → структурированный результат | Повторяемый запуск, диагностика, отмена |
| 0.2 Процесс | Фазы, артефакты, гейты, SQLite-состояние | Возобновление с границы фазы после сбоя |
| 0.3 Разработка | Worktree, Spec Kit, проверки, ограниченный цикл доработки | Одна небольшая фича проходит весь цикл |
| 0.4 Релизы | Неизменяемые комплекты, launcher, checkpoints | Проверенный возврат на предыдущую версию |
| 0.5 Параллельность | Несколько запусков, ограничения ресурсов, изоляция | Нет смешения состояния и рабочих каталогов |
| 0.6 Доставка | VCS/MR, CI/CD, развёртывание | Раздельно проверены выпуск фабрики и продукта |

Критерий MVP-2 (Q5): небольшая фича существующего Go/React-продукта и воспроизводимый
багфикс — оба доходят до тестового сервера с подтверждением результата.

## 8. Что уже сделано в ветке `init`

- Ветка `init` создана от `main` (origin: `github.com/vadagama/dark-factory-mvp-2`).
- Spec Kit v1.0.6 развёрнут: `.specify/` (шаблоны, скрипты sh, workflows) + `.agents/skills/speckit-*` (10 скиллов, интеграция zed).
- Этот документ анализа.

## 9. Следующие шаги (после утверждения §4/§5)

1. Записать утверждённые ADR-0001…0013 в `docs/adr/` + канонизировать HLD v4 в `docs/hld.md`.
2. Создать `AGENTS.md` нового репо (конвейер, DoD, ветки `feat/t-NNN-<slug>`).
3. `/speckit-constitution` — конституция проекта v4.
4. `/speckit-specify` фичи 001 — этап 0.1 «Исполнение» (CLI → адаптер → DSH → результат).
5. Далее по пайплайну: plan → tasks → implement; связывание ядра с DSH.
