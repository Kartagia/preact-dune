import {html, useState} from 'preact';
import {SkillModel, Skill} from "./ability";
import {UnsupportedError} from "./exception"

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
  
  const actions = [
   {
    icon: "plus",
    prop: "onAdd",
    action: props.onAdd
   },
   {
    icon: "thrash",
    prop: "onRemove",
    action: props.onRemove
   },
   {
    icon: "pen",
    prop: "onChange",
    action: props.onChange ? undefined : ((oldValue:SkillModel) => {
     console.error("Edit skill not supported")
    })
   }
  ];
  
  return html`<div>${
   props.entries.map( skill => {
    
    return html`<div class="entry"><${Skill} skill="${skill}" /><div class="actions">${
     actions.reduce( (res, action)=> {
      if (action.action) {
       res.push(html`<i onClick="${action.action.bind(undefined, skill)}">${action.icon}</i>`);
      }
      return res;
     }, [])
    }</div></div>`;
   })
   
  }</div>`;
 }
