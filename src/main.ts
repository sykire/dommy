import { h } from "./dommy/h"
import { mount } from "./dommy/mounting"

const root = document.querySelector<HTMLDivElement>("#app")

if (root) {
  mount(root, h("div", "A", "B", h("div", { style: { fontWeight: "bold" } }, "text")))
}
