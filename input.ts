import { html, useState, useEffect, useCallback} from 'preact';
import type { ComponentChildren, useId } from 'preact/compat'
import { asTitle } from "././utils"
import type { BasicProps, ValueProps } from "./Basic";
import { useParsedValue} from "./hooks";

/**
 * Input component properties
 */
export interface InputProps < T > {
  value: T;
  label ? : string;
  format ? : (val: T) => string;
  parse ? : (val: string) => T;
  id ? : string;
  type: string;
  name ? : string;
  onChange ? : (newValue: T) => void;
  onDefault ? : () => void;
  onCancel ? : () => void;
  onConfirm ? : (newValue: T) => void;
  labelClasses ? : string[];
  inputClasses ? : string[];
  classes ? : string[];
  confirmTitle ? : string;
  cancelTitle ? : string;
  defaultTitle ? : string;
}

export type DefaultInputProps = Omit < InputProps < string > , parse > ;

/**
 * The default format.
 */
export function defaultFormat < T > (source: T): string {
  if (source == undefined) {
    return "";
  } else {
    return "" + source;
  }
}

export function defaultParse < T > (source: string, parser: Parser < T > ): (T | undefined) {
  if (source) {
    return undefined;
  } else {
    return parser(source);
  }
}

export type InputLabelProps < T > = Pick < InputProps < T > , "label" | "id" | "labelClasses" > ;

export function InputLabel < T > (props: InputLabelProps < T > ) {
  
  return html`<label class="${(props.labelClasses ?? []).join(" ")}" for="${props.id}>${props.label}</label>`;
}

export function Input < T > (props: InputProps < T > ) {
  const format = props.format ?? defaultFormat;
  const parse = props.parse ?? defaultParse;
  const [inputValue,value, partial, setInputValue, setValue] = useParsedValue({ parse, format, parsed: props.value});
  console.table({value, inputValue})
  const id = props.id ?? useId();
  const handleContentChange: TargetedEvent < Event > = (event) => {
    console.group(`Event handleContentChange(${inputValue} => ${event.target.value})`);
    console.table({ newValue: event.target.value, oldValue: inputValue });
    try {
    setInputValue(event.target.value);
    } finally {
    console.groupEnd();
    }
  }
  
  const handleChange: TargetedEvent < Event > = (event) => {
    console.group("Event handleChange(accepted=%s)",
      event.target.value
    );
    try {
      setInputValue(event.target.value);
      console.log("Value changed");
    } catch (err) {
      console.error("Could not change parsed value to %s: %s", event.target.value, err);
    }
    
    console.groupEnd();
  };
  const handleCancel: TargetedEvent < MouseEvent > = (e: Event) => {
    // Cancel edit
    setValue(parsedValue);
    props.onCancel?.();
  }
  
  const handleDefault: TargetedEvent < MouseEvent > = (e: Event) => {
    setParsedValue(props.value);
    try {
      props.onDefault?.();
    } catch (err) {
      log.error("Parent default handler failed");
    }
  }
  
  const handleConfirm: TargetedEvent < MouseEvent > = (e) => {
    props.onConfirm?.(parsedValue);
  };
  const label = html`<label for="${id}">${props.label}</label>`;
  const input = html`<input value="${value}" type="${props.type}" id="${id}"
  onchange="${handleChange}"
  oninput="${handleContentChange}"
  />`;
  const [actions, setActions] = useState([
    {
      name: "accept",
      handler: handleConfirm,
      get disabled() {
        return !partial
      }
    },
    {
      name: "cancel",
      handler: handleCancel,
      get disabled() {
        return !partial
      }
    },
    {
      name: "default",
      handler: handleDefault,
      get disabled() {
        return !partial && value === props.value
      }
    }
    
  ].reduce(
    (res, action) => {
      const prop = action.prop ?? `on${asTitle(action.name)}`;
      console.table({ ...action }, prop)
      res.push({
        ...action,
        prop,
        title: action.title ?? asTitle(action.name)
      })
      return res;
    }, []
  ));
  
  const actionComponent = html`<div class="actions">${
    actions.map(
      action => {
      console.table(action)
      return html`<button key="${action.name}" className="${action.hidden ? "hidden" : "action"}" disabled="${action.disabled}"
      onClick="${action.handler}">${action.title}</button>`
      }
    )
  }</div>`;
  
  return html`<div>${label}${input}${actionComponent}</div>`
}

export interface InputGroupProps < T > extends InputProps < T > {
  
  multiple ? : boolean;
  items ? : T[];
  onItemChanges ? : (newValues: T[]) => void;
}

export interface SelectProps < T > extends InputGroupProps < T > {
  
  multiple ? : boolean;
}

export function Select < T > (props: SelectProps < T > ) {
  
  
  return html`<div >
  <label for="${id}">Log level</label>
  <select value="${value}" id="${id}" onchange="${handleChangeLogLevel}">${
    LOG_LEVELS.map(level => html`<option value="${level}">${asTitle(level)}</option>`)
  }</select>
  </div>`;
  
}