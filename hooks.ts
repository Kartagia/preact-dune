import { html, useState, useEffect, useCallback} from 'preact';

export type Parser < T > = (val: string) => T;

export type Format < T > = (val: T) => string;

export function defaultFormat<T>(source: T): stting {
  return "" + source;
}

/**
 * The parsed value initialization parameters 
 */
export interface ParsedValue<T> {
  parsed: T;
  
  parser: Parser<T>;

  format: Format<T>;
}
/**
 * The input value initialization.
 */
export interface InputValue < T > {
  
  input: string;
  parsed?: T;
  partial?: boolean;
  
  parser: Parser < T > ;
  
  format: Format < T > ;
}

export type InputState<T> = Required<InputValue<T>>;

/**.
 * Create a parsed state hook. 
 * @param props The construction properties.
 */
export function useParsedValue<T>(
  props: ParsedValue<T>|InputValue<T>
) {
  const format = props.format ?? defaultFormat;
  const [inputState, setInputState] = useState<InputState<T>>(
    {
      input: props.input ?? props.format(props.parsed),
      parsed: props.parsed ?? props.parser(props.input),
      format: props.format,
      parser: props.parser
    }
  );
  const equalState = (old: InputValue<T>|undefined, current : Pick<InputState<T>, "input"|"parsed">) => (Object.is(old?.input, current.input) && Object.is(old?.parsed, current.parsed));
  const setInputValue = useCallback(
    (inputValue: string) => {
    try {
      const newValue = props.parser(inputValue);
      
      setInputState(
        old => {
          if (equalState(old, {input:inputValue, parsed: newValue})) {
            return old;
          }
          return {...old,
          input: inputValue,
          parsed: newValue,
          partial: false
          }
        }
      );
    } catch(error) {
      setInputState( 
        old => {
          if (old && equalState(old, {
            input: inputValue,
            parsed: old.parsed
          })) {
            return old;
          } else if (old) {
            return {...old, 
            input: inputValue, 
            parsed: old.parsed,
            partial: true
            }
          } else {
            throw new Error("Uninitialized parsed value state")
          }
        }
      )
    } finally {
      
    }
  });
  
  const setParsedValue = useCallback((parsedValue: T) => {
  try {
    const inputValue = props.format(parsedValue);
    setInputState(
      old => {
        if (equalState(old, {input:inputValue, parsed: parsedValue})) {
            return old;
          }
          return {...old,
          input: inputValue,
          parsed: parsedValue,
          partial: false
          }
      }
    )
  } catch (error) {
    logger.error("Format error: %s", error.toString())
    throw error;
  } finally {
    
  }
});
  return [inputState.input, inputState.parsed, inputState.partial, setInputValue, setParsedValue];
}