import {html} from "preact";
import {SettingsItem, type SettingsItemProps} from "./settings.item";
import { SettingItemModel, SettingCategoryModel } from "./settings.model";
import {SettingsCategory } from "./settings.category";

export function SettingsApp() {
  const setting : SettingItemModel = {
    name:"test",
    label: "Test value"
  };
  const category: SettingCategoryModel = {
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