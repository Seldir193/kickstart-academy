//src\app\admin\(app)\customers\dialogs\cancelDialog\formatters.ts
export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
