import { Logger } from './log';
import { html, render } from 'preact';
import {Skill, SkillModel} from "./ability";
import {SkillList} from "././skilllist";

function Foo(props) {
  return html`<h1>Foobar ${props.title}</h1>`;
}

Logger.log('TypeScript works!')

const root = document.getElementById("root");
const battle: SkillModel = {name: "Battle", score: 6}

const comm: SkillModel = {name: "Communication", score: 7, focus: ["Diplomacy"]}
const skills: SkillModel[] = [comm, battle]

render(html`<${Foo} title="Barbar"/><${Skill} skill="${battle}"/><${Skill} skill="${comm}"/><${SkillList} entries="${skills}"/>`,root);
