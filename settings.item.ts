import {useState, html} from 'preact';
import { SettingItemModel } from './settings.model';
export { type FieldType
} from './settings.model';

export interface SettingsItemProps{
  model: SettingItemModel;
  onchange?:(property: string, newValue: string|undefined) => void;
};

export function SettingsItem(props:SettingsItemProps) {
  console.group("SettingsItem");
  try {
  console.log(`Item ${props.model.label}`);
  const id = `id.${props.model.name}`;
  const handleChange = (e) => {
    console.table({newValue: e.currentTarget?.value});
    props.onchange?.(props.model.name, e.currentTarget.value);
  };
  return html`<div>
  <label for="${id}">${props.model.label}</label>
  <input id="${id}" type="${props.model.type}" onchange="${handleChange}" />
  </div>`;
  } finally {
    console.groupEnd()
  }
};

export default SettingsItem;

