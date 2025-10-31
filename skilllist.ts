import {html, useState} from 'preact';
import {SkillModel, Skill} from "./ability";
import {UnsupportedError} from "./exception"
import {IconButton} from './icons';
import {Modal} from './modal';

interface ListProps<MODEL> {
 /**
  * The entries of the list.
  */
 entries: Readonly<Readonly<MODEL>[]>
 
 /**
  * Add member to the list listener.
  */
  onAdd?: (value: MODEL) => void;
  
   /**
  * Remove member from the list listener.
  */
 onRemove?: (value: MODEL) => void;
 
  /**
  * Update member of the list listener.
  */
 onChange?: (oldValue: MODEL, newValue: MODEL) => void;
}

/**
 * @module component/skilllist
 */
 
 export function SkillList(props: ListProps<SkillModel>) {
  const [edit, setEdit] = useState<SkillModel|undefined>();
  const [confirmEdit, setConfirmEdit] = useState(()=>{setEdit(undefined)});
  const [cancelEdit, setCancelEdit] = useState(()=>{setEdit(undefined)});
  const openEditor = (defaultValue: SkillModel): Promise<SkillModel> => {
   return new Promise<SkillModel>((resolve, reject) => {
    setConfirmEdit(resolve);
    setCancelEdit(reject);
    setEdit(defaultValue);
    console.debug(`Editor opened for ${defaultValue.name}`);
   }
   )
  }
  const closeEdit: EventListener<MouseEvent> = (event) => {
   setEdit(undefined);
  }
  
  const actions = [
   {
    icon: "add",
    prop: "onAdd",
    action: props.onAdd
   },
   {
    icon: "delete",
    prop: "onRemove",
    action: props.onRemove
   },
   {
    icon: "edit",
    prop: "onChange",
    action: props.onChange ? undefined : ((oldValue:SkillModel, e: MouseEvent) => {
     e.preventDefault(true);
     openEditor(oldValue).then(
      newValue => {
       props.onChange(oldValue, newValue);
      }, 
      error => {
        closeEditor();
      }
     )
     return;
    })
   }
  ];
  
  return html`<div>${
   props.entries.map( skill => {
    
    return html`<div class="entry"><${Skill} skill="${skill}" /><div class="actions">${
     actions.reduce( (res, action)=> {
      if (action.action) {
       res.push(html`<${IconButton} onClick="${action.action.bind(undefined, skill)}"><i>${action.icon}</i></${IconButton}>`);
      }
      return res;
     }, [])
    }</div></div>`;
   })
   
  }<${Modal} show="${edit !== undefined}" onConfirm="" onCancel="${closeEdit}" title="Modal Dialog">
  <form class="modal-content">
    <div class="form-field">
    <label>Name</label><input name="name" value="${edit?.name}"></input></div>
    <div class="form-field">
    <label>Score</label><input name="score" value="${edit?.value}"></input></div>
  </form>
  
  </${Modal}>
  </div>`;
 }
