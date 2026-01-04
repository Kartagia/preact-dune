const indexRe = /(?:\d+\$)/;
const capturingIndexRe = /(?:(?<index>\d+)\$)?/;
const lengthRe = /(?:(?:[- +0])?\d*(?:\.\d+)?)/;
const capturingLengthRe = /(?:(?<variant>[- +0])?(?:(?<length>\d+)?\.(?<precision>\d+)?)?)?/;
const typeRe = /(?:[dsfixoO])/;
const capturingTypeRe = /(?<type>[dsfixoO])/;
const placeholderRegExp = RegExp("(%(?:" + "%|" +
  indexRe.source + "?" +
  lengthRe.source + "?" +
  typeRe.source +
  "))", "g");

const capturingPlaceholderRe = new RegExp(
  "^(%(?:" + "(?<type>%)" + "|" + capturingIndexRe.source +
  capturingLengthRe.source +
  capturingTypeRe.source +
  "))$", "g"
);

/**
 * The placeholder value type.
 */
export type ValueType = "optimal" | "object" | "decimal" | "string" | "float" | "integer";

/**
 * The placeholder.
 */
export interface Placeholder {
  index ? : number;
  length ? : number;
  precision ? : number;
  variant ? : string;
  type: ValueType;
}

export function parseType(arg: string) {
  // body...
  switch (arg) {
    case "o":
      return "optimal";
    case "O":
      return "object";
    case "d":
      return "decimal";
    case "f":
      return "float";
    case "i":
      return "integer";
    case "s":
      return "string";
    default:
      undefined;
  }
}

export function parsePlaceholder(token: string): Placeholder | string {
  let match = capturingPlaceholderRe.exec(token);
  if (match) {
    let indexStr: string;
    let precisionStr: string;
    let lengthStr: string;
    let index: number | undefined;
    let length: number | undefined;
    let precision: number | undefined;
    if (indexStr = match.groups?.["index"]) {
      index = Number.parseInt(indexStr);
    }
    if (lengthStr = match.groups?.["length"]) {
      length = Number.parseInt(lengthStr);
    }
    if (precisionStr = match.groups?.["precision"]) {
      precision = Number.parseInt(precisionStr);
    }
    const type = parseType(match.groups?.["type"]);
    if (type)
      return {
        index,
        length,
        precision,
        variant: match.goups?.[variant],
        type
      };
    else {
      return "%";
    }
  } else
    return token;
}

export function formatDecimal(value: any, place: Placeholder) {
  //console.group("formatDecimal");
  try {
    if (typeof value === "number") {
      return Number.toString(value);
    } else {
      return Number.toString(Number.NaN);
    }
  } finally {
    //console.groupEnd()
  }
}

export function formatFloat(value: any, place: Placeholder) {
  const {
    length,
    precision,
    variant,
    type
  } = place;
  //console.group("formatFloat");
  try {
    const result = "" + (+value);
    return result;
  } finally {
    //console.groupEnd();
  }
}

function formatInt(value: any,
  place: Placeholder) {
  //console.group("formatInt(" + typeof value +")");
  try {
    const {
      length,
      precision,
      variant,
      type
    } = place;
    //console.table({length, precision, variant, type});
    if (Number.isInteger(value)) {
      //console.log("Integer value %i", value);
      const result = "" + value;
return result;
    } else {
      //console.log("Not an integer value %i", value);
      return "" + Number.NaN;
    }
  } finally {
    //console.groupEnd();
  }
}

export function formatString(
  value: any,
  place: Placeholder) {
  const {
    length,
    precision,
    variant,
    type
  } = place;
  let result = "" + value;
  
  return " ".repeat(Math.max(0, (precision ?? 0) - result.length)) + result.substring(0, Math.min(length ?? result.length, result.length));
}

export function formatOptimal(value: any, place: Placeholder) {
  const {
    length,
    precision,
    variant,
    type
  } = place;
  switch (typeof value) {
    case "undefined":
      return "[undefined]";
    case "bigint":
      return BigInt.toString(value);
    case "symbol":
      if (Symbol.keyFor(value)) {
        return `[Symbol ${Symbol.keyFor(value)}]`
      } else {
        return `[Local Symbol]`;
      }
    case "function":
      return `${value.name}`;
    case "object":
      if (value === null) {
        return "[null]";
      } else if (Array.isArray(value)) {
        return `[${
          value.map( v => formatOptimal(v, place)).join(",")
        }]`
      } else if ("toString" in value) {
        return value.toString()
      } else if (Symbol.toPrimitive in value) {
        return `{${
          formatOptimal(value[Symbol.toPrimitive](), place)
        }}`;
      } else {
        return `${value.constructor?.name ?? value.prototype?.constructor?.name ?? ""}=${formatObject(value, place)}`
      }
    default:
      return "" + value;
  }
}

export function formatObject(value: any, place: Placeholder) {
  const {
    length,
    precision,
    variant,
    type
  } = place;
  if (typeof value === "object") {
    return `{${
      Object.getOwnPropertyNames(value).join(",\n")
    }}`;
  } else {
    return "[Non-Object]";
  }
}

export type FormatSegment = Placeholder | string;

export function parseTemplate(template: string): FormatSegment[] {
  return template.split(placeholderRegExp).map(parsePlaceholder);
}

export function formatTemplate(
  segments: FormatSegment[],
  ...args: any[]
) {
  try {
    const { formatted, argCount } = segments.reduce(
      (res, segment, index) => {
        if (typeof segment === "object") {
          if (segment.index === undefined) {
            if (res.argCount >= args.length) {
              throw new SyntaxError(`Missing ${segment.type} argument at index ${res.argCount}`);
            }
            res.formatted.push(
              formatSegment({
                  ...segment,
                  index: ++res.argCount
                },
                args
              )
            )
          } else {
            if (segment.index > args.length) {
              throw new SyntaxError(`Missing ${segment.type} argument at index ${segment.index-1}`);
            }
            res.formatted.push(
              formatSegment(segment, args[segment.index - 1])
            )
          }
        } else {
          // A string segment
          res.formatted.push(segment)
        }
        return res;
      }, {
        formatted: [],
        argCount: 0
      } as {
        formatted: FormatSegment[];
        argCount: number;
      }
      
    ); // reduce
    
    return [formatted.join(""),
      ...args.slice(argCount, args.length).map(
        v => formatOptimal(v, { type: "optimal" })
      )].join(" ")
  } finally {
  }
}

/**
 * Format a string.
 * @param template The format template.
 * @param args The template values.
 * @returns The formatted string.
 */
export function format(template: string, ...args: any[]): string {
  const segments = parseTemplate(template);
  return formatTemplate(segments, ...args);
}


/**
 * Format a segment.
 * @param segment The formatted segment.
 * @param args The command arguments.
 * @returns The formatted string.
 * @throws {SyntaxError} There was not enough arguments.
 */
export function formatSegment(segment: FormatSegment, args: any[]): string {
  if (segment) {
    if (typeof segment === "object") {
      if (segment.index == null) {
        throw new SyntaxError("Missing segment index")
      }
      if (segment.index > args.length) {
        throw SyntaxError(`Missing format ${segment.type} argument at ${segment.index -1}!`);
      }
      switch (segment.type) {
        case "optimal":
          return formatOptimal(args[segment.index - 1], segment);
        case "object":
          return formatObject(args[segment.index - 1], segment);
        case "decimal":
          return formatNumber(args[segment.index - 1], segment);
        case "float":
          return formatFloat(args[segment.index - 1], segment);
        case "integer":
          return formatInt(args[segment.index - 1], segment);
        case "string":
          return formatString(args[segment.index - 1], segment)
        default:
          return "";
      }
    } else {
      return segment;
    }
  }
  
}