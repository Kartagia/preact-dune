import {html, useState} from 'preact';

export interface SkillModel {
  score: number,
  name: string,
  focus?: string[]
}

export interface SkillProps {
  class?:string,
  skill:SkillModel
}

export function Skill(props:SkillProps) {
  
  
  return html`<div class="${props.class}"><span class="name">${props.skill.name}</span><span>${props.skill.score}</span>${props.skill.focus && html`<span class="focuses">${(props.skill.focus ?? []).map( focus => (html`<span class="focus">${focus}</span>`))}</span>`}</div>`;
}