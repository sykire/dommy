import { Properties, createElement } from "./createElement"
import { mount } from "./mounting"
import { Component, ComponentFactory, View } from "./types"
import { isComponent, isNode } from "./utils"

export function text(str: string) {
  return document.createTextNode(str ?? "")
}

type Child = string | number | Component | Node

function isChild(probablyChild: any): probablyChild is Child {
  switch (typeof probablyChild) {
    case "string":
    case "number":
      return true
    default:
      if (isNode(probablyChild) || isComponent(probablyChild)) {
        return true
      }
      return false
  }
}

export function h(query: ComponentFactory, parameters?: Parameters<ComponentFactory>, ...children: Child[]): View
export function h(query: ComponentFactory, ...children: Child[]): View
export function h(query: string, properties: object, ...children: Child[]): View
export function h(query: string, ...children: Child[]): View
export function h(
  query: string | ComponentFactory,
  properties?: Properties | Parameters<ComponentFactory> | Child,
  ...children: Child[]
): View {
  let view

  let _children = [...children]

  if (children.length != null && typeof children !== "string" && isChild(properties)) {
    _children.unshift(properties)
    properties = {}
  }

  switch (typeof query) {
    case "string":
      view = createElement(query, properties as Properties)
      break
    case "function":
      view = query(properties, _children)
      break
    default:
      throw new Error("Invalid argument")
  }

  for (const child of _children) {
    switch (typeof child) {
      case "string":
        view.appendChild(text(child))
        break
      case "number":
        view.appendChild(text(child.toString()))
        break
      default:
        if (isNode(child) || isComponent(child)) {
          mount(view, child)
        }
    }
  }

  return view
}
