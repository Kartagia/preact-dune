import {html} from 'preact';
import {ComponentChildren, FunctionComponent, useState } from 'preact/compat';
import {orElse} from "./utils"

export interface ModalPojo<Value> {
  show: boolean;
  value: Value;
  children: ComponentChildren;
}

export interface ModalEvents<Value> {
  onConfirm : (value: Value) => void;
  onCancel : (value: Value) => void;
  onReset?: (value: Value) => void;
}

export type ModalProps<Value> = ModalPojo<Value> & ModalEvents<Value>;

export function Modal<Value>(props: ModalProps<Value>) {
  const classes = ["modal"];
  if (!props.show) {
    classes.push("hidden");
  }
  const cancelDialog: TargetedEvent<MouseEvent> = (event) => {
    props.onCancel(props.value);
  }
  const confirmDialog: TargetedEvent<MouseEvent> = (event) => {
    props.onConfirm(props.value);
  }
  const title = orElse(props.title, "Modal dialog");
  const header = html`<div class="header">${title}</div>`;
  const footer = html`<div class="footer"><button class="confirm" onClick="${confirmDialog}">Confirm</button><button class="cancel" onClick="${cancelDialog}">Cancel</button></div>`
  return html`<div onClick="${cancelDialog}" class="${classes.join(" ")}">
  <div class="modal-content" onclick="${(e: MouseEvent) => {e.preventDefault();}}">
  ${header}
  <div class="main">${props.children}</div>${footer}</div></div>`;
}

export function UncontrolledModal < Value > (props: ModalProps < Value > ) {
  const [value, setValue] = useState<Value>(props.value);
  const [show, setShow] = useState(props.show ?? false);
  const resetValue : (value:Value) => void = (val) => {
    props.onReset?.(val);
    setValue(value);
  };
  const cancelValue: (value: Value) => void = (val) => {
    props.onCancel?.(val);
  setValue(value);
  setShow(false);
};
const confirmValue: (value: Value) => void = (val) => {
  props.onConfirm?.(val);
  setValue(value);
  setShow(false);
};
  
  return html`<${Modal} value="${value}" show="${show}" onReset="${resetValue}" onConfirm="${confirmValue}" onCancel="${cancelValue}"></${Modal}>`;
}

export function ModalForm<Value>(props: ModalProps<Value>) {
  
  return html`<form></form>`;
}