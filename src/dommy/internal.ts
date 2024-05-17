import type { Component, HooksCounter } from "./types"

export const hookNames = ["onMount", "onUnmount"] as const

const Node_Component = new WeakMap<Node, Component>()
const Node_HooksCounter = new WeakMap<Node, HooksCounter>()
const Mounted = new WeakSet<Node>()
const Component_Id = new WeakMap<Component, string>()
const Component_Index = new WeakMap<Component, number>()

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

export function getHooksCounter(node: Node) {
  return Node_HooksCounter.get(node)
}

export function deleteHooksCOunter(node: Node) {
  Node_HooksCounter.delete(node)
}

export function isMounted(node: Node) {
  return Mounted.has(node)
}

export function setMounted(node: Node, status: boolean) {
  status ? Mounted.add(node) : Mounted.delete(node)
}

export function getId(component: Component) {
  return Component_Id.get(component)
}

export function setId(component: Component, id: string) {
  return Component_Id.set(component, id)
}

export function getIndex(component: Component) {
  return Component_Index.get(component)
}

export function setIndex(component: Component, index: number) {
  return Component_Index.set(component, index)
}

export function getNodeComponent(node: Node): Component | undefined {
  return Node_Component.get(node)
}

export function setNodeComponent(node: Node, component: Component) {
  Node_Component.set(node, component)
}

export function deleteComponent(component: Component): boolean {
  return Component_Id.delete(component) && Component_Index.delete(component)
}
