import {
  Mounted,
  Node_Component,
  Node_HooksCounter,
  createHooksCounter,
  deleteHooksCOunter,
  getHooksCounter,
  hookNames,
  isMounted,
} from "./internal"
import { Component, Hook, View } from "./types"
import { getNode, isComponent, isElement } from "./utils"

// This is the function that does the heavy job, the starting point
export function mount(parent: View, child: View) {
  const parentEl = getNode(parent)
  let childEl!: Node
  let childComp!: Component

  if (isElement(child)) {
    const component = Node_Component.get(child)
    childEl = child
    if (component != null) {
      childComp = component
    }
  } else if (isComponent(child)) {
    childEl = getNode(child)
    childComp = child
    Node_Component.set(childEl, child)
  }

  const wasMounted = Mounted.has(childEl)
  const oldParent = childEl.parentNode ?? undefined

  if (wasMounted && oldParent !== parentEl) {
    doUnmount(childEl, oldParent)
  }

  parentEl.appendChild(childEl)

  // doMount(child, childEl, parentEl, oldParent)
  // This is the code of doMount
  const remount = parentEl === oldParent

  let hooksCounter = getHooksCounter(childEl) ?? createHooksCounter(childEl)
  let hooksFound = false

  for (const hookName of hookNames) {
    if (!remount) {
      // If already mounted, it was previously calculated on first mount
      if (isComponent(child)) {
        const hook = child[hookName]

        if (hook !== null) {
          hooksCounter[hookName] += 1
        }
      }
    }

    if (hooksCounter[hookName] > 0) {
      hooksFound = true
      break
    }
  }

  if (!hooksFound) {
    Node_HooksCounter.set(childEl, createHooksCounter())
    return
  }

  let traverse = parentEl
  let triggered = false

  if (remount || isMounted(parentEl)) {
    trigger(childEl, Hook.mount, { isRemount: remount })
    triggered = true
  }

  while (traverse) {
    // starting from the mount point(parentEl)
    const parent = traverse.parentNode

    if (parent == null) {
      break
    }

    const parentHooks = getHooksCounter(parentEl) ?? createHooksCounter(parentEl)

    for (const hookName of hookNames) {
      parentHooks[hookName] += hooksCounter[hookName] // Incrementing up the tree the count of hooks
    }

    if (triggered) {
      break
    } else {
      if (traverse.nodeType === Node.DOCUMENT_NODE || traverse instanceof ShadowRoot || isMounted(parent)) {
        trigger(traverse, Hook.mount, { isRemount: remount })
      }
    }

    traverse = parent
  }

  return childComp
}

export function trigger(el: Node, eventName: Hook, details: any) {
  switch (eventName) {
    case Hook.mount:
      Mounted.add(el)
      break
    case Hook.unmount:
      Mounted.delete(el)
  }

  const hooksCounter = getHooksCounter(el)

  if (hooksCounter == null) {
    return
  }

  const component = Node_Component.get(el)
  let hooksFound = false

  component?.[eventName]?.(details)

  for (const hookName of hookNames) {
    if (hooksCounter[hookName] > 0) {
      hooksFound = true
      break
    }
  }

  if (hooksFound) {
    let traverse: ChildNode | null = el.firstChild

    if (traverse == null) {
      return
    }

    while (traverse) {
      // Starting from the first child of el
      const next: ChildNode | null = traverse.nextSibling // And continuing through the siblings

      trigger(traverse, eventName, {})

      if (next == null) {
        return
      }

      traverse = next
    }
  }
}

function doUnmount(childNode: Node, parentNode?: Node) {
  const hooksCounter = getHooksCounter(childNode)

  if (hooksCounter == null) {
    createHooksCounter(childNode)
    return
  }

  let hooksFound = false

  for (const hookName of hookNames) {
    if (hooksCounter[hookName] > 0) {
      hooksFound = true
      break
    }
  }

  if (!hooksFound) {
    return
  }

  let traverse = parentNode

  if (isMounted(childNode)) {
    trigger(childNode, Hook.unmount, {})
  }

  while (traverse) {
    const parentHooks = getHooksCounter(traverse) || createHooksCounter()

    for (const hookName of hookNames) {
      if (parentHooks[hookName] > 0) {
        parentHooks[hookName] -= hooksCounter[hookName]
      }
    }

    let hooksFound = false

    for (const hookName of hookNames) {
      if (parentHooks[hookName] > 0) {
        hooksFound = true
        break
      }
    }

    if (!hooksFound) {
      deleteHooksCOunter(traverse)
    }

    traverse = traverse.parentNode ?? undefined
  }
}

export function unmount(parent: View, child: View): View {
  const parentNode = getNode(parent)
  const childNode = getNode(child)

  if (child === childNode) {
    const component = Node_Component.get(child)
    if (component != null) {
      child = component
    }
  }

  if (childNode.parentNode) {
    doUnmount(childNode, parentNode)

    parentNode.removeChild(childNode)
  }

  return child
}
