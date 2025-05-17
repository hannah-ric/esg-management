/**
 * Simple logger utility for consistent logging across the application
 * Centralizes logging and allows for future enhancements like remote logging
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LoggerOptions {
  enableConsole?: boolean;
  minLevel?: LogLevel;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private enableConsole: boolean;
  private minLevel: number;

  constructor(options: LoggerOptions = {}) {
    this.enableConsole = options.enableConsole ?? true;
    this.minLevel = LOG_LEVELS[options.minLevel ?? "debug"];
  }

  private shouldLog(level: LogLevel): boolean {
    return this.enableConsole && LOG_LEVELS[level] >= this.minLevel;
  }

  private formatMessage(message: string, data?: unknown): string {
    if (!data) return message;
    try {
      return `${message} ${typeof data === "object" ? JSON.stringify(data) : String(data)}`;
    } catch (e) {
      return `${message} [Unstringifiable data]`;
    }
  }

  debug(message: string, ...data: unknown[]): void {
    if (this.shouldLog("debug")) {
      console.debug(
        `[DEBUG] ${this.formatMessage(message, data[0])}`,
        ...data.slice(1),
      );
    }
  }

  info(message: string, ...data: unknown[]): void {
    if (this.shouldLog("info")) {
      console.info(
        `[INFO] ${this.formatMessage(message, data[0])}`,
        ...data.slice(1),
      );
    }
  }

  warn(message: string, ...data: unknown[]): void {
    if (this.shouldLog("warn")) {
      console.warn(
        `[WARN] ${this.formatMessage(message, data[0])}`,
        ...data.slice(1),
      );
    }
  }

  error(message: string, ...data: unknown[]): void {
    if (this.shouldLog("error")) {
      console.error(
        `[ERROR] ${this.formatMessage(message, data[0])}`,
        ...data.slice(1),
      );
    }
  }
}

// Export a singleton instance with default options
export const logger = new Logger({
  enableConsole: import.meta.env.DEV || import.meta.env.MODE === "development",
  minLevel: import.meta.env.PROD ? "info" : "debug",
});
