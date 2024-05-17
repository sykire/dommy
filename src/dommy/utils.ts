import type { Component, View } from "./types"

export function isComponent(arg: any): arg is Component {
  return arg.view
}

export function isElement(arg: any): arg is Element {
  return isNode(arg) && arg.nodeType === Node.ELEMENT_NODE
}

export function isHTMLElement(arg: any): arg is HTMLElement {
  return arg instanceof HTMLElement
}

export function isSVGElement(arg: any): arg is SVGElement {
  return arg instanceof SVGElement
}

export function isNode(arg: any): arg is Node {
  return typeof arg.nodeType === "number"
}

export function getNode(view: View): Node {
  if (isNode(view)) {
    return view
  }

  if (isComponent(view)) {
    return getNode(view.view)
  }

  throw new Error("Invariant unsatisfied")
}

export function createDisposer() {
  let disposers: (() => void)[] = []

  return {
    defer(disposer: () => void) {
      disposers.push(disposer)
    },
    dispose() {
      for (const dispose of disposers) {
        dispose()
      }

      disposers = []
    },
  }
}
