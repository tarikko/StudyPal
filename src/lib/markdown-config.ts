import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import { defaultRemarkPlugins } from 'streamdown'
import type { PluggableList } from 'unified'

/**
 * Custom remark plugins that enable single-dollar inline math ($...$)
 * in addition to the default double-dollar block math ($$...$$).
 *
 * `defaultRemarkPlugins` from streamdown is a Record<string, Pluggable>,
 * so we iterate its entries and override the 'math' key.
 */
export const remarkPlugins: PluggableList = Object.entries(
  defaultRemarkPlugins as Record<string, unknown>,
).map(([key, plugin]) => {
  if (key === 'math') {
    return [remarkMath, { singleDollarTextMath: true }]
  }
  return plugin
}) as PluggableList

/**
 * Rehype plugins for rendering trusted course content.
 * Uses rehype-raw (for HTML in markdown) and rehype-katex (for LaTeX math)
 * without rehype-sanitize/harden since this is our own content.
 */
export const rehypePlugins: PluggableList = [
  rehypeRaw,
  [rehypeKatex, { errorColor: '#ef4444' }],
]
