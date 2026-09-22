/**
 * Ядро Dark Factory v4: детерминированный конвейер (Workflow Engine),
 * доменная модель (Change/Run/StageRun/Attempt), гейты и доработка,
 * единственный владелец состояния (SQLite).
 *
 * Плейсхолдер этапа 0.1 — см. docs/adr/ADR-0002-state-sqlite.md,
 * docs/adr/ADR-0003-domain-model.md и docs/hld.md.
 *
 * Границы пакета:
 * - ядро НЕ импортирует SDK DSH и других внешних исполнителей — только
 *   через адаптеры (см. docs/adr/ADR-0001-stack-and-host.md);
 * - ядро — единственный владелец состояния и единственный владелец
 *   процесса (см. docs/adr/ADR-0008-operator-cli.md).
 */

/** Имя пакета ядра (используется в smoke-тесте wiring воркспейса). */
export const PACKAGE_NAME = "@dark-factory/core";
