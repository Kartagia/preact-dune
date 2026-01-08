
import { format } from "./format"

/**
 * A function outputting a log message.
 * 
 * @param template The template of the message.
 * @param args The template arguments. 
 */
export type LogFunction = (template: string, ...args: any[]) => void;

/**
 * The log function formatting a template into log string.
 * 
 * @param template The template of the message.
 * @param args The template arguments. 
 * @returns The string containing the formatted string.
 */
export type LogFormat = (template: string, ...args: any[]) => string;

/**
 * The tyep of default log levels taken from the Console. 
 */
export type LogLevel = "trace" | "debug" | "warn" | "info" | "error" | "fatal";

/**
 * The default log level.
 */
export const DEFAULT_LOG_LEVEL: LogLevel = "info";

/**
 * Log levels conntains list of the default log levels.
 */
export const LogLevels: ReadonlyArray<LogLevel> = Object.freeze(["trace", "debug", "warn", "info", "error", "fatal"]);

/**
 * Log level or default.
 */
export type LogLevelOrDefault<LEVEL extends (string | number | symbol)> = LEVEL | "default";

/**
 * The logger class is a logging interface similar to the console.
 */
export class Logger<LEVEL extends string | number | symbol = LogLevel> {
  static log(template: string, ...args: any[]) {
    console.info('[%s]: ' + template, (new Date()).toISOString(), ...args)
  }
  static warn(template: string, ...args: any[]) {
    console.warn('[%s]: ' + template, (new Date()).toISOString(), ...args);
  }
  static error(template: string, ...args: any[]) {
    console.error('[%s]: ' + template, (new Date()).toISOString(), ...args);
  }

  readonly levels: Readonly<Record<LogLevelOrDefault<LogLevel>, LogLevelOrDefault<LEVEL>>>;

  readonly streams: Readonly<Record<LogLevelOrDefault<LEVEL>, LogFunction>>;

  constructor(
    levelMap: Readonly<Record<LogLevelOrDefault<LogLevel>, LogLevelOrDefault<LEVEL>>>,
    streams: Readonly<Record<LogLevelOrDefault<LEVEL>, LogFunction>> = { default: console.log } as Readonly<Record<LogLevelOrDefault<LEVEL>, LogFunction>>
  ) {
    this.levels = Object.freeze({ ...levelMap, default: (levelMap.default) });
    this.streams = streams;
  }

  levelStream(level: LogLevelOrDefault<LEVEL>): (
    undefined | LogFunction
  ) {
    return this.streams[level] ?? this.streams.default;
  }

  add(level: LogLevelOrDefault<LEVEL>, template: string, ...args: any[]) {
    const out = this.levelStream(level);
    out?.("[%s][%s]: " + template, (new Date()).toISOString(), level, ...args);
  }

  error(template: string, ...args: any[]) {
    const level = this.levels.error;
    if (level) this.add(level, template, ...args);
  }
  info(template: string, ...args: any[]) {
    const level = this.levels.info;
    if (level) this.add(level, template, ...args);
  }
  warn(template: string, ...args: any[]) {
    const level = this.levels.warn;
    if (level) this.add(level, template, ...args);
  }
  trace(template: string, ...args: any[]) {
    const level = this.levels.trace;
    if (level) this.add(level, template, ...args);
  }
  debug(template: string, ...args: any[]) {
    const level = this.levels.debug;
    if (level) this.add(level, template, ...args);
  }
  fatal(template: string, ...args: any[]) {
    const level = this.levels.fatal;
    if (level) this.add(level, template, ...args);
  }
  log(template: string, ...args: any[]) {
    const level = this.levels.default;
    if (level) this.add(level, template, ...args);
  }
}

export class GroupingLogger<LEVEL extends string|number|symbol = LogLevel> extends Logger<LEVEL> {
  protected groupFunctions: { open: (title: string, collapsed: boolean) => void; close: (title: string) => void; };

  constructor(
    levelMap: Readonly<Record<LogLevelOrDefault<LogLevel>, LogLevelOrDefault<LEVEL>>>,
    groupFunctions: { open: (title: string, collapsed: boolean) => void, close: (title: string) => void },
    streams: Readonly<Record<LogLevelOrDefault<LEVEL>, LogFunction>> = { default: console.log } as Readonly<Record<LogLevelOrDefault<LEVEL>, LogFunction>>
  ) {
    super(levelMap, streams);
    this.groupFunctions = groupFunctions;
  }

  group(): void;
  group(template: string, ...args: string[]): void;
  group(template?: string, ...args: string[]): void {
    if (arguments.length === 0 || template === undefined) {
      this.groupFunctions.open(template ?? "", false);
    } else {
      const title = this.groupFunctions.open(format(template, ...args), false);
    }
  }

  groupEnd(): void;
  groupEnd(title: string): void;
  groupEnd(title?: string): void {
    if (arguments.length === 0 || title === undefined) {
      this.groupFunctions.close(title ?? "");
    } else {
      this.groupFunctions.close(title);
    }
  }
}


export function defaultConsoleLogger<LEVEL extends (string|number|symbol) = LogLevel>(): GroupingLogger<LEVEL> {
  return new GroupingLogger(
    LogLevels.reduce(
      (res: Readonly<Record<LogLevelOrDefault<LogLevel>, LogLevelOrDefault<LEVEL>>>, level: LogLevelOrDefault<LogLevel>) => ({
        ...res,
        [level]: level
      }),
      { default: DEFAULT_LOG_LEVEL } as Readonly<Record<LogLevelOrDefault<LogLevel>, LogLevelOrDefault<LEVEL>>>
    ),
    {
      open: (title: string, collapsed) => collapsed ? console.groupCollapsed(title) : console.group(title),
      close: console.groupEnd
    },
    LogLevels.reduce(
      (res: Readonly<Record<LogLevelOrDefault<LEVEL>, LogFunction>>, level: LogLevelOrDefault<LogLevel>) => ({
        ...res,
        ...(level in console ? { [level]: (level != "default" && level in console ? (console[level] as LogFunction) : console.info) } : {})
      }), { default: console.log } as Readonly<Record<LogLevelOrDefault<LEVEL>, LogFunction>>
    )
  );
}

export class FormatLog<LEVEL extends (string|number|symbol)= LogLevel>
  extends Logger<LEVEL> {

  /**
   * The formatter of the logger.
   */
  format: LogFormat;

  constructor(
    levelMap: Readonly<Record<LogLevel | "default", LEVEL>>,
    format: LogFormat
  ) {
    super(levelMap);
    this.format = format;
  }

  levelStream(level: LEVEL): LogFunction {
    return (template, ...args) => {
      super.levelStream(level)?.("%s", this.format(template, ...args));
    }
  }

  add(level: LEVEL, template: string, ...args: any[]) {

  }
}