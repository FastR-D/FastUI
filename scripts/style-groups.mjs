import postcss from 'postcss'

// Group by the owning class, keeping each family's original cascade and media rules.
export function styleFamily(className) {
  const name = className.replace(/^fastui-/, '').split('--')[0]
  if ((name === 'tab' || name === 'tabs' || name.startsWith('tab-'))) return 'tabs'
  if (/^segments?$/.test(name)) return 'segments'
  if (/^inspector-/.test(name)) return 'inspector'
  if (/^asset-/.test(name)) return 'asset'
  if (/^tone-/.test(name)) return 'tone'
  if (name === 'modal-body') return 'dialog'
  return name
}
export function splitStyles(css) {
  const source = postcss.parse(css)
  const families = new Set()
  source.walkRules(rule => {
    for (const selector of rule.selectors) {
      const owner = selector.match(/\.fastui-[\w-]+/)
      if (owner) families.add(styleFamily(owner[0].slice(1)))
    }
  })
  families.add('spinner')
  const output = {}
  for (const family of ['shared', ...families]) {
    const root = source.clone()
    root.walkComments(comment => comment.remove())
    root.walkAtRules(at => {
      if (/keyframes$/.test(at.name)) { if (family !== 'spinner') at.remove() }
    })
    root.walkRules(rule => {
      if (rule.parent.type === 'atrule' && /keyframes$/.test(rule.parent.name)) return
      const selectors = rule.selectors.filter(selector => {
        const owner = selector.match(/\.fastui-[\w-]+/)
        return owner ? styleFamily(owner[0].slice(1)) === family : family === 'shared'
      })
      if (!selectors.length) rule.remove()
      else rule.selectors = selectors
    })
    // Walk outwards so a media block emptied by pruning cannot survive.
    const clean = node => { for (const child of [...(node.nodes ?? [])]) { clean(child); if (child.type === 'atrule' && child.nodes?.length === 0) child.remove() } }
    clean(root)
    output[family] = root.toString().trim()
  }
  return output
}
