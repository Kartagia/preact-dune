import {isUUID, partialUUID} from './identifiers';

/**
 * A fetch response.
 * @template Result The response value type.
 */
export interface FetchResponse<Result=string> {
  /**
   * The status message.
   */
  status: number;
  
  /**
   * The result of the response.
   */
  result?: Result;
}

/**
 * The fetch error type.
 */
export interface FetchError<Source=void, Result=void> extends FetchResponse<Result> {

  /**
   * The source of the request.
   */
  source: Source;
  
  /**
   * The error message.
   */
  message?: string;
}

/**
 * The rest method description.
 */
export interface RestMethod {
  /**
   * The name of the method.
   */
  readonly name: string;
  /**
   * Is the method vslid.
   */
  readonly isValid: boolean;
  /**
   * The optional label of the method.
   * @default {@link #name}
   */
  readonly label?: string;
  /**
   * The optional value of the
   * method.
   * @default {@link #name}
   */
  readonly value?: string;
}

/**
 * Default methods.
 */
export const methods: ReadonlyArray<Readonly<RestMethod>> = [
  {
    name: "all",
    label: "Get All",
    get isValid() {
      return true;
    }
  },
  {
    name: "one",
    label: "Get One",
    get isValid() {
      return true;
    }
  },
  {
    name: "create",
    label: "Create",
    get isValid() {
      return true;
    }
  },
  {
    name: "update",
    label: "Update",
    get isValid() {
      return true;
    }
  },
  {
    name: "remove",
    label: "Delete",
    get isValid() {
      return true;
    }
  }
];

/** Fetch method definition.
 * @template Source The source value type.
 * @template Result The resulting value type.
 * @template ERROR The rejected error type.
 */
export interface FetchMethodRequest<Source, Result=Source, ERROR=FetchError<Source,Result>> extends RestMethod {
  
  /**
   * Format the source value into a fetch request.
   * @param source The formatted value.
   * @returns The promise of the modified request.
   * @throws {ERROR} The source was rejected.
   */
  formatRequest(source: Request, value: Source): Promise<Request>;
  /**
   * Parse the fetch request into the result value.
   * @param source The parsed response.
   * @returns The promise of parsed result.
   * @throws {ERROR} The rejection value on error.
   */
  parseResponse(source: Response): Promise<Result>;
}