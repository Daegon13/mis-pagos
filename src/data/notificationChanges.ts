const listeners = new Set<() => void>();
export function notificationDataChanged() { for (const listener of listeners) listener(); }
export function subscribeNotificationChanges(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
