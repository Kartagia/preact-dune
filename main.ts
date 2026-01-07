import { Logger } from './log';
import { html, render,h } from 'preact';
import {Skill, SkillModel} from "./ability";
import {SkillList} from "././skilllist";
import {Input as MyInput, type InputProps} from "./input";
import {parseTemplate, format} from "././format";
import {Counter, InputCounter} from "././Counter";
import {useParsedValue} from "./hooks"

function logMessage(logLevel: string, template: string, ...args: any[]) {
  const logNode = document.createElement("div");
  logNode.classList.add("log", logLevel);
  logNode.appendChild(document.createTextNode(
    format(template, ...args)
  ));
  
  document.getElementById("console")?.appendChild(logNode);
}

function Foo(props) {
  return html`<h1>Foobar ${props.title}</h1>`;
}
logMessage("info", "%s works %i", "Typescript", 1, "works!")

Logger.log('TypeScript works!')

const root = document.getElementById("root");
const battle: SkillModel = {name: "Battle", score: 6}
const val:InputProps = {
  value: "Kuu",
  defaultValue: "Kuu",
  cancelledValue: undefined,
  toString() {
    return this.value;
  }
};
const handleChange : EventTarget<MouseEvent> = (e) => {
  e.preventDefault();
  val.oldValue = val.value;
  val.value = e.currentTarget.value;
  console.log("Changed from %s to %s", val.oldValue, val.value);
}
const handleCancel = e => {
  console.log("Cancel value %s to %s", val.value, val.defaultValue);
  val.cancelledValue = val.value;
  val.value = val.defaultValue;
}
const handleConfirm = e => {
  
  console.log("Confirming value %s", val.value);
  val.defaultValue = val.value;
}

const handleDefault = () => {
  console.log("Reverting to default value");
}

const comm: SkillModel = {name: "Communication", score: 7, focus: ["Diplomacy"]}
const skills: SkillModel[] = [comm, battle]

const planeetat = ["Aurinko", "Kuu", "Maa", "Mars"];
const parsePlanet = (v: string) => {
  return planeetat.find( p => p.startsWith(v))
}


render(html`<div>
<${Counter} />
<${InputCounter} 
format="${(v: number) => v.toString()}" defaultValue="${0}" min="${0}" max="${5}"  increase="${v => v+1}"
decrease="${v => v-1}"
parse="${s => Number.parseInt(s)}"
/>
<${MyInput} id="input1" label="Planet" value="${val}" 
onConfirm="${ (v:string) => {
  console.log("Confirmed %s", v);
} }" 
onCancel="${ () => {
  console.log("Cancelled to previous value")
} }"
onDefault="${ () => {
  console.log("Reverting to Kuu")
} }" 

parse="${parsePlanet}" format="${(v:string) => v}"
onChange="${handleChange}"
onDefault="${handleDefault}"
onCancel="${handleCancel}" onConfirm"${handleConfirm}"/>
  <${Skill} skill="${battle}"/><${Skill} skill="${comm}"/><${SkillList} entries="${skills}"/></div>`,root);
