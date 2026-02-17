import { Cookie, CookieOptions, GetCookieOptions, SetCookie } from "./cookie";
export { CookieOptions, Cookie };

export function sprintCookieOptions(val?: CookieOptions | undefined): string {
  if (val) {
    return GetCookieOptions(val).reduce((result, value) => {
      if (result) {
        return result + ";" + value;
      } else {
        return ";" + value;
      }
    }, "");
  }
  return "";
}

export function sprintCookie(val: Cookie): string {
  return SetCookie(val);
}

/**
 * Settings description is used to describe the setting.
 */
export interface SettingsDescription {
  /**
   * The category prefixes. This is the list of the allowed category names. An undefined value in the list indicates
   * an unprefixed categories are allowed. An undefined value indicates all category names are allowed. 
   */
  readonly categoryNames?: string[];

  /**
   * The prefixes of the categories. 
   * This array always has same number of elements as the categories, and contain prefix of each category.
   */
  readonly categoryPrefixes?: string[];
  /**
   * The item names. This is the list of the allowed item names.
   */
  readonly itemNames?: string[];
  /**
   * The current items of the setting.
   */
  readonly items?: SettingItemModel[];
  /**
   * The current categories of the setting.
   */
  readonly categories?: SettingCategoryModel[];
  /**
   * The entries of the setting.
   */
  readonly entries?: SettingEntryModel[];
}

/**
 * Create a category description from content.
 * @param content The optional content of the category description.
 * @returns The category description.
 * @throws {SyntaxError} The category content is not valid.
 */
export function SettingsDescription(content?: SettingsDescription): SettingsDescription {
  if (content) {
    var result: SettingsDescription = {
      get categoryPrefixes() {
        return this.categories?.map((category: SettingCategoryModel) => category.title);
      }
    };
    if ("entries" in content) {
      result = {
        ...result,
        entries: content.entries
      }
    }
    if ("items" in content) {
      if ("itemNames" in content) {
        if (content.items.some(item => !this.content.itemNames.includes(item.name))) {
          throw new SyntaxError("Description items cannot contain an entry not listed on the itemNames");
        }

        result = {
          ...result,
          itemNames: content.itemNames,
          categories: content.categories
        }
      } else {
        result = {
          ...result,
          categories: content.categories
        }
      }
    }
    if ("categories" in content) {
      if ("categoryNames" in content) {
        if (content.categories.some(item => !(this.content.categoryNames.includes(item.title)))) {
          throw new SyntaxError("Description content titles must be listed in the contentNames");
        }
        result = {
          ...result,
          categoryNames: content.categoryNames,
          categories: content.categories
        }
      } else {
        result = {
          ...result,
          categories: content.categories
        }
      }
    }

    return result;
  } else {
    // Creating default settings.
    return {
      get categoryNames() {
        return undefined;
      },
      get categoryPrefixes() {
        return this.categories.map(category => category.prefix);
      },
      get itemNames() {
        return undefined;
      },

      get categories(): Array<SettingCategoryModel> {
        return this.entries.filter((entry: SettingEntryModel) => "entries" in entry);
      },
      get items(): Array<SettingItemModel> {
        return this.entries.filter((entry: SettingEntryModel) => !("entries" in entry));
      },
      get entries() {
        return [];
      }
    }
  }
}

/**
 * Add a category to the category description.
 * @param source The source category description.
 * @param category THe category
 * @param addCategoryName Does the operation add a missing category name to the category names.
 * @returns The new settings description with category added. 
 * @throws {SyntaxError} The category was not suitable for the description.
 */
export function addCategory(source: SettingsDescription, category: SettingCategoryModel, addCategoryName: boolean = false): SettingsDescription {
  if (!addCategoryName && !(source.categoryNames?.includes(category.title) ?? true)) {
    throw new SyntaxError("Cannot add a category not listed in the category names");
  } else if (addCategoryName && !(source.categoryNames?.includes(category.title) ?? true)) {
    return {
      ...source,
      categoryNames: [...(source.categoryNames ?? []), category.title],
      entries: [...(source.entries ?? []), category]
    }
  } else {
    return {
      ...source,
      entries: [...(source.entries ?? []), category]
    };
  }
}

export interface DataSettingsModel extends SettingsDescription {
  /**
   * The root URL for the API.
   */
  apiHost?: URL;

  /**
   * The API cookie.
   */
  apiCookie?: Cookie;
}

/**
 * Settings model.
 */
export interface SettingsModel extends SettingsDescription {
  /**
   * The title of the settings.
   */
  title?: string;
}

/**
 * Convert a camel-case name into the words.
 * @param name The camel case name.
 * @returns The came case word as a list of capitalized words.
 */
export function nameToLabel(name: string) {
  // Converting camel case to separte words. 
  const regex = /(\p{Lu})/gu;
  const segments = name.split(regex);

  return segments.reduce((result: string, segment: string, index: number) => {
    if (index == 0) {
      const firstGlyph = String.fromCharCode(segment.codePointAt(0));
      return result + firstGlyph.toLocaleUpperCase() + segment.substring(firstGlyph.length);
    } else if ((index % 2) != 0) {
      return result + " " + segment;
    } else {
      return result + segment;
    }
  }, "");
}

/**
 * Default types. 
 */
const defaultTypes: Array<{ test(val: any): boolean; parse(source: SettingItemModel, val: any): SettingItemModel | undefined }> = [
  {
    test(value: any) { return ["number", "string"].includes(typeof value); }, parse(source: SettingItemModel, value: any) {
      return {
        ...source,
        value: "" + value
      }
    }
  },
  {
    test(value: any) { return ["boolean"].includes(typeof value); }, parse(source: SettingItemModel, value: any) {
      return {
        ...source,
        value: (value ? true : false).toString()
      }
    }
  },
  {
    test(value: any) {
      return (typeof value === "object" && value != null && value instanceof URL);
    },
    parse(source, val) {
      return {
        ...source,
        value: (val as URL).toString()
      }
    }
  }
];

export function defaultItemEntries<T = any>(value: T, itemEntry: SettingItemModel): SettingItemModel | undefined {
  const currentType = defaultTypes.find(current => current.test(value) && current.parse(itemEntry, value) !== undefined);
  if (currentType) {
    return currentType.parse(itemEntry, value);
  }
  return undefined;
}

/**
 * Create a settings model.
 * @param settings The settings of the model.
 * @returns The settings model. 
 */
export function SettingsModel<T>(settings: T, getItemEntry: ((value: unknown, itemEntry: SettingItemModel) => SettingItemModel | undefined) = defaultItemEntries): SettingsModel {
  const entries: Array<SettingEntryModel> = [];

  // Generating the entries from the setting.
  for (const prop of Object.getOwnPropertyNames(settings)) {
    const item = getItemEntry(settings[prop], {
      name: prop,
      label: nameToLabel(prop)
    });
    if (item) {
      // The entry is an item entry. 
      entries.push(item);
    } else {
      // Possible category.
    }
  }

  return {
    get categories(): Array<SettingCategoryModel> {
      return this.entries.filter((entry: SettingEntryModel) => "entries" in entry);
    },
    get items(): Array<SettingItemModel> {
      return this.entries.filter((entry: SettingEntryModel) => !("entries" in entry));
    },
    entries,
    get categoryNames() {
      return this.categories.reduce((result: string[], entry: SettingCategoryModel) => {
        if (!result.includes(entry.title)) {
          result.push(entry.title);
        }
        return result;
      }, []);
    },
    get itemNames() {
      return this.items.reduce((result: string[], entry: SettingItemModel) => {
        if ("name" in entry && !result.includes(entry.name)) {
          result.push(entry.name);
        }
        return result;
      }, []);
    }
  }
}

/**
 * Supported field types.
 */
export type FieldType = ("text" | "number" | "password" | "url" | "email")

/**
 * The supported field types.
 */
export const FieldTypes: ReadonlyArray<FieldType> = Object.freeze(["text", "number", "password", "url", "email"]);

/**
 * Type check for a field value.
 * @param val The tested value.
 * @returns True, if and only if the value is a valid field type {@link FieldType}.
 */
export function isFieldType(val: unknown): val is FieldType {
  return typeof val === "string" && (FieldTypes as string[]).includes(val);
}

/**
 * The setting item model represents a settings item with single control.
 */
export interface SettingItemModel {
  name: string;
  label: string;
  type?: FieldType;
  value?: string;
}

/**
 * Is a value a setting item model.
 * @param value The tested value.
 * @returns True, if and only if the value is a valid setting item model {@link SettingItemModel}.
 */
export function isSettingItemModel(value: unknown): value is SettingItemModel {
  return value != null && typeof value === "object" && [
    {prop: "name", valid: (val: unknown) => typeof val === "string"},
    {prop: "label", valid: (val: unknown) => typeof val === "string"}
  ].every( ({prop, valid}) => (prop in value && valid(value[prop])))
  && 
  [
    {prop: "value", valid: (val: unknown) => typeof val === "string"},
    {prop: "type", valid: isFieldType}
  ].every( ({prop, valid}) => (!(prop in value) || valid(value[prop])))
}
/**
 * The setting item model represents a settings category with one or more categories or items. 
 * 
 * The setting category may have prefix determining the prefix of the contained item names. 
 */
export interface SettingCategoryModel {
  /**
   * The title of the setting category. 
   */
  title: string;
  /**
   * The entries of the setting category.
   */
  entries: SettingEntryModel[];
  /**
   * The previx of the setting category.
   */
  prefix?: string;
  /**
   * Are the setting category entries visible.
   */
  open?: boolean;
  /**
   * Is the setting category disabled.
   */
  disabled?: boolean;
}

/**
 * Type check for Setting Category Model.
 * @param value The tested value.
 * @returns True, if and only if the valeu is setting category model {@link SettingCategoryModel}.
 */
export function isSettingCategoryModel(value: unknown): value is SettingCategoryModel {
  return value != null && typeof value === "object" && [
    {prop: "title", valid: (val: unknown) => typeof val === "string"},
    {prop: "entries", valid: (val: unknown) => typeof val === "object" && val != null && Array.isArray(val) && val.every(
      item => isSettingCategoryModel(item) || isSettingItemModel(item)
    )}
  ].every( ({prop, valid}) => (prop in value && valid(value[prop])))
  && 
  [
    {prop: "prefix", valid: (val: unknown) => typeof val === "string"},
    {prop: "title", valid: (val: unknown) => typeof val === "string"},
    {prop: "open", valid: (val: unknown) => typeof val === "boolean"},
    {prop: "disabled", valid: (val: unknown) => typeof val === "boolean"}
  ].every( ({prop, valid}) => (!(prop in value) || valid(value[prop])))

}

/**
 * Settings entry model.
 * Settings entry can be either an item or a category.
 */
export type SettingEntryModel = SettingItemModel | SettingCategoryModel;