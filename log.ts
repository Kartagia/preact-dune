export class Logger {
  static log(message: string) {
    console.log('[%s]: %s', (new Date()).toISOString(), message)
  }
  static warn(message: string) {
    console.warn('[%s]: %s', (new Date()).toISOString(),message);
  }
  static error(message: string) {
    console.error('[%s]: %s', (new Date()).toISOString(),message);
  }
}
