import {html, useState} from "preact";
import {isSettingCategoryModel, isSettingItemModel} from "./settings";
import {SettingsPanel} from "././settings.panel";
import {SettingsController} from "././settings.control"

interface HostSettings {
  url: URL;
  api: {
    url: URL;
    mediaType: "application/json",
    accepts: "application/json",
    encoding: "utf-8",
    key: string;
    entries: [{
      name:"key",
      label:"Key"
    }]
  },
  get entries() {
    const getEntries = () => this.api.entries;
    return [{
      title: "Api",
      get entries() {
        return getEntries();
      }
    }]
  }
  
}

interface AppSettings {
  title?: string;
  host : HostSettings;
  entries: [];
}

class AppController implements SettingsController<AppSettings> {
  
}

export function App() {
  const [model, setModel] = useState<AppSettings>({
    
  });
  const [controller, setController] = useState(new AppController())
  
  
  return html`<div class="app">
    <div class="header">${model.title ?? "Dune App"}</div>
    <div class="main"><${SettingsPanel} model="${model}" controller="${controller}"/></div>
  </app>`;
}