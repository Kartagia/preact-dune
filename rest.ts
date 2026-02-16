import { Logger } from './log';
import { html, render, h, useState, useEffect} from 'preact';
import {Skill, SkillModel} from "./ability";
import {SkillList} from "./skilllist";
import {Input as MyInput, type InputProps} from "./input";
import {parseTemplate, format} from "./format";
import {methods} from './rest.model';
import {RestMethodChooser} from './rest.component';
import RestApp from './rest.test'
console.group("Rendering SettingsApp");
import {SettingsApp} from "././settings.test"
try {
  const root = document.getElementById("root");

  render(html`<${SettingsApp}/>`,root);
} finally {
  console.log("Rendered");
}