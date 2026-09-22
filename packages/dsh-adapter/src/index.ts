/**
 * Адаптер DSH: единственный исполняющий агентный Attempt через DSH SDK.
 * SDK DSH скрыт за интерфейсом адаптера и не «протекает» в ядро:
 * один Attempt → одна сессия DSH; операции capabilities/start/inspect/
 * events/submitInput/cancel/collect; ExecutionSnapshot и HarnessResult
 * (`completed` ≠ прохождение гейта).
 *
 * Плейсхолдер — см. docs/adr/ADR-0001-stack-and-host.md,
 * docs/adr/ADR-0003-domain-model.md и docs/hld.md.
 */

/** Имя пакета адаптера DSH. */
export const PACKAGE_NAME = "@dark-factory/dsh-adapter";
