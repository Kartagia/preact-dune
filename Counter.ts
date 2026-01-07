import { html, useEffect } from 'preact';
import { useParsedValue, Parser, Format } from "./hooks";
import { type Compare, defaultCompare } from "././utils";
import {defaultConsoleLogger} from "./log";

const log = defaultConsoleLogger();

/**
 * The counter properties.
 * 
 * @template T The counted value type.
 */
export interface CounterProps < T > {
  /**
   * The initial value of the component.
   */
  defaultValue: T;
  
  /**
   * The formatter formatting the value into input component value.
   */
  format: Format < T > ;
  
  /**
   * The parse of the value from input component value. If undefined, the value is not editable.
   */
  parse ? : Parser < T > ;
  
  increase(source: T, amount ? : T): T;
  
  decrease(source: T, amount ? : T): T;
  compare ? : Compare < T > ;
  min ? : T;
  max ? : T;
}

/**
 * A simple counter component.
 */
export function Counter() {
  const [input, parsed, partial, setInput, setParsed] = useParsedValue < number > ({
    parsed: 0,
    format: (a: number) => a.toString(),
    parse: (a: string) => Number.parseInt(a)
  });
  const decrease = () => {
    setParsed(parsed - 1)
  };
  const increase = () => {
    setParsed(parsed + 1)
  };
  return html`<div class="${partial ? "bold" : ""}"><span onclick="${decrease}">-</span>${parsed}<span onclick="${increase}">+</span></div>`;
  
}

export function CounterControl < T > (props: Omit < CounterProps < T > , "defaultValue" > & {
  value: T;
  action ? : EventHandlerNonNull < MouseEvent > ;
  title: string;
}) {
  const classNames = ["control"];
  const compare: Compare < T > = props.compare ?? defaultCompare;
  console.table({
    value: props.value,
    min: props.min,max:props.max,
    atLeastMin: (props.min === undefined || compare(props.min, props.value) <= 0),
    atMostMax: (props.max === undefined || compare(props.value, props.max) <= 0)
  })
  if (
    ("min" in props && compare(props.min, props.value) > 0) ||
    ("max" in props && compare(props.value, props.max) > 0)
  ) {
    classNames.push("disabled");
  }
  
  const handleClick = props.action;
  return html`<span class="${classNames.join(" ")}"  onClick="${handleClick}">${props.title}</span>`;
}

export function InputCounter < T > (props: CounterProps < T > ) {
  const [input, parsed, partial, setInput, setParsed] = useParsedValue < T > ({
    parsed: props.defaultValue,
    format: props.format,
    parse: props.parse
  });
  const format = props.format ?? ((s) => ("" + s));
  const compare: Compare<T> = props.compare ?? defaultCompare;
  console.group("InputCounter");
  console.table(props);
  console.table({
    input, parsed, partial
  });
  useEffect(
    ()=>{
      
    },
    [input]
  )
  const inputClasses = ["value"];
  if (partial) {
    inputClasses.push("error")
  } else {
    inputClasses.push("success");
  }
  
  const increase = () => {
    if (props.max === undefined || compare(parsed, props.max) < 0) {
    console.log("Increasing %s", format(parsed));
    setParsed(props.increase(parsed));
    }
  };
  const decrease = () => {
    if (props.min === undefined || compare(parsed, props.min) > 0) {
    console.log("Decreasing %s", format(parsed));
    setParsed(props.decrease(parsed))
    }
  };
  
  const altered = (e) => {
    if (typeof e === "object" && "target" in e && typeof e === "object") {
    log.info("Value changed to %s", e.target.value);
    setInput(e.target.value);
    } else {
      log.info("input value => %s", e.target.value);
}
  }
  
  const confirmed = (e) => {
    if (typeof e === "object") {
    log.info("Confirmed %s", e.target.value);
    }
  };
  const inputComponent = (props.parse ?
    html`<input onInput="${altered}" 
    class="${inputClasses.join(" ")}"
    onChange="${confirmed}" value="${input}"></input>` :
    html`<span>${props.format(input)}</span>`
  );
  const decreaseControl = html`<${CounterControl} value="${parsed}" min="${props.min}" max="${props.max}" value="${parsed}" compare="${props.compare}" action="${decrease}" title="-" />`;
  const increaseControl = html`<${CounterControl} value="${parsed}" min="${props.min}" max="${props.max}" value="${parsed}" compare="${props.compare}" action="${increase}" title="+" />`;
  console.groupEnd();
  return html`<div class="${partial ? "bold" : ""}">${decreaseControl}${inputComponent}${increaseControl}</div>`;
}