/**
 * Операторский CLI фабрики (`df`): start/status/resume/cancel/submit-input/
 * submit-decision, идемпотентность по commandId, release-команды
 * (`df release install/activate/status/rollback`).
 *
 * CLI — тонкий клиент над ядром: без собственной логики и состояния,
 * единственный владелец процесса — ядро (второй run/resume — через IPC).
 *
 * Плейсхолдер — см. docs/adr/ADR-0008-operator-cli.md и docs/hld.md.
 */

/** Имя бинарника CLI фабрики. */
export const CLI_NAME = "df";
