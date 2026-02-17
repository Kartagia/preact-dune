

/**
 * The cookie related tools.
 * @module cookie
 */

/**
 * The cookie options.
 */

export interface CookieOptions {
    HttpOnly?: boolean;
    Expires?: Date | number;
    Secure?: boolean;
    MaxAge?: number;
    Domain?: string;
    Partitioned?: boolean;
    Path?: string;
    SameSite?: "Strict" | "Lax" | "None";
}

/**
 * Test validity of a domain name.
 * @param value The tested value.
 * @returns True, if and only if teh value is a valid domain name.
 */
export function validDomain(value: string): boolean {
    return /^(?:(?:[a-z]{1,63}|[a-z0-9][a-z0-9-]{0,61}[a-z0-9])\.)+[a-z]{2,63}$/.test(value)
        && !value.includes("--") && value.length <= 255;
}

/**
 * Test cookie path validity.
 * @param value The tested path.
 * @returns True, if and only if the path is a valid cookie path.
 */
export function validPath(value: string): boolean {
    return (/^\/?(?:(?:[a-zA-Z0-9_.!~*'()-]+|%\d{2})+(?:\/|$))+$/.test(value));
}

/**
 * Create a new cookie options.
 * @param value The cookien options interface.
 * @returns A valid cookie options derived from the given interface.
 * @throws {SyntaxError} The value was not a valid cookie options.
 */
export function CookieOptions(value: CookieOptions): CookieOptions {
    // Checking the cookie options.
    if (value.Expires) {
        // Checking the validity of the value.
    }
    if (value.MaxAge) {
        // Checking validity of the value.
        if (!Number.isInteger(value.MaxAge))
            throw SyntaxError("The Max Age must be an integer");
    }
    if (value.Domain) {
        // Test domain.
        if (!validDomain(value.Domain)) {
            if (value.Domain.length > 255) {
                throw SyntaxError("The Domain must not exceed 255 characters.");
            } else
                throw SyntaxError("The Domain must be a valid domain name");
        }
    }
    if (value.Path) {
        // Test validity of the path.
        if (!validPath(value.Path))
            // The path is invalid. 
            throw new SyntaxError("Invalid path value");
    }
    if (value.SameSite === "None" && !value.Secure) {
        throw new SyntaxError("The same site None requires Secure");
    }
    if (value.Partitioned && !value.Secure) {
        throw new SyntaxError("The Partitioned storage requires Secure");
    }
    return value;
}
/**
 * The cookie interface.
 */
export interface Cookie {
    name: string;
    value?: string;
    options?: CookieOptions;
    toString(): String;
}

/**
 * Test validity of a cookie options.
 * @param value The value of the tested value.
 * @param check Does the check fail by throwing an exception.
 * @returns True, if and only if the value is a valid cookie options.
 * @throws {SyntaxError} The check is true, and the value was not a valid cookie options.
 */
export function validCookieOptions(value: unknown, check: boolean = false): boolean {
    if (value === undefined) return true;
    if (typeof value !== "object") return false;
    for (const prop in value) {
        const propValue = value[prop as keyof typeof value];
        switch (prop) {
            case "Path":
                if (!validPath(propValue)) {
                    if (check)
                        throw new SyntaxError(`Invalid ${prop} option.`);
                    else
                        return false;
                }
                break;
            case "Domain":
                if (!validDomain(propValue)) {
                    if (check)
                        throw new SyntaxError(`Invalid ${prop} option.`);
                    else
                        return false;
                }
                break;
            case "SameSite":
                if (!["Strict", "Lax", "None"].includes(propValue)) {
                    if (check) {
                        throw new SyntaxError(`Invalid ${prop} option.`);
                    }
                    else
                        return false;
                }
                break;
            case "Expires":
                if (!(typeof propValue === "number" ||
                    propValue != null &&
                    typeof propValue === "object" && (
                        (propValue as Object instanceof Date)))) {
                    if (check) {
                        throw new SyntaxError(`Invalid ${prop} option.`);
                    } else {
                        return false;
                    }
                }
                break;
            case "MaxAge":
                if (!Number.isInteger(propValue)) {
                    if (check) {
                        throw new SyntaxError(`Invalid ${prop} option.`);
                    } else {
                        return false;
                    }
                }
                break;
            case "Secure": case "HttpOnly": case "Partitioned":
                if (propValue !== undefined && typeof propValue !== "boolean") {
                    if (check)
                        throw new SyntaxError(`Invalid ${prop} option.`);

                    else
                        return false;
                }
            default:
            // Unknown options are accecpted
        }
    }
    return true;
}
/**
 * Get the cookie options.
 * @param options The cookie options.
 * @param extensionHandler The handler of the extended options.
 * @returns The strings of the cookie option values to be added into the cookie option
 * part of the cookie header.
 */

export function GetCookieOptions(options?: CookieOptions,
    extensionHandler?: (prop: string, value: unknown) => string | undefined): string[] {
    const result: string[] = [];
    if (options) {
        for (const prop in options) {
            switch (prop) {
                case "Domain": case "Path": case "SameHost":
                    if (options?.[prop as keyof CookieOptions] != undefined) {
                        result.push(`${prop}:${options[prop as keyof CookieOptions]}`);
                    }
                    break;
                case "Expires":
                    if (typeof options[prop] === "number") {
                        // The cookie is a number. 
                        result.push(`Expires${new Date(options[prop]).toUTCString()}`);
                    } else {
                        // The cookie is a date.
                        result.push(`Expires:${options[prop]?.toUTCString()}`);
                    }
                    break;
                case "MaxAge":
                    result.push(`Max-Age:${options[prop]}`);
                    break;
                case "HttpOnly": case "Secure": case "Partitioned":
                    if (prop in options && options[prop as keyof CookieOptions]) {
                        result.push(prop);
                    }
                    break;
                default:
                    // The default is ignoring.
                    const encoded = extensionHandler?.(prop, options[prop as keyof typeof options]);
                    if (encoded !== undefined) {
                        result.push(encoded);
                    }
            }
        }
    }
    return result;
}
/**
 * Test validity of a cookie name.
 * @param name The tested name.
 * @returns True, if an donly if the anme is a valid cookie name.
 */

export function validCookieName(name: string): boolean {
    return /^[^\x00-\x1f()<>@,;:\s\\"\/[\]?={}\xe0-\xff]+$/.test(name);
}
/**
 * Check validity of a cookie value.
 * @param value The tested value.
 * @param check Does the failure throw exception instead of false.
 * @returns True, if and only if the check passes.
 * @throws {SyntaxError} The check is true, and the value is invalid.
 */

export function isValidCookie(value: unknown, check: boolean = false) {
    if (value != null && typeof value == "object") {
        if (!("name" in value) || typeof value.name != "string" ||
            !validCookieName(value["name"])) {
            if (check) {
                // Throwing exception.
                throw new SyntaxError(
                    "name" in value ?
                        "Invalid cookie name" : "Missing cookie name"
                );
            }
            return false;
        }
        if ("options" in value && value.options !== undefined &&
            typeof value.options === "object" && !validCookieOptions(
                value.options, check
            )) {
            return false;
        }
        if ("options" in value && value.name.startsWith("__")) {
            // Testing special prefixes.
            const name = value.name;
            const options = value.options as CookieOptions;
            if ((name.startsWith("__Secure-") || name.startsWith("__Host-") ||
                name.startsWith("__Http-")
            ) && !(options?.Secure)) {
                if (check)
                    throw new SyntaxError("The cookie name requires Secure");

                else
                    return false;
            }
            if (name.startsWith("__Host-") && !(options?.Path &&
                options?.Domain)) {
                if (check)
                    throw new SyntaxError("The cookie name requires Secure and Domain");

                else
                    return false;
            }
            if ((name.startsWith("__Host-Http-") || name.startsWith("__Http-"))
                && !(options?.HttpOnly)) {
                if (check)
                    throw new SyntaxError("The cookie name requires HttpOnly");

                else
                    return false;
            }

        }
        return true;
    }
    return false;
}

/**
 * Parse cookie options. 
 * @param value The cookie option value string representation, or a list of cookie
 * representation values. 
 * @param parseAndAddOption The optional function to allow additional cookie options.
 * @returns The parsedc ookie options.
 * @throws {SyntaxError} The one or more of the cookie representations was invalid.
 */
export function parseCookieOptions(value: string | string[],
    parseAndAddOption?: (source: CookieOptions, parsed: string) => CookieOptions
): CookieOptions {
    const parsed = typeof value === "string" ? [value] : value;
    var result: CookieOptions = {};
    for (const option of parsed) {
        if (option.includes("=")) {
            const [optionName, ...optionValue] = option.split("=");
            switch (optionName) {
                case "Domain":
                    if (validDomain(optionValue.join("=")))
                        result[optionName] = optionValue.join("=");
                    else
                        throw new SyntaxError(`Invalid ${optionName} value.`);
                    break;
                case "Path":
                    if (validPath(optionValue.join("=")))
                        result[optionName] = optionValue.join("=");
                    else
                        throw new SyntaxError(`Invalid ${optionName} value.`);
                    break;
                case "SameSite":
                    if (["Strict", "Lax", "None"].includes(optionValue.join("="))) {
                        result[optionName] = optionValue.join("=") as ("Strict" | "Lax" | "None");
                    } else {
                        throw new SyntaxError(`Invalid ${optionName} value.`);
                    }
                    break;
                case "Expires":
                    try {
                        const expireDate = new Date(optionValue.join("="));
                        if (isNaN(expireDate.valueOf())) {
                            throw new SyntaxError("Invalid date value!");
                        }
                        result[optionName] = expireDate;
                    } catch (err) {
                        throw new SyntaxError(`Invalid ${optionName} value.`);
                    }
                    break;
                case "Max-Age":
                    try {
                        if (/^[+-]?\d+$/.test(optionValue.join("="))) {
                            result.MaxAge = Number.parseInt(optionValue.join("="));
                        } else {
                            throw new SyntaxError();
                        }
                    } catch (err) {
                        throw new SyntaxError(`Invalid ${optionName} value.`);
                    }
                    break;
                case "Secure": case "HttpOnly": case "Partitioned":
                    throw new SyntaxError(`Invalid ${optionName} option.`);
                default:
                    result = parseAndAddOption?.(result, option) ?? result;
            }
        } else {
            // The option does only contain the cookie value.
            switch (option) {
                case "Domain":
                case "Path":
                case "SameSite":
                    throw new SyntaxError(`Invalid ${option} option.`);
                    break;
                case "Secure": case "HttpOnly": case "Partitioned":
                    result[option] = true;
                    break;
                default:
                    result = parseAndAddOption?.(result, option) ?? result;
            }
        }
    }
    return result;
}

/**
 * Parse a cookie. 
 * 
 * @param value The cookie content.
 * @returns The cookie parsed from the string.
 * @throws {SyntaxError} The value was not a valid cookie.
 */
export function parseCookieContent(value: string): Cookie {
    if (value.includes(";")) {
        // The options exists.
        const [nameAndValue, ...options] = value.split(";");

        const [name, ...cookieValue] = value.split("=");
        return {
            name,
            value: cookieValue === undefined || cookieValue.length === 0 ? undefined : decodeURIComponent(cookieValue.join("=")),
            options: parseCookieOptions(options)
        };
    } else {
        // The options does not exist.
        if (value.includes("=")) {
            // We do have value.
            const [name, ...cookieValue] = value.split("=");
            if (!validCookieName(name)) {
                throw new SyntaxError("Invalid cookie name");
            }
            return {
                name,
                value: decodeURIComponent(cookieValue.join("="))
            };
        } else {
            // The cookie only contains the name.
            if (!validCookieName(value)) {
                throw new SyntaxError("Invalid cookie name");
            }
            return {
                name: value
            };
        }
    }
}

/**
 * Parse cookie.
 * @param value The cookie value.
 * @returns The parsed cookie value.
 * @throws {SyntaxError} The value did not contain a valid cookie.
 */
export function ParseCookie(value: string): Cookie {
    if (value.startsWith("Set-Cookie:")) {
        return parseCookieContent(value.substring("Set-Cookie:".length).trim());
    } else {
        return parseCookieContent(value);
    }
}
/**
 * Get the set cookie header.
 * @param cookie The cookie, whose set cookie header is requested.
 * @returns The string of the header.
 * @throws {SyntaxError} The cookie was invalid.
 */

export function SetCookie(cookie: Cookie): string {
    if (isValidCookie(cookie, true)) {
        return `Set-Cookie:${cookie.name}${(cookie.value ? "=" +
            encodeURIComponent(cookie.value) : "")}${cookie.options ? ";" +
                GetCookieOptions(cookie.options).join(";")
                : ""}`;
    } else {
        throw new SyntaxError("Invalid cookie");
    }
}

