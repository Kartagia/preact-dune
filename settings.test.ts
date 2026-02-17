import { html, useState } from "preact";
import { SettingsItem, type SettingsItemProps } from "./settings.item";
import { Cookie, SettingItemModel, SettingCategoryModel, SettingEntryModel } from "./settings.model";
import { SettingsCategory } from "./settings.category";
import { SettingsController } from "./settings.control";
import { createEntries } from "./settings.panel";

/**
 * Test validity of an API key.
 * @param value The tested value.
 * @param prefix The optional prefix. If null, the prefix is prohibited. If non-null, but 
 * defined, the required prefix. An undefined value means all prefixes are accepted.
 * @returns True, if and only if the API key is an accepted API key. 
 */
export function validApiKey(value: string, prefix?: string | null | undefined): boolean {
  const regex = /^(?<prefix>\w+_)?(?<key>[a-zA-Z0-9\/+]{8,})$/;
  if (prefix !== undefined) {
    const match = regex.exec(value);
    return (match && Object.is(prefix, match.groups?.prefix));
  } else {
    return regex.test(value);
  }
}

interface TestSettings {
  test?: string;
  data?: {
    "host"?: URL;
    api?: {
      key: string;
    }
  }
}

class TestSettingsController implements SettingsController<TestSettings> {

  private prefix: string;

  constructor(initialContent: TestSettings, prefix: string = "") {
    this.prefix = prefix;
    this.content = initialContent;
  }

  content: TestSettings;

  get keys(): Array<keyof TestSettings> {
    return Object.getOwnPropertyNames(this.content) as Array<keyof TestSettings>;
  }

  setItemValue(source: SettingItemModel, property: string): SettingItemModel {
    if (this.prefix != null) {
      if (!property.startsWith(this.prefix + ".")) {
        // The property is not within the prefixed source.
        return source;
      }
    }
    const actualProperty = (this.prefix == null ? property : property.substring(this.prefix.length + 1));

    if (actualProperty === "test") {
      return {
        ...source,
        value: this.content.test
      }
    } else if (actualProperty === "data.host") {
      return {
        ...source,
        value: this.content.data?.host?.toString()
      }
    } else if (actualProperty === "data.api.key") {
      return {
        ...source,
        value: this.content.data?.api?.key
      }
    }
    return source;
  }

  setCategoryValue(source: SettingCategoryModel, property: string): SettingCategoryModel {

    if (this.prefix != null) {
      if (!property.startsWith(this.prefix + ".")) {
        // The property is not within the prefixed source.
        return source;
      }
    }
    const actualProperty = (this.prefix == null ? property : property.substring(this.prefix.length + 1));

    const result = source;
    switch (actualProperty) {
      case "data.host":
        if (this.content.data?.host) {
          const data: SettingEntryModel|undefined = source.entries.find(entry => "entries" in entry && entry.prefix === "data");
          if (data) {
            const host: SettingEntryModel|undefined = source.entries.find(entry => "name" in entry && entry.name === "host");
            if (host) {
              // Replacing existing host with replacement host.
              return {
                ...source,
                entries: source.entries.map(category => "prefix" in category && category.prefix === "data" ? {
                  ...category,
                  entries: category.entries.map(entry => entry === host ? this.setItemValue(entry as SettingItemModel, property) : entry)
                } : category)
              }
            } else {
              // Adding host to data.
              const added = this.setItemValue({ name: "host", label: "Host" } as SettingItemModel, property);
              if (added.value) {
                return {
                  ...source,
                  entries: source.entries.map(category => "prefix" in category && category.prefix === "data" ? {
                    ...category,
                    entries: [...category.entries, added]
                  } : category)
                }
              }
            }
          } else {
            // Adding the data to settings.
            return {
              ...source,
              entries: [...source.entries, {
                prefix: "data", title: "Data Settings", entries: [
                  {
                    name: "host",
                    label: "Host",
                    value: this.content.data?.host?.toString()
                  }
                ]
              }]
            }
          }
        }
        break;
      case "data.api.key":
        if (this.content.data?.api?.key) {
          const data = source.entries.find(entry => "entries" in entry && entry.prefix === "data");
          if (data) {
            const api: SettingCategoryModel|undefined = source.entries.find(entry => "prefix" in entry && entry.prefix === "api") as SettingCategoryModel|undefined;
            const key: SettingItemModel|undefined = api.entries.find((entry: SettingEntryModel) => "name" in entry && entry.name === "key") as SettingItemModel|undefined;
            // Replacing existing entry. 
            if (key) {
              const added = this.setItemValue(key, property);
              if (!Object.is(added, key)) {
                return {
                  ...source,
                  entries: source.entries.map(category => "prefix" in category && category.prefix === "api" ? {
                    ...category,
                    entries: category.entries.map(entry => entry === key ? this.setItemValue(entry as SettingItemModel, property) : entry)
                  } : category)
                }
              } else {
                // No change.
                return source;
              }
            } else if (api) {
              // Adding the key to the api category.
              const addedItem = this.setItemValue({ name: "key", label: "Key" } as SettingItemModel, property);
                return {
                  ...source,
                  entries: source.entries.map(category => "prefix" in category && category.prefix === "api" ? {
                    ...category,
                    entries: [...category.entries, addedItem]
                  } : category)
                }
            } else {
              // Adding the api to data
              const addedItem = this.setItemValue({ name: "key", label: "Key" } as SettingItemModel, property);
              const addedCategory = {
                prefix: "api",
                title: "API Settings",
                entries: [addedItem]
              }
              return {
                ...source,
                entries: source.entries.map(category => "prefix" in category && category.prefix === "data" ? {
                  ...category,
                  entries: [...category.entries, addedCategory]
                } : category)
              }
            }
          } else {
            return {
              ...source,
              entries: [...source.entries, {
                prefix: "data", title: "Data Settings", entries: [
                  {
                    name: "host",
                    label: "Host",
                    value: this.content.data?.host?.toString()
                  }
                ]
              }]
            }
          }
        }
        break;
      default:
        return source;
    }
    return source;
  }

  update(propPath: string[], value?: string, current?: TestSettings): TestSettings {
    var index = 0;
    if (this.prefix && propPath.join(".").startsWith(this.prefix + ".")) {
      do {
        index++;
      } while (propPath.slice(0, index).join(".") != this.prefix);
      console.log("Content index: %s, prefix: %s", index, this.prefix)
    } else if (this.prefix) {
      return current ?? this.content;
    }

    current ??= this.content;
    if (propPath.length == index) {
      return current;
    } else if (propPath.length == index + 1) {
      // The property is on top level.
      if (Object.is("test", propPath[index])) {
        this.content = { ...current, "test": value };
        return this.content;
      } else {
        console.warn("Unkown field %s", propPath[index]);
        return current;
      }
    } else {
      // Deep dive.
      switch (propPath[index]) {
        case "data":
          if (Object.is("host", propPath[index + 1])) {
            if (propPath.length > 2 + index) {
              return current;
            } else {
              try {
                if (value) {
                  const newHost = URL.parse(value);
                  if (newHost == null) {
                    console.warn("Invalid URL %s", value);
                    return current;
                  } else {
                    console.log("Updating host from %s to %s", current.data?.host, value);
                    this.content = {
                      ...current,
                      data: {
                        ...(current.data ?? {}),
                        host: newHost
                      }
                    };
                    return this.content;
                  }
                } else if (current.data?.host) {
                  console.log("Removing host %s", current.data?.host);
                  this.content = {
                    ...current,
                    data: {
                      ...current.data,
                      host: undefined
                    }
                  }
                  return this.content;
                }
              } catch (error) {
                // Invalid URL.
                return current;
              }
            }
          } else if (Object.is("api", propPath[index + 1])) {
            if (propPath.length == 3 + index && propPath[index + 2] === "key") {
              if (value) {
                if (validApiKey(value)) {
                  console.log("Updating api key from %s to %s", current.data?.api?.key, value);
                  this.content = {
                    ...current,
                    data: {
                      ...current.data,
                      api: {
                        key: value
                      }
                    }
                  }
                  return this.content;
                }

              } else if (current.data?.api?.key) {
                console.log("Removing api key");
                this.content = {
                  ...current,
                  data: {
                    ...current.data,
                    api: {
                      ...current.data.api,
                      key: undefined
                    }
                  }
                }
                return this.content;
              }
            }
          }
        default:
          console.warn("Unkown field %s", propPath.join("."));
          return current;
      }
    }
  }
}

export function SettingsApp() {
  const [controller, setController] = useState<TestSettingsController>(new TestSettingsController({}, "settings"));
  const [settings, setSettings] = useState<TestSettings>(controller.content);
  const setting: SettingItemModel = {
    name: "test",
    label: "Test value",
    value: settings.test
  };
  const subCategory: SettingCategoryModel = {
    prefix: "data",
    title: "Sub Category",
    entries: [{
      name: "host", label: "Host",
      value: settings?.data?.host?.toString()
    },
    { name: "api.key", label: "API Key", value: settings?.data?.api?.key }]
  };
  const category: SettingCategoryModel = {
    prefix: "settings",
    title: "Test Category",
    entries: [setting, subCategory]
  };
  try {
    const handleChange = (prop: string, value: string) => {
      console.log("App handling %s change to %s", prop, value);
      const settingPath = prop.split(".");
      setSettings((current: SettingsController<TestSettings>) => controller.update(settingPath, value, current));

    }
    console.table(setting)
    console.log(typeof SettingsItem);
    const field = html`<${SettingsItem} model="${setting}" onchange="${handleChange}" />`;
    return html`<div>
  <h4>Settings</h4>
  <${SettingsCategory}
  prefix="${category.prefix}"
  model="${category}"
  onchange="${handleChange}"
  />
  </div>`
  } finally {
    console.log("Setting rendered")
  }
}