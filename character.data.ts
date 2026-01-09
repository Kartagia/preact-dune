
/**
 * Character data retrieval
 * @module
 */

export interface Entry<Id, Value> {
  /**
   * The identifier fo the entry.
   */
  id: Id;
  /**
   * The value of the entry.
   */
  value: Value;
}

export interface ErrorEntry<Id = void> {

  /**
   * The identifier of the erroneous entry.
   */
  id: Id;

  /**
   * The status code of the error.
   */
  status: number;

  /**
   * The error message. 
   */
  message: string;
}


export interface NotFoundEntry<Id = void> extends ErrorEntry<Id> {

  /**
   * The status is fixed 404 for not found error.
   */
  status: 404;
}

export interface NotAvailable<Id = void> extends ErrorEntry<Id> {

  /**
   * The staus is fixed 406 for not available. 
   */
  status: 406;
}

/**
 * A data access object is a generalization of a data access object. 
 */
export interface DAO<Value, Id = string> {

  /**
   * Get all entries.
   * @returns The promise of the list of all entries. 
   */
  all(): Promise<Array<Entry<Id, Value>>>;
  /**
   * Get an entry with an identifier. 
   * @param id the identifier.
   * @returns The promise of the value associated to the identifier.
   * @throws {NotFoundEntry<Id>} There is no entry with the identifier.
   */
  one(id: Id): Promise<Value>;
  /**
   * Create a new entry.
   * @param value The value added to the resource.
   * @returns The promise of the identifier assigned to the value.
   * @throws {InvalidRequestEntry<void>} The value is not valid.
   */
  create(value: Value): Promise<Id>;
  /**
   * Update an existing value.
   * @param id the identifier of the modified value.
   * @param value the new value associated to the value.
   * @returns The promise of successful completion.
   * @throws {InvalidRequestEntry<Id>} The value was invalid.
   * @throws {NotFoundEntry<Id>} There is no entry with the identifier.
   */
  update(id: Id, value: Value): Promise<void>;
  /**
   * Remove an existing value.
   * @param id the identifier of the removed value.
   * @returns The promise of successful completion.
   * @throws {NotFoundEntry<Id>} There is no entry with the identifier.
   */
  remove(id: Id): Promise<void>;
}


/**
 * The parser of a response.
 * @param res The parsed response.
 * @returns The promise of the result.
 */
export type ResponseParser<Value> = (res: Response) => Promise<Value>;

/**
 * The formatter of the value to the request. 
 * @param target The target request. 
 * @param value The new assigned value. 
 * @returns The promise of the new request with value added. 
 */
export type ValueRequestFormat<Value> = (target: Request, value: Value) => Promise<Request>;

/**
 * The formatter of the identifeir and value to the request. 
 * @param target The target request. 
 * @param id The added identifier.
 * @returns The promise of the new request with id added. 
 */
export type IdRequestFormat<Id> = (target: Request, id: Id) => Promise<Request>;


/**
 * The formatter of the identifeir and value to the request. 
 * @param target The target request. 
 * @param id The identifier fo the updated value.
 * @param value The new updated value. 
 * @returns The promise of the new request with id and value added. 
 */
export type IdAndValueRequestFormat<Id, Value> = (target: Request, id: Id, value: Value) => Promise<Request>;

/**
 * Handle error error entry, or throw the error.
 * @param err The error.
 * @returns {ErrorEntry<Id>} The handled error entry.
 * @throws The error in case it is not an error entry.
 */
export function handleError<Id=void>(err: unknown, id: Id): ErrorEntry<Id> {

  if (typeof err === "object" && "status" in err && typeof err.status === "number" && "message" in err && typeof err.message === "string") {
    return {
      status: err.status,
      message: err.message,
      id
    };
  } else {
    throw err;
  }
}

/**
 * Create a fetch DAO using fetch to acquire the details.
 * @param resourceUrl The base url of the resource. This url is used to get all entries.
 * @param getOne The optional information to get one entry. Defaults to filtering the entry with id from all entries.
 * @param create The optional information to add a new entry to the result. Defaults to an unsupported create method.
 * @param update The optional information to update na existing entry. Defautls to an unsupported update method.
 * @param remove The optional information to remove an existing entry. Defaults to an unsupported delete method.
 */
export function FetchDao<Value, Id = string>(
  resourceUrl: string | URL,
  getAll: { init: RequestInit; parser: ResponseParser<Array<Entry<Id, Value>>> },
  getOne?: { init: RequestInit, format: IdRequestFormat<Id>, parser: ResponseParser<Value> },
  create?: { init: RequestInit, format: ValueRequestFormat<Value>, parser: ResponseParser<Id> },
  update?: { init: RequestInit, format: IdAndValueRequestFormat<Id, Value> },
  remove?: { init: RequestInit, format: IdRequestFormat<Id> }
): DAO<Value, Id> {

  return {
    async all() {
      return fetch(resourceUrl, {
        ...getAll,
        method: "GET"
      }).then(
        getAll.parser
      );
    },
    async one(id: Id) {
      if (getOne === undefined) {
        return this.all().then(
          (entries: Array<Entry<Id, Value>>) => {
            const entry: Entry<Id, Value> | undefined = entries.find((cursor: Entry<Id, Value>) => this.equalId(cursor.id, id));
            if (entry) {
              return entry.value;
            } else {
              throw {
                status: 404,
                id,
                message: "Resource not found"
              }
            }
          }
        )
      } else {
        const request = new Request(resourceUrl, getOne.init);
        return getOne.format(request, id).then(
          requestWithBody => {
            return fetch(requestWithBody).then(
              getOne.parser
            )
          }
        )
      }
    },
    async create(value: Value): Promise<Id> {
      if (create) {
        const request = new Request(resourceUrl, create.init);
        return create.format(request, value).then(
          requestWithBody => {
            return fetch(requestWithBody).then(
              create.parser
            )
          }
        );
      } else {
        return Promise.reject({
          status: 405,
          message: "Create not supported"
        })
      }
    },
    async remove(id: Id): Promise<void> {
      if (remove) {
        const request = new Request(resourceUrl, remove.init);
        return remove.format(request, id).then(
          async requestWithBody => {
            return fetch(requestWithBody).then(
              () => {
                // The request succeeded.
                return;
              }
            );
          }
        )
      } else {
        return Promise.reject({
          id,
          status: 405,
          message: "Remove not supported"
        })
      }
    },
    update(id: Id, value: Value): Promise<void> {
      if (update) {
        const request = new Request(resourceUrl, update.init);
        return update.format(request, id, value).then(
          requestWithBody => {
            return fetch(requestWithBody).then(
              () => {
                return;
              }
            )
          }
        );
      } else {
        return Promise.reject({
          id,
          status: 405,
          message: "Update not supported"
        })
      }

    }
  };
}