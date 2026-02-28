import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import { defaultRemarkPlugins } from 'streamdown'
import type { PluggableList } from 'unified'

/**
 * Custom remark plugins that enable single-dollar inline math ($...$)
 * in addition to the default double-dollar block math ($$...$$).
 */
export const remarkPlugins: PluggableList = Object.entries(defaultRemarkPlugins).map(
  ([key, plugin]) => {
    if (key === 'math') {
      return [remarkMath, { singleDollarTextMath: true }]
    }
    return plugin
  },
)

/**
 * Rehype plugins for rendering trusted course content.
 * Uses rehype-raw (for HTML in markdown) and rehype-katex (for LaTeX math)
 * without rehype-sanitize/harden since this is our own content.
 */
export const rehypePlugins: PluggableList = [
  rehypeRaw,
  [rehypeKatex, { errorColor: 'var(--color-muted-foreground)' }],
]
