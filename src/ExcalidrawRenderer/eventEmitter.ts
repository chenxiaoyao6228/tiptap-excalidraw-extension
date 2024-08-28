export class EventEmitter<T = any> {
  private events: { [K in keyof T]?: Array<(payload: T[K]) => void> } = {};

  on<K extends keyof T>(event: K, listener: (payload: T[K]) => void): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event]?.push(listener); // Safe usage with optional chaining
  }

  off<K extends keyof T>(event: K, listener: (payload: T[K]) => void): void {
    const eventListeners = this.events[event];
    if (!eventListeners) return;
    this.events[event] = eventListeners.filter((l) => l !== listener);
  }

  emit<K extends keyof T>(event: K, payload: T[K]): void {
    this.events[event]?.forEach((listener) => listener(payload)); // Safe usage with optional chaining
  }
}
