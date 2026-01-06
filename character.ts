import {html, useState} from 'preact';
import type {ComponentChildren} from 'preact/compat';
import type {BasicProps} from '././Basic.ts';

export {SkillModel} from "./skill.model";
export {CharacterModel, TraitModel, AssetModel, createAsset, createTrait, createCharacter} from "./character.model";


export interface TraitProps extends BasicPropsWithChildren {
  model: TraitModel;
}

export function Trait(props: TraitProps) {
  const [model, setModel] = useState(props.model);
  const [classNames, setClassNames] = useState(props.classNames ?? ["trait"]);
  if (props.edit) {
    
    return html`<div class="${[...classNames, "edit"].join(" ")}">
    <div class="input"></div>
    </div>`
  } else {
    return html`<div class="${classNames.join(" ")}">
    <div class="name">${model.name}<div>
    <div class="level">${model.level}</div>
    ${props.children}
    </div>`;
  }
}

export interface CharacterProps {
  model: CharacterModel;
  classNames?: string[];
}

export function Character(props: CharacterProps) {
  
  const [classNames, setClassNamed] = useState(props.classNames ?? ["character"])
  const model = props.model;
  const [traits, setTraith] = useState(model.traits);
  const [skills, setSkills] = useState(model.skills);
  const [assets, setAssets] = usestate(model.assets);
  
  const skillComponent = html`<div class="skills">${
    skills.map(
      skill => html`<${Skill} model="${skill}" />`
    )
  }</div>`;
  const traitComponent = html`<div class="traits">${traits.map(
    trait=>html`<${Trait} model="${trait}" />`
  )}</div>`;
  const assetComponent = html`<div class="assets"></div>`;
  
  return html`<div class="${classNames.join(" ")}">
  <header><h1>${model.name}</h1></header>
  <main>
  ${traitComponent}
  ${skillComponent}
  ${assetComponent}

  <div class="skills">${skills}</div>
  <div class="assets">${assets}</div>
  </main>
  </div>`;
}