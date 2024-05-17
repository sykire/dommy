import { getIndex } from "./internal"
import { mount, unmount } from "./mounting"
import { View } from "./types"
import { getNode, isComponent } from "./utils"

export function setChildren(parent: View, ...children: View[]) {
  const parentNode = getNode(parent)

  let current = parentNode.firstChild

  const childEls = Array(children.length)

  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if (child != null) {
      childEls[i] = getNode(child)
      console.log(childEls[i].textContent)
    }
  }
  
  for (let i = 0; i < children.length; i++) {
    const child = children[i]

    if (child == null) {
      continue
    }

    const childEl = childEls[i]

    if (childEl === current) {
      current = current?.nextSibling ?? null
      continue
    }

    const next = current?.nextSibling ?? null
    const replace = isComponent(child) && getIndex(child) != null && next === childEls[i + 1]

    mount(parent, child, current ?? undefined, replace)

    if (replace) {
      current = next
    }
  }

  while (current) {
    const next = current.nextSibling

    unmount(parent, current)

    current = next
  }
}
