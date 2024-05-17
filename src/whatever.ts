


function Sidebar() {
  return {
    render() {
      return h(
        "aside.sidebar",
        {
          style: {
            width: "320px",
            display: "flex",
            "flex-flow": "column",
          },
        },
        [h("span", "Hello world")]
      )
    },
    onmount() {},
    onunmount() {},
  }
}
