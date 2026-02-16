import { html, render, h, useState, useEffect } from 'preact';
import {methods} from './rest.model'
import {type SettingsModel} from "./settings.model"
import {Settings} from "./settings.component"
import { RestMethodChooser, RestQuery } from './rest.component';

export default function RestApp() {
  const [settings, setSettings] = useState<SettingsModel>({api:{}});
  const [variant, setVariant] = useState("select");
  const [selected, updateSelected] = useState(methods[0].name);
  const handleVariant = e => {
    console.table({
      type: e.type,
      target: e.target?.nodeName,
      newValue: e.target?.value
    })
    setVariant(e.target.value);
  }
  const setSelected = (v: string, id ? : string) => {
    console.log("Select %s method %s", id ? `with id ${id}` : "without id", v);
    updateSelected(v);
    setVariant(v);
  }
  return html`<div class="app">
<div>Selected <span id="method">${selected}</span></div>
<div>Chooser variant ${variant}</div>
<div>
<fieldgroup>
<input id="var.default" name="variant" type="radio" value="select" 
onchange="${handleVariant}"
/><label for="var.default">Select</label>
<input name="variant" type="radio" value="radio" id="var.radio"
onchange="${handleVariant}"/><label for="var.radio">Radio</label>
<input name="variant" type="radio" value="menu" id="var.menu"
onchange="${handleVariant}"/><label for="var.menu">Menu</label>
</fieldgroup>
<${RestMethodChooser} variant="${variant}" id="foo" items="${methods}" onchange="${e => {setSelected(e.target.value, e.target.id)}}" />
</div>
<${RestQuery} method="${selected}" />
<${Settings} model="${settings}" />
</div>`
}