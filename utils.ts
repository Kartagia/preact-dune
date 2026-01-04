
export interface Equality<T=any> {
  /**
   * @param a The compared value
   * @param b The value compared to.
   * @returns True, if and only if a is equal to b.
   */
  (a: T, b:T):boolean
}

/**
 * Loose equality.
 * @type {Equality<T>}
 */
export function looseEquality<T>(a:T, b:T) {
  return a == b;
}

/**
 * Strict equality.
 * @type {Equality<T>}
 */
export function strictEquality<T>(a:T, b:T) {
  return a === b;
}

/**
 * Same value equality.
 * @type {Equality<T>}
 */
export function sameValueEquality<T>(a:T, b:T) {
  return Object.is(a,b);
}
/**
 * Same value zero equality.
 * @type {Equality<T>}
 */
export function sameValueZeroEquality<T>(a:T, b:T) {
  return a === b || (typeof a === typeof b && typeof a === "number" && (a !== a) && (b !== b) )
}


export function orElse<T>(value: T?, defaultValue:T, nullValue:T=defaultValue):T {
  if (value === null) {
    return nullValue;
  } 
  if (value === undefined) {
    return defaultValue;
  }
  return value;
}

export function defaultCompare<T>(a: T, b: T, equals: Equality<T> = looseEquality
): number {
  return equals(a,b) ? 0 : a < b ? -1 : (a > b ? 1 : Number.NaN )
}

export function sameValueZeroCompare<T>(a: T, b: T) {
  return defaultCompare(a,b, sameValueZeroEquality)
}

export function sameValueCompare<T>(a: T, b: T) {
  return defaultCompare(a,b, sameValueEquality)
}

/**
 * Convert a string into title case.
 * @param text The converted text.
 * @returns The text with first glyph in upper case.
 */
export function asTitle(text: string):string {
  console.group(`asTitle(${text})`);
  try {
    const first = text.codePointAt(0);
    const firstChar = String.fromCodePoint(first);
    return firstChar.toLocaleUpperCase() + text.substring(firstChar.length);
  } finally {
    console.groupEnd();
  }
}