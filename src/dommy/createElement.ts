import { h } from "./h"
import { parseQuery } from "./parsing"
import { View } from "./types"
import { getNode, isHTMLElement, isSVGElement } from "./utils"

export interface Properties {
  middleware?: (el: Element) => void
  middlewares?: ((el: Element) => void)[]
  style?: Partial<CSSStyleDeclaration>
  dataset?: Record<string, string>
  class?: string
  [key: string]: any
}

export function createElement(query: string, properties?: Properties, ns?: string) {
  const { tag, id, className } = parseQuery(query)
  const element = ns ? document.createElementNS(ns, tag) : document.createElement(tag)

  if (id !== "") {
    element.id = id
  }

  if (className !== "") {
    if (ns) {
      element.setAttribute("class", className)
    } else {
      element.className = className
    }
  }

  if (properties) {
    console.log(properties)
    for (const property in properties) {
      switch (property) {
        case "middleware":
          const middleware = properties[property]
          middleware?.(element)
          break
        case "middlewares":
          const middlewares = properties[property]

          if (middlewares) {
            for (const middleware of middlewares) {
              middleware(element)
            }
          }
          break
        case "dataset":
          const dataset = properties[property]

          if (dataset && isHTMLElement(element)) {
            for (const key in dataset) {
              element.dataset[key] = dataset[key]
            }
          }
          break
        case "style":
          const style = properties[property]
          console.log("asd")

          if (style && (isHTMLElement(element) || isSVGElement(element))) {
            for (const key in style) {
              const value = style[key]

              if (value) {
                element.style[key] = value
              }
            }
          }
          break
        default:
          // @ts-expect-error
          element[property] = properties[property]
      }
    }
  }

  return element
}

export function ensureNode(parent: string | View): Node {
  return typeof parent === "string" ? h(parent) : getNode(parent)
}
