import { ensureNode } from "./createElement"
import { setId } from "./internal"
import { Component, ListComponent, ListItemComponent, ListItemFactory, View } from "./types"

export function List<Data = any, Context = any>(
  parent: View,
  itemFactory: ListItemFactory<Data, Context>,
  key: string | ((data: Data) => string),
  initialData: Data
): ListComponent<Data, Context> {
  const view = ensureNode(parent)
  let components: Component[] = []
  let lookup: Record<string, Component> = {}

  // View is itemFactory
  // this.pool = new ListPool(View, key, initData);

  let keyFn =
    typeof key === "function"
      ? key
      : typeof key === "string"
      ? (item: Data) => Object.prototype.toString.call(item[key])
      : undefined

  return {
    get view() {
      return view
    },
    update(data: Data[], context: Context) {

      // start this.pool.update(data, context)
      const newLookup : Record<string, Component> = {}
      const newComponents : Component[] = []

      for(let i = 0, i < data.length; i++) {
        const itemData = data[i]
        
        let newComponent : ListItemComponent

        if(keyFn) {
          const id = keyFn(itemData)

          newComponent = lookup[id] ?? itemFactory()
          newLookup[id] = newComponent
          setId(newComponent, id)
        } else {
          newComponent = components[i] ?? itemFactory()
        }

        newComponent.
      }
      
      // end


    },
  }
}
