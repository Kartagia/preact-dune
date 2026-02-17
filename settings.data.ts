import { Cookie, CookieOptions, GetCookieOptions, SetCookie } from "./cookie";
import { SettingsDescription } from "./settings.model";


/**
 * The settings for data settings.
 */
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

