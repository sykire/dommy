export function parseQuery(query: string) {
  let tag = "div"
  let mode = "tagName"

  let id = ""
  let i = 0
  let from = 0
  let classes: Set<string> = new Set()

  function endTag(to: number, newMode?: string) {
    if (to > 0) {
      tag = query.substring(0, to)
    }

    if (newMode) {
      mode = newMode
    }
  }

  function endId(from: number, to: number, newMode?: string) {
    if (to - from > 0) {
      id = query.substring(from, to)
    } else {
      throw new Error("id is empty, probably your query looks like this `tag#.some-class` or `tag#`")
    }

    if (newMode) {
      mode = newMode
    }
  }

  function endClass(from: number, to: number) {
    if (to - from > 0) {
      classes.add(query.substring(from, to))
    } else {
      throw new Error("class is empty, probably your query looks like this `tag.class-1..class-2` or `tag.class-1.`")
    }
  }

  parse: while (i < query.length + 1) {
    let l = query[i] ?? null

    switch (mode) {
      case "tagName":
        switch (l) {
          case ".":
            endTag(i, "class")
            i++
            from = i
            continue parse
          case "#":
            endTag(i, "id")
            i++
            from = i
            continue parse
          case null:
            endTag(i)
            break parse
          default:
            i++
            continue parse
        }
      case "id":
        switch (l) {
          case ".":
            endId(from, i, "class")
            i++
            from = i
            continue parse
          case "#":
            throw new Error("can't have more than one id")
          case null:
            endId(from, i)
            break parse
          default:
            i++
            continue parse
        }
      case "class":
        switch (l) {
          case "#":
            throw new Error(
              "id declaration should come before class declaration e.g: div.cls#id is wrong div#id.cls is ok"
            )
          case ".":
            endClass(from, i)
            i++
            from = i
            continue parse
          case null:
            endClass(from, i)
            break parse
          default:
            i++
            continue parse
        }
    }
  }

  return {
    id,
    tag,
    className: [...classes].join(" "),
  }
}
