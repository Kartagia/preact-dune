import {html} from "preact";
import {SettingsItem, type SettingsItemModel} from "./settings.item";
import {SettingsCategory,
  type SettingsCategoryModel
} from "./settings.category";

export function SettingsApp() {
  const setting : SettingsItemModel = {
    name:"test",
    label: "Test value"
  };
  const category: SettingsCategoryModel = {
    title: "Test Category",
    entries: [setting]
  }
  try {
    const handleChange = (prop, value) => {
      alert(`Set ${prop} to ${value}`)
    }
  console.table(setting)
  console.log(typeof SettingsItem)
;
const field = html`<${SettingsItem} model="${setting}" onchange="${handleChange}" />`;
return html`<div>
  <h4>Settings</h4>
  <${SettingsCategory} 
  model="${category}"
  />
  </div>`
  } finally {
    console.log("Setting rendered")
  }
}