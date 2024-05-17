export type ComponentFactory<T = any, U = any> = (properties: T, children: U[]) => Component

export type View = Node | Component

export enum Hook {
  mount = "onMount",
  unmount = "onUnmount",
}

export type HooksCounter = {
  [hook in Hook]: number
}

export interface Component {
  view: View
  update?: (...args: any[]) => void
  [Hook.mount]?: (details: { isRemount: boolean }) => void
  [Hook.unmount]?: () => void
}

export interface ListComponent<Data = any, Context = any> extends Component {
  update?: (data: Data[], context?: Context) => void
}

export interface ListItemComponent<Data = any, Context = any> extends Component {
  update?: (singleData: Data, index: number, items: Data[], context: Context) => void
}

export type ListFactory<Data = any, Context = any> = (...args: any[]) => ListComponent<Data, Context>

export type ListItemFactory<Data = any, Context = any> = (...args: any[]) => ListItemComponent<Data, Context>
