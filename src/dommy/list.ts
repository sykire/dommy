import { ensureNode } from "./createElement"
import { deleteComponent, getId, setId, setIndex, setNodeComponent } from "./internal"
import { unmount } from "./mounting"
import { setChildren } from "./setChildren"
import { Component, ListComponent, ListItemComponent, ListItemFactory, View } from "./types"
import { getNode } from "./utils"

export function List<Data extends Record<string, any> = any, Context = any>(
  parent: string | View,
  itemFactory: ListItemFactory<Data, Context>,
  key?: string | ((data: Data) => string),
  initialData?: Data
): ListComponent<Data, Context> {
  const view = ensureNode(parent)
  let components: Component[] = []
  let lookup: Record<string, Component> = {}

  // View is itemFactory
  // this.pool = new ListPool(View, key, initData);

  let keyFn =
    typeof key === "function" ? key : typeof key === "string" ? (item: Data) => item[key].toString() : undefined

  let thisComponent = {
    get view() {
      return view
    },
    update(data: Data[], context?: Context) {
      const oldComponents = components

      // start this.pool.update(data, context)
      const newLookup: Record<string, Component> = {}
      const newComponents: Component[] = []

      for (let i = 0; i < data.length; i++) {
        const itemData = data[i]

        let newComponent: ListItemComponent

        if (keyFn) {
          const id = keyFn(itemData)
          console.log(id)
          newComponent = lookup[id] ?? itemFactory()
          newLookup[id] = newComponent
          setId(newComponent, id)
        } else {
          newComponent = components[i] ?? itemFactory()
        }

        newComponent.update?.(data[i], i, data, context)

        newComponent.data = data[i]

        const node = getNode(newComponent)

        setNodeComponent(node, newComponent)

        newComponents[i] = newComponent
        console.log(newComponents.map(c => c.data))
      }
      // end

      if (keyFn) {
        for (let i = 0; i < oldComponents.length; i++) {
          const oldComponent = oldComponents[i]
          const id = getId(oldComponent)

          if (!id || newLookup[id] == null) {
            deleteComponent(oldComponent)
            unmount(thisComponent, oldComponent)
          }
        }
      }

      for (let i = 0; i < newComponents.length; i++) {
        setIndex(newComponents[i], i)
      }

      setChildren(thisComponent, ...newComponents)

      lookup = newLookup
      components = newComponents
    },
  } satisfies ListComponent<Data, Context>

  return thisComponent
}
