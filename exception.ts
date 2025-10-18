
/**
 * An exception is an error with optional detail and cause.
 */
export class Exception<DETAIL=void,CAUSE=any> extends Error {
  
  private _detail?: DETAIL;
  private _cause?: CAUSE;
  
  constructor(message: string, detail?:DETAIL = undefined, cause?: CAUSE = undefined ) {
    super(message);
    this.name = this.constructor.name;
    this.cause = cause;
    this.detail = detail;
  }

  /**
   * The cause of the exception.
   */
  get cause() {
    return this.cause;
  }
  
  /**
   * The detail of the exception.
   */
  get detail() {
    return this.detail;
  }
}

/**
 * An exception indicating the operation is not supported.
 */
export class UnsupportedError extends Exception {
  
  constructor(message: string) {
    super(message);
  }
}