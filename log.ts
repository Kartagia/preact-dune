
import {format} from "./format"

export type LogFunction = (template: string, ...args: any[]) => void;

export type LogFormat = (template: string, ...args: any[]) => string;

export type LogLevel = "trace" | "debug" | "warn" | "info" | "error" | "fatal";

export const DEFAULT_LOG_LEVEL: LogLevel = "info";

export const LogLevels: ReadonlyArray < LogLevel > = Object.freeze(["trace", "debug", "warn", "info", "error", "fatal"]);

export class Logger < LEVEL = LogLevels > {
  static log(template: string, ...args: any[]) {
    console.info('[%s]: ' + template, (new Date()).toISOString(), ...args)
  }
  static warn(template: string, ...args: any[]) {
    console.warn('[%s]: ' + template, (new Date()).toISOString(), ...args);
  }
  static error(template: string, ...args: any[]) {
    console.error('[%s]: ' + template, (new Date()).toISOString(), ...args);
  }
  
  readonly levels: Readonly < Record < LogLevel | "default",
  LEVEL >> ;
  
  readonly streams: Readonly<Record<LEVEL|"default", LogFunction>>;
  
  constructor(
    levelMap: Readonly < Record < LogLevel | "default", LEVEL >>,
    streams: Readonly<Record<LEVEL|"default", LogFunction>> = {default: console.log}) {
    this.levels = Object.freeze({ ...levelMap, default: levelMap.default ?? levelMap[DEFAULT_LOG_LEVEL] });
    this.streams = streams;
  }
  
  levelStream(level: LEVEL): (
    undefined | LogFunction
  ) {
    return this.streams[level] ?? this.streams.default;
  }
  
  add(level: LEVEL, template: string, ...args: any[]) {
    const out = this.levelStream(level);
    out?.log("[%s][%s]: " + template, ...args);
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
  info(template: string, ...args: any[]) {
    const level = this.levels.info;
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

export function defaultConsoleLogger(): Logger {
  return new Logger(
    LogLevels.reduce(
        (res, level) => ({...res,
          [level]: level}), {default: DEFAULT_LOG_LEVEL}
      ),
    LogLevels.reduce(
        (res, level) => ({...res,
          [level]: console[level]
        }), {default: console.log}
      )
  );
}

export class FormatLog<LEVEL=LogLevel>
extends Logger<LEVEL> {
  constructor(
    levelMap: Readonly < Record < LogLevel | "default", LEVEL >>,
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