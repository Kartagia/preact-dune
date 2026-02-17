import { html, useState } from 'preact';
import { type SettingEntryModel, type SettingCategoryModel } from "././settings.model";
import { SettingsItem } from "./settings.item";

export interface SettingsCategoryProps {
  model: SettingCategoryModel;
  prefix?: string;
  onchange?: (property: string, value: string) => void;
}

export function SettingsCategory(props: SettingsCategoryProps) {
  console.group(`Category ${props.model?.title ?? ""}`);
  const [open, setOpen] = useState(props.model.open ?? true);
  const [model, setModel] = useState(props.model);
  const handleChange = (prop: string, value: string) => {
    if (props.prefix) {
      props.onchange?.(`${props.prefix}.${prop}`, value);
    } else {
      props.onchange?.(prop, value);
    }
  }
  try {

    return html`<div>
  <div class="header">${model.title}</div>
  <div class="entries${(open ? "" : " hidden")}">${model.entries.map(
      (item: SettingEntryModel) => {
        if ("entries" in item) {
          return html`<${SettingsCategory} model="${item}" prefix="${item.prefix ?? ""}" onchange="${(prop, value) => handleChange(prop, value)}"/>`;
        } else {
          return html`<${SettingsItem} model="${item}" onchange="${handleChange}" />`
        }
      }
    )
      }
  </div>
  </div>`;
  } finally {
    console.groupEnd();
  }
}