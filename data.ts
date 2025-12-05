import {SkillModel} from "./skill.model";

export class NotFoundError<ID=string> extends Error {
  constructor(resource: string, id: ID) {
    super(`The ${resource} with id ${JSON.stringify(id)} not found`);
    this.name = this.constructor.name;
  }
}

export interface Entry<Id,Value> {
  readonly key: Readonly<Id>;
  readonly value: Readonly<Value>;
}
interface Source<T,Id=string> {
  all(): Promise<Entry<Id,T>[]>;
  one(id:Id):Promise<T>;
  /**
   * @param id updated id
   * @param value The new value.
   * @throws {NotFoundError} The resource does not exist.
   * @throws {SyntaxError} The new value is invalid.
   */
  update(id: Id, value: T): Promise<void>;
}



class RestSource<T,Id=string> implements Source<T,Id> {
  baseUrl: string;
  resourceName: string;
  
  constructor(resourceName: string, options?: {baseUrl?:string}) {
    this.resourceName = resourceName;
    this.baseUrl = options?.baseUrl ?? "/";
  }
  
  error(res: Response, resource: string) {
    return new Error(`The ${resource} not available.`)
  }
  notFound(id: Id) {
    return new NotFoundError(this.resourceName, id);
  }
  unsupported(operation: string) {
    return new Error(`The ${this.resourceName} does not support ${operation}.`)
  }
  async all() {
    const headers = Headers()
    headers.append("Accept", "*/json");
    headers.append("Api-Key", process.env.API_KEY);
    const init = {
      method: "GET",
      mode: "cors",
      headers,
      
    }
    const request = new Request(this.baseUrl);
    request.headers().set("Accept", "application/json")
    return fetch(request
    ).then(
      response => {
        if (!response?.ok) {
          throw this.error(res, "all items");
        }
        return response.json();
      }
    ).then(
       content => {
        if (Array.isArray(content)) {
          return content;
        } else {
          return [];
        }
       }
    )
  };
  async one(id:Id): Promise<T> {
    return all().then(
      (items) => {
        const result = items.filter(e => e.key == id);
        if (result === undefined) {
          throw this.notFound(id);
        } else {
          return e.value;
        }
      }
    )
  }
  async update(id:Id, value: T): Promise<never> {
    throw this.usupported("update")
  }
}

const sources: {
  skills?: Source<SkillModel>
} = {
}

export async function getSkills():Promise<SkillModel[]> {
  // body...
  if (sources.skills) {
    return sources.skills.all().then(
      entries => entries.map(e=>e?.value)
    )
  } else {
    return Promise.resolve([]);
  }
}