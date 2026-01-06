import {html, useState} from 'preact';
import type {ComponentChildren, FunctionComponent } from 'preact/compat';

/**
 * Parse a value.
 * 
 * @template T The parsed value.
 * @param s The parsed string.
 * @returns The parse result.
 * @throws {SyntaxError} The parse failed.
 */
export type Parser<T> = (s: string) => T;

/**
 * Format a value.
 * @template T the formatted value type.
 * @param t The formtted value.
 * @returns The string formatted value.
 * @throws {SyntaxError} The value
 * does not have formatted value.
 */
export type Formatter<T> = (v: T) => string;
/**
 * The basic properties.
 */
export interface BasicProps {
  id ? : string;
  name ? : string;
  classNames ? : string[];
  children?: ComponentChildren;
  readonly?: boolean;
  disabled?: boolean;
}

export function getClass(props: BasicProps, defaultClass?: string|string[]): string {
  return (props.classNames ?? (
    defaultClass ? ( Array.isArray(defaultClass) ? defaultClass : [defaultClass]): []
  )
    
  ).join(" ");
}


export type BasicPropsWithChildren = Omit<BasicProps, "children"> & Required<Pick<BasicProps, "children">>;

export interface BasicEvents {
  /**
   * The click handler.
   */
  onClick?: EventHandlerNonNull<MouseEvent>;
}

/**
 * The propertues for values.
 * @template T The value type.
 */
export interface ValueProps<T=string> {
  
  value?: T;
  defaultValue?: T;
  formatter?: Formatter<T>;
  parser?: Parser<T>;
}

/**
 * A read-only value components always set readonly.
 */
export interface ReadOnlyValueProps<T> extends ValueProps<T>, BasicProps {
  readonly: true;
}

/**
 * Get the value formatter.
 * @template T The value type.
 * @param props The value properties.
 * @param defaultFormatter The default formatter.
 * @returns The value formatter.
 * @throws {SyntaxError} No formatter exists.
 */
export function getValueFormatter<T>(props: ValueProps<T>, defaultFormatter?: Formatter<T>) : Formatter<T> {
  const result = props.formatter ?? defaultFormatter;
  if (result) {
    return result;
  } else {
    throw new SyntaxError("Missing formatter!");
  }
}

/**
 * Get the value parser.
 * @template T The value type.
 * @param props The value properties.
 * @param defaultParser The default parser.
 * @returns The value parser.
 * @throws {SyntaxError} No parser exists.
 */
export function getValueParser<T>(props: ValueProps<T>, defaultParser?: Parser<T>):Parser<T> {
  const parser = props.parser ?? defaultParser;
  if (parser) {
    return parser;
  } else {
    throw new SyntaxError("Missing parser!");
  }
}

/**
 * A properties for a valued component using string value without formatting or parsing. 
 */
export type StringValueProps = Omit<ValueProps, "parser"|"formatter">;

/**
 * Get string value formayter.
 * @param props The string value properties.
 * @returns The formatter formatting the value.
 */
export function getStringValueFormatter(props: StringValueProps): Formatter<string> {
  return props.formatter ?? ((s) => s);
}

/**
 * Get string value parser.
 * @param props The string value properties.
 * @returns The parser parsing the formatted value to original value.
 */
export function getStringValueParser(props: StringValueProps): Parser<string> {
  return props.parser ?? ((s) => s);
}


/**
 * A controlled valued component properties.
 * 
 * @template T The value type.
 */
export type ControlledProps<T=string> = Omit<ValueProps<T>, "defaultValue"|"value"> & Required<Pick<ValueProps<T>, "value">>;

export type ReadOnlyControlledProps<T> = Omit<ReadOnlyValueProps<T>, "defaultValue"|"value"> & Required<Pick<ValueProps<T>, "value">>;

export type UncontrolledProps<T=string> = Omit<ValueProps<T>, "defaultValue"|"value"> & Required<Pick<ValueProps<T>, "defaultValue">>;

/**
 * A value component.
 * 
 * @template T The value type.
 */
export type ValueComponent<T> = FunctionComponent<ValueProps<T>> | "input";

export function Controlled<T>(props: BasicProps & ControlledProps<T> & ValueEvents<T> & ({
  component: ValueComponent<T>;
}|{
  component?: ValueComponent<T>;
  defaultComponent: ValueComponent<T>;
} | {}) ) {
  const { 
    component = undefined, defaultComponent = "input", children = undef, value = undefined, defaultValue = undefined, ...rest} = props;
  let c = component ?? defaultComponent;
  const parser = getValueParser(props);
  const formater= getValueFormatter(props);
  const handleChange = (e) => {
    const newValue = parser(e.currentTarget.value);
    props.onChange?.(newValue);
};
  
  let header;
  if (typeof c === "string") {
    // Creating an input storing the value
    header = html`<${c} value="${formatter(value)}" defaultValue="${formatter(defaultValue)}"
    onChange={handleChange}
    ${rest} />`;
    } else {
      // Creating a value component
      header = html`<${c} value="${value}" defaultValue="${defaultValue} ${rest} />`;
    }
  
  return html`<div class="${getClass(props)}">
  <header>${header}</header>)
  <main>${props.children}</main>
  </div>`;
}