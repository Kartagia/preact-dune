import {html, useState} from 'preact';
import {type SettingsEntryModel, type SettingsCategoryModel} from "././settings.model";
import { SettingsItem} from "./settings.item";

export interface SettingsCategoryProps {
  model: SettingsCategoryModel;
  onchange?: (property: string, value: string) => void;
}

export function SettingsCategory(props: SettingsCategoryProps) {
  console.group(`Category ${props.model?.title ?? ""}`);
  const [open, setOpen] = useState(props.model.open ?? true);
  const [model, setModel] = useState(props.model);
  const handleChange = (prop, value) => {
    
  }
  try {
    
  return html`<div>
  <div class="header">${model.title}</div>
  <div class="entries${(open?"":" hidden")}">${
    model.entries.map(
      item => {
      if ("entries" in item) {
        return html`<div>${item.title}</div>`;
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