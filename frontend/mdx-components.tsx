import type { MDXComponents } from 'mdx/types'
 
const components: MDXComponents = {
    h1: ({children}) => <h1 className="text-4xl font-bold text-[var(--accent-1)] my-4">{children}</h1>,
}
 
export function useMDXComponents(): MDXComponents {
  return components
}