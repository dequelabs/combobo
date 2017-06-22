const overflowRegexp = /(auto|scroll)/

function parents (node, result = []) {
  const parent = node.parentNode

  if (parent === null || parent.nodeName === 'HTML') return result
  return parents(parent, result.concat(parent))
}

function style (node, prop) {
  return window.getComputedStyle(node, null).getPropertyValue(prop)
}

function getOverflowProp (node) {
  return style(node, 'overflow') + style(node, 'overflow-y')
}

function isScrollable (node) {
  if (node.nodeType !== 1) return
  return overflowRegexp.test(getOverflowProp(node)) &&
    node.scrollHeight > node.clientHeight
}

function scrollableParent (node) {
  const parentNodes = parents(node)
  let scrollableNode = document.body

  for (let i = 0, len = parentNodes.length; i < len; i++) {
    if (isScrollable(parentNodes[i])) {
      scrollableNode = parentNodes[i]
      break
    }
  }

  return scrollableNode
}

export default scrollableParent
