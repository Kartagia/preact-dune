
export function orElse<T>(value: T?, defaultValue:T, nullValue:T=defaultValue):T {
  if (value === null) {
    return nullValue;
  } 
  if (value === undefined) {
    return defaultValue;
  }
  return value;
}