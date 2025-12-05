import {html, useState} from 'preact';

export {SkillModel} from "./skill.model";

export interface SkillProps {
  class?:string,
  skill:SkillModel
}

export function Skill(props:SkillProps) {
  
  
  return html`<div class="${props.class}"><span class="name">${props.skill.name}</span><span>${props.skill.score}</span>${html`<span class="focuses">${props.skill.focus?.map( focus => (html`<span class="focus">${focus}</span>`))}</span>`}</div>`;
}