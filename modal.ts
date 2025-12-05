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
  const classes = ["modal", "flex-column"];
  if (!props.show) {
    classes.push("hidden");
  }
  const preventDefault: TargetedEvent<MouseEvent> = (event) => {event.preventDefault();}
  const cancelDialog: TargetedEvent<MouseEvent> = (event) => {
    event.preventDefault();
    props.onCancel(props.value);
  }
  const confirmDialog: TargetedEvent<MouseEvent> = (event) => {
    props.onConfirm(props.value);
    event.preventDefault();
  }
  const title = orElse(props.title, "Modal dialog");
  const header = html`<div class="header" onClick="${preventDefault}">${title}</div>`;
  const footer = html`<div class="footer"><button class="confirm" onClick="${confirmDialog}">Confirm</button><button class="cancel" onClick="${cancelDialog}">Cancel</button></div>`
  const main = html`<div class="main">${props.children}</div>`
  return html`<div class="${classes.join(" ")}">
  <div class="modal-content">
  ${header}
  ${main}
  ${footer}
  </div>
  </div>`;
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