
export interface Equality<T = any> {
  /**
   * @param a The compared value
   * @param b The value compared to.
   * @returns True, if and only if a is equal to b.
   */
  (a: T, b: T): boolean
}

/**
 * Loose equality.
 * @type {Equality<T>}
 */
export function looseEquality<T>(a: T, b: T) {
  return a == b;
}

/**
 * Strict equality.
 * @type {Equality<T>}
 */
export function strictEquality<T>(a: T, b: T) {
  return a === b;
}

/**
 * Same value equality.
 * @type {Equality<T>}
 */
export function sameValueEquality<T>(a: T, b: T) {
  return Object.is(a, b);
}

/**
 * Same value zero equality.
 * @type {Equality<T>}
 */
export function sameValueZeroEquality<T>(a: T, b: T) {
  return a === b || (typeof a === typeof b && typeof a === "number" && (a !== a) && (b !== b))
}


export function orElse<T>(value: T | undefined | null, defaultValue: T, nullValue: T = defaultValue): T {
  if (value === null) {
    return nullValue;
  }
  if (value === undefined) {
    return defaultValue;
  }
  return value;
}

/**
 * A comparison result.
 */
export type ComparisonResult = -1 | 0 | 1;

/**
 * Compare two values
 * 
 * @param compared The compared value.
 * @param comparee The value compared with.
 * @returns The signum of the comparison result: -1 for compared less than comparee, 0 for compared equla comparee, and 1 for compared
 * greater than comparee.
 * @throws {SyntaxError} The values are not comparable.
 */
export type Compare<T> = (compared: T, comparee: T) => ComparisonResult;

/**
 * Compare values using loose equality.
 * @param a The compared value.
 * @param b The value compared with.
 * @returns The comparison result.
 */
export function defaultCompare<T>(a: T, b: T): ComparisonResult;

/**
 * Compare values using an equality.
 * @param a The compared value.
 * @param b The value compared with.
 * @param equals The equality used.
 * @returns The comparison result.
 */
export function defaultCompare<T>(a: T, b: T, equals: Equality<T>): ComparisonResult;
export function defaultCompare<T>(a: T, b: T, equals: Equality<T> = looseEquality
): ComparisonResult {
  if (equals(a, b)) return 0;
  if (a < b) return -1;
  if (a > b) return 1;
  throw new SyntaxError("Values are not comparable");
}

/**
 * Compare values using same value zero equality.
 * @param a The compared value.
 * @param b The value compared with.
 * @returns The comparison result.
 */
export function sameValueZeroCompare<T>(a: T, b: T): ComparisonResult | number {
  return defaultCompare(a, b, sameValueZeroEquality)
}

/**
 * Compare values using same value equality.
 * @param a The compared value.
 * @param b The value compared with.
 * @returns The comparison result.
 */
export function sameValueCompare<T>(a: T, b: T): ComparisonResult | number {
  return defaultCompare(a, b, sameValueEquality)
}

/**
 * Compare values using strict equality.
 * @param a The compared value.
 * @param b The value compared with.
 * @returns The comparison result.
 */
export function strictValueCompare<T>(a: T, b: T): ComparisonResult | number {
  return defaultCompare(a, b, strictEquality)
}


/**
 * Convert a string into title case.
 * @param text The converted text.
 * @returns The text with first glyph in upper case.
 */
export function asTitle(text: string): string {
  console.group(`asTitle(${text})`);
  try {
    const first = text.codePointAt(0);
    if (first == null) {
      return text;
    }
    const firstChar = String.fromCodePoint(first);
    return firstChar.toLocaleUpperCase() + text.substring(firstChar.length);
  } finally {
    console.groupEnd();
  }
}