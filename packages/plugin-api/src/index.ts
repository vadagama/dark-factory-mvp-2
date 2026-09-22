/**
 * Контракты точек расширения фабрики: Plugin API `factory.plugin/v1`,
 * интерфейсы адаптеров (Harness/VCS/Delivery/Workspace/Instruction/Observer).
 *
 * Plugin API — декларация возможностей (манифест: id, entrypoint, requires,
 * provides, configSchema, requestedPermissions), а не граница безопасности:
 * недоверенные плагины выполняются вне процесса ядра.
 *
 * Плейсхолдер — см. docs/adr/ADR-0010-plugins.md (плагины не меняют таблицы
 * ядра, не выставляют accepted, не запускают следующий этап) и
 * docs/adr/ADR-0011-security.md (TypeScript-интерфейс — не граница
 * безопасности).
 */

/** Версия Plugin API, поддерживаемая этой версией фабрики. */
export const PLUGIN_API_VERSION = "factory.plugin/v1";
