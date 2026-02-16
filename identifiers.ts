import type {UUID} from 'crypto';

/**
 * Is a value an UUID.
 */
export function isUUID(t: unknown): t is UUID {
  return typeof t === "string" && /^(?:\p{Hex_Digit}{12})([-])(?:\p{Hex_Digit}{4}\1){3}(?:\p{Hex_Digit}{8})$/u.test(t)
}

/** 
 * A nil UUID.
 */
export const emptyUUID = "0".repeat(12) + "-" + ("0".repeat(4) + "-").repeat(3) + "0".repeat(8);

/** 
 * A max UUID.
 */
export const maxUUID = "f".repeat(12) + "-" + ("f".repeat(4) + "-").repeat(3) + "f".repeat(8);
/**
 * Is a value a partial UUID.
 */
export function partialUUID(t: string): boolean {
  return isUUID(t + emptyUUID.substring(t.length))
}
