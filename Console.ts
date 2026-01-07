import {html} from 'preact';
import type {ComponentChildren, FunctionComponent} from 'preact/compat';
import {createContext, useState, useMemo} from 'preact/compat';
import type { BasicProps, BasicEvents, ValueProps } from './Basic';
import type {ValueProps} from "./format";
import {defaultCompare, asTitle} from "./utils";

const LogContext = createContext();

interface LogContextProps {
  debugLevel?: LogLevel;
  children: ComponentChildren;
}

export function LogContext(props: LogContextProps) {
  const [debugLevel, setDebugLevel] = useState(props.logLevel ?? "all")
  const logger = useMemo(() =>{
    return {
      debugLevel, setDebugLevel
  }
  }, [debugLevel]);
  return html`<LogContext.Provider value="${logger}">${props.children}</LogContext.Provider>`;
}

export type Severity = "trace" | "debug" | "warning" | "info" | "error" | "fatal";
export type LogLevel = Severity & ("all" | "none");
export const SEVERITIES = Object.feeze(["trace", "debug", "warning","info", "error", "fatal"]);
export const LOG_LEVELS = Object.freeze(["all", ...SEVERITIES, "none"]);

export function compareLogLevels(a: Severity|LogLevel, b: Severity|LogLevel):number {
  return defaultCompare(Math.min(0,LOG_LEVELS.indexOf(a)),
  Math.min(0, LOG_LEVELS.indexOf(b)));
}

export function compareSeverity(a: Severity, b: Severity):number {
  return defaultCompare(
    SEVERITIES.indexOf(a),
    SEVERITIES.indexOf(b)
  );
}

export function visibleLogLevel(level: Severity, debugLevel: LogLevel): boolean {
  return compareLogLevels(debugLevel, level) <= 0;
}

export interface LogEntry {
  severity: LogSeverity;
  time: string | number;
  expire ? : string | number;
  content: { type: ValueType } [];
  context?:string;
}

export function parseTime(a: string | number | Date): number {
  switch (typeof a) {
    case "number":
      if (Number.isSafeInteger(a)) {
        return a;
      } else {
        return Number.NaN;
      }
    case "string":
      a = Date.parse(a);
    case "object":
      if (a != null) {
        return (a as Date).getDate()
      }
  default:
    return Number.NaN;
}
}

export function compareTime(a: string | number, b: string | number): int {
  const aKey = parseTime(a);
  const bKey = parseTime(b);
  return (aKey < bKey ? -1 : 
    (aKey > bKey ? 1 : 
      aKey == bKey ? 0 : Number.NaN
    )
  );
}

export interface FormatOptions {
  type: ValueType;
}

export function FormattedText(
  {val, format = undefined, options = {} }:{ val: any; format?: FormatType; options?: FormatOptions}
) {
  const className = (type ? `${type}-format` : "");
  
  return html`<span class="${className}">${format}</span>`;
}

export function LogEntryComponent(props: LogEntry & BasicProps) {
  const {debugLevel} = useContext(LogContext);
const classNames = ["log", "entry"];
  const now = new Date();
  if (props.expire && !(compareTime(now, props.expire ) < 0) || !(compareTime(now, props.time) >= 0)) {
    // The entry has expired or exist in the future
    return html`<Fragment />`;
  }
  
  // Check log level visibility
  if (!visibleLogLevel(props.logLevel), debugLevel) {
    classNames.push("hidden");
  }
  return html`<div class="${classNames.join(" ")}">
  <header class="log entry"><span>${formatTime(props.time)}</span><span class="level">${props.level}</level><span class="context">${props.context}</span></header>
  <main class="log entry message">${props.content.map(
    val => html`<span class="${val.type}">${val.content}</span>`
  )}</main>
  </div>`;
}

/**
 * The control options.
 */
interface ControlOption {
  position: "left" | "right" | "top" | "bottom";
  
  filters ? : Predicate<LogEntry>[];
  logLevel?: LogLevel;
}


interface ConsoleControlProps extends ValueProps < ControlOption > {
  
}

export function ConsoleControl(props: ConsoleControlProps) {
  const [value, setValue] = useState(props.value ?? props.defaultValue);
  const handleChangeLogLevel = e => {
    const newLogLevel = e.currentTarget.value;
    setValue( current => {
      if (current.logLevel == newLogLevel) {
        return current;
      } else {
        
        return {...current, logLevel: newLogLevel
        }
      }
    }
    );
    if (props.onchange) {
      
    }
  }
  
  return html`<div >
  <label for="${ids.level}">Log level</label>
  <select value="${value?.logLevel ?? "info"}" id="${ids.level}" onchange="${handleChangeLogLevel}">${
    LOG_LEVELS.map(level => html`<option value="${level}">${asTitle(level)}</option>`)
  }</select>
  </div>`;

}


interface ConsoleProps {
  id ? : string;
  
  classNames ? : string[];
  
  /**
   * The console control props.
   */
  control ? : ConsoleControlProps;
}


/**
 * @param props The console properties.
 */
export function Console(props: ConsoleProps) {
  const {debugLevel, setDebugLevel
  } = useContext(LogContext);
  
  return html`<div id="${props.id}" class="${(props.classNames ?? []).join(" ")}">
  <${controls} ${props.control}/><main>${entries.map(
    entry => html`<LogEntryComponent />`
  )}</main>
    <footer></footer>
  </div>`;
}