import {
  createHooksCounter,
  deleteHooksCOunter,
  getHooksCounter,
  getNodeComponent,
  hookNames,
  isMounted,
  setMounted,
  setNodeComponent,
} from "./internal"
import { Hook, View } from "./types"
import { getNode, isComponent } from "./utils"

// This is the function that does the heavy job, the starting point
export function mount(parent: View, child: View, before?: View, replace = false): View {
  const parentNode = getNode(parent)
  let childNode: Node = getNode(child)

  if (child === childNode) {
    const component = getNodeComponent(child)

    if (component != null) {
      child = component
    }
  }

  if (child !== childNode && isComponent(child)) {
    setNodeComponent(childNode, child)
  }

  const wasMounted = isMounted(childNode)
  const oldParent = childNode.parentNode ?? undefined

  if (wasMounted && oldParent !== parentNode) {
    doUnmount(childNode, oldParent)
  }

  if (before != null) {
    const beforeNode = getNode(before)
    if (replace) {
      if (isMounted(beforeNode)) {
        trigger(beforeNode, Hook.unmount, {})
      }

      parentNode.replaceChild(childNode, beforeNode)
    } else {
      parentNode.insertBefore(childNode, beforeNode)
    }
  } else {
    parentNode.appendChild(childNode)
  }

  // doMount(child, childEl, parentEl, oldParent)
  // This is the code of doMount
  const remount = parentNode === oldParent

  let hooksCounter = getHooksCounter(childNode) ?? createHooksCounter(childNode)
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
    createHooksCounter(childNode)
  } else {
    let traverse = parentNode
    let triggered = false

    if (remount || isMounted(parentNode)) {
      trigger(childNode, Hook.mount, { isRemount: remount })
      triggered = true
    }

    while (traverse) {
      // starting from the mount point(parentEl)
      const parent = traverse.parentNode

      if (parent == null) {
        break
      }

      const parentHooks = getHooksCounter(parentNode) ?? createHooksCounter(parentNode)

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
  }

  return child
}

export function trigger(node: Node, eventName: Hook, details: any) {
  switch (eventName) {
    case Hook.mount:
      setMounted(node, true)
      break
    case Hook.unmount:
      setMounted(node, false)
  }

  const hooksCounter = getHooksCounter(node)

  if (hooksCounter == null) {
    return
  }

  const component = getNodeComponent(node)
  let hooksFound = false

  component?.[eventName]?.(details)

  for (const hookName of hookNames) {
    if (hooksCounter[hookName] > 0) {
      hooksFound = true
      break
    }
  }

  if (hooksFound) {
    let traverse: ChildNode | null = node.firstChild

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
    const component = getNodeComponent(child)
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
