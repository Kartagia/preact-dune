
export interface CookieOptions 
{
  HttpOnly?: boolean;
  MaxAge?: number;
  Secure?: boolean;
}

export interface Cookie 
{
    name: string;
    value?: string;
    options?: CookieOptions;
    toString?: () => string;
}

export function sprintCookieOptions(val?: CookieOptions|undefined): string {
  if (val) {
    const options =[];
    if (val.MaxAge)
      options.push(`Max-Age=${val.MaxAge}`)
    if (val.HttpOnly) {
      options.push("HttpOnly")
    }
    if (val.Secure)
      options.push("Secure");
    
    if (options.length) {
      return ";" + options.join(";");
    }
  }
  return "";
}

export function sprintCookie(val: Cookie): string {
  return `Set-Cookie: ${encodeURIComponent(val.name)}${val.value ? "=" + encodeURIComponent(val.value):""
  }${sprintCookieOptions(val.options)}`;
}

export function Cookie(name: string, value?: string, options?: CookieOptions):Cookie {
  return {
    name,
    value,
    options,
    toString() {
      return sprintCookie(this)
    }
  }
}

export interface DataSettingsModel {
  /**
   * The root URL for the API.
   */
  apiHost?: URL;
  
  /**
   * The API cookie.
   */
  apiCookie?: Cookie;
}

export interface SettingsModel {
  api: DataSettingsModel;
}

/**
 * Supported field types.
 */
export type FieldType = ("text"|"number"|"password"|"url"|"email")


export interface SettingItemModel {
  name: string;
  label: string;
  type?: FieldType;
  value?: string;
}

export interface SettingsCategoryModel {
  title: string;
  entries: SettingsEntryModel[];
  prefix?: string;
  open?: boolean;
  disabled?: boolean;
}


/**
 * Settings entry model.
 * Settings entry can be either an item or a category.
 */
export type SettingsEntryModel = SettingItemModel|SettingsCategoryModel;