
/**
 * Character data retrieval
 * @module
 */
 
 export interface DAO<Value, Id=string> {
   
   all():Promise<Array<Entry<Id,  Value>>>;
   one(id: Id): Promise<Value>;
   create(value: Value): Promise<Id>;
   update(id: Id, value: Value): Promise<void>;
   remove(id: Id): Promise<void>;
 }
 
 /**
  * Create a fetch DAO
  */
 export function FetchDao() {
   
 }