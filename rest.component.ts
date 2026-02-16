import { html, render, h, useState } from 'preact';
import type { RestMethod } from './rest.model';

export function validId(value: string): boolean {
  return /^(?:[a-z]|[.:]\w)(?:[\w]|[.:-]\w)*$/.test(value);
}

/**
 * Hook creating an unique id.
 * @param prefix The identifier prefix. @default "id"
 * @param idRegistry The list of reserved ids. The new id is added to the registry.
 */
export function useId(
  prefix: string = "id",
  idRegistry ? : string[]
): string {
  let result;
  do {
    if (!validId(prefix)) throw new SyntaxError("Invalid prefix");
    result = `${prefix}${(Math.random()*Number.MAX_SAFE_INTEGER).toString(16)}`
  } while (idRegistry?.includes(result));
  idRegistry?.push(result);
  return result;
}

export interface MethodChoiceProps < Variant extends string = "menu" | "select" | "radio" > {
  method: RestMethod;
  selected ? : boolean;
  name ? : string;
  variant ? : string;
  onAction ? : (action: string) => void;
}



/**
 * A method choice component.
 * @param method The method of the choice.
 * @param variant The method choice contextm
 * @param selected Is the method selected.
 */
function MethodChoice({ method, name, variant = "", selected = false, onAction = undefined }: MethodChoiceProps) {
  console.group("Method %s choice %s ", variant, name)
  const handleSelect = (e: EventTarget < HTMLInputElement > ) => {
    onAction?.(e.target.value);
  };
  
  try {
    switch (variant) {
      case "menu":
        console.log("Menu %s", method.name)
        return html`<li onclick="${(e) => {setValue(e.target.value)}}">${method.label ?? method.name}</li>`;
      case "radio":
        console.log("Radio %s", method.name)
        return html`<input name="${name}" disabled="${!method.isValid}" type="radio" onchange="${handleSelect}" value="${method.value ?? method.name}">${method.label ?? method.name}</input><label>${method.label ?? method.name}</label>`
      default:
        console.log("Option %s", method.name)
        return html`<option disabled="${!method.isValid}" value="${method.value ?? method.name}" selected="${selected}" onclick="${handleSelect}" >${method.label ?? method.name}</option>`;
    }
  } catch (err) {
    console.error(err)
  } finally {
    console.groupEnd()
  }
}

/**
 * Rest method select component properties.
 */
interface MethodSelectProps {
  items: Method[];
  id ? : string;
  name ? : string;
  onchange ? : EventHandlerNonNull < HTMLInputElement | HTMLSelectElement > ;
  onSelect ? : (method: Method) => void;
  variant: "radio" | "menu" | "";
}

/**
 * Create rest method chooser component.
 * @param props The properties.
 */
export function RestMethodChooser(props: MethodSelectProps) {
  const [defaultValue, setDefaultValue] = useState(props.defaultValue);
  const [value, setValue] = useState(defaultValue);
  const {
    items,
    children,
    onchange,
    onAction,
    variant = "select",
    ...selectProps
  } = props;
  let id = useId();
  if (selectProps.id) {
    id = selectProps.id;
  }
  console.log("id %s, variant %s", id, variant);
  const updateValue = (e: Event < HTMLInputElement | HTMLSelectElement > ) => {
    console.log("Updating value to %s", e.target.value)
    setValue(e.target.value)
    if (onAction) {
      const newValue = items.find(
        cursor => e.target.value === (cursor.value ?? cursor.name)
      );
      
      onAction(newValue);
    };
  };
  console.log("Defined updateValue");
  const selectAction = (action: string) => {
    console.log("Selecting %s", action);
    setValue(value);
    if (onAction) {
      const newValue = items.find(
        cursor => value === (cursor.value ?? cursor.name)
      );
      onAction?.(newValue);
    }
  };
  console.log("Choosing variant (%s)", variant);
  
  let content;
  switch (variant ?? "") {
    case "menu":
      console.log("MenuMethodChooser")
      content = html`<menu>
      <input type="hidden" value="${value}" name="${selectProps.name}" id="${id}" />
      ${
        items.map(item => html`<${MethodChoiceStub} onAction="${selectAction}" method="${item}" variant="${variant}" />`)
      }
      </menu>`;
      break;
    case "radio":
      console.log("Radio button method chooser")
      content = html`<div><fieldset >
      <input type="hidden" value="${value}" name="${selectProps.name}" id="${id}" />
      ${
        items.map(item => html`<${MethodChoice}
        name="${(selectProps.name ? selectProps.name +".radio" : id)}"
          onAction="${selectAction}" method="${item}" variant="${variant}" />`)
      }
      </fieldset></div>`;
      break;
    default:
      console.log("Select method chooser");
      content = html`<select onchange="${onchange}" id="${id}" ${selectProps} >${
    items.map(item => html`<${MethodChoice} method="${item}" variant="${variant}" />`)
  }</select>`
  }
  console.debug("Rendering");
  return html`<div>${content}</div>`;
}

export function RestPanel() {
  const [valid, setValid] = useState < Record < string, boolean >> ({});
  const [resId, setResId] = useState("");
  const changeResId: EventHandlerNonNull = (event) => {
    if (partialUUID(event.target.value)) {
      setId(event.target.value);
      setValid(old => ({ ...old, resId: isUUID(event.target.value) }));
    }
  }
  
  const methods: RestMethod[] = [
  {
    name: "Get All",
    get isValid() {
      return true;
    }
  },
  {
    name: "Get One",
    get isValid() {
      return valid.resId == true;
    }
  },
  {
    name: "Create",
    get isValid() {
      return valid.newValue == true;
    }
  },
  {
    name: "Update",
    get isValid() {
      return valid.resId == true;
    }
  },
  {
    name: "Delete",
    get isValid() {
      return valid.resId == true;
    }
  }];
  console.group("RestApp");
  try {
    console.table(props)
    
    return html`<div>
  <div class="setup">
  <h1>Rest request</h1>
  <div >
  <label >Resource Id</label>
  <input name="resId" value="${resId}" onChange="${
    (e) => setResId(e.target.value)
  }" />
  </div>
  <div>
  <label>Resource value</label>
  </div>
  <div class="actions">Buttons</div>
  <div class="results">
  ${
    methods.map(
      method => html`<div class="method" >${method.name}</div>`
    )
  }
  </div>
  </div>`;
  } catch (err) {
    console.error("Render failed", err)
  } finally {
    console.groupEnd();
  }
}

export interface QueryProps {
  method: RestMethod;
}

export function UrlChooser(
  props: {onchange?: (val:string) => void;}
) {
  
  return html`<div>
  <label>Url</label>
  <input type="url" onchange="${(val)=>props.onchange?.(val)}"/>
  </div>`
}

export function RestQuery(props: QueryProps) {
  console.group("RestQuery");
  const [resourceUrl, setUrl] = useState<string>("");
  const [entryId, setEntryId] = useState("");
  const [errors, setError] = useState<Record<string, string[]>>({})
  const executeQuery = async () => {
    fetch(resourceUrl + id, {}).then(response => {
      if (response.ok) {
        setResult(response.body)
      } else {
        setError(
          current => {
            if (current) {
              if ("" in current) {
                return {
                  ...current,
                  "": [
                    ...current[""],
                  response.body
                  ]
                }
              } else {
                return {...current, "":[response.body.toString()]}
              }
            } else {
              return ({
                "":[response.body]});
            }
          }
        )
      }
    })
  }
  try {
    console.table(props)
    console.table({resourceUrl, errors, entryId})
  switch (props.method) {
    case "all": 
      return html`<div>
<h4>${props.method}</h4>
<${UrlChooser} onchange="${setUrl}"/>
<button disabled="${!resourceUrl} onclick="${executeQuery()}">Send</button>
</div>
`
    case "one":
      return html`<div>
<h4>${props.method}</h4>
<${UrlChooser} onchange="${setUrl}"/>
<div>Entry Id<input onchange="${e => setEntryId(e.currentTarget.value)}"></input></div>
<button disabled="${!resourceUrl} onclick="${executeQuery()}">Send</button>
</div>`;
    default:
      return html`<h4 class="error">Please select DAO method.</h4>`;
  }
  } finally {
    console.groupEnd();
  }
}