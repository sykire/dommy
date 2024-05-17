import type { Component, HooksCounter } from "./types"

export const hookNames = ["onMount", "onUnmount"] as const

export const Node_Component = new WeakMap<Node, Component>()
export const Node_HooksCounter = new WeakMap<Node, HooksCounter>()
export const Mounted = new WeakSet<Node>()
export const Component_Id = new WeakMap<Component, string>()

export function createHooksCounter(node?: Node): HooksCounter {
  const newCounter = {
    onMount: 0,
    onUnmount: 0,
  }

  if (node != null) {
    Node_HooksCounter.set(node, newCounter)
  }

  return newCounter
}

export function getHooksCounter(el: Node) {
  return Node_HooksCounter.get(el)
}

export function deleteHooksCOunter(el: Node) {
  Node_HooksCounter.delete(el)
}

export function isMounted(el: Node) {
  return Mounted.has(el)
}

export function getId(component: Component) {
  return Component_Id.get(component)
}

export function setId(component: Component, id: string) {
  return Component_Id.set(component, id)
}
