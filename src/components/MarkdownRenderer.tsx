'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

interface MarkdownRendererProps {
  content: string
  className?: string
  compact?: boolean // For chat messages (smaller text)
}

export default function MarkdownRenderer({ content, className = '', compact = false }: MarkdownRendererProps) {
  const baseTextSize = compact ? 'text-xs' : 'text-sm'
  const headingScale = compact
    ? { h1: 'text-sm', h2: 'text-xs', h3: 'text-xs' }
    : { h1: 'text-xl', h2: 'text-lg', h3: 'text-base' }

  const components: Components = {
    h1: ({ children }) => (
      <h1 className={`${headingScale.h1} font-bold text-white mt-5 mb-2 pb-2 border-b border-white/[0.08]`}>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className={`${headingScale.h2} font-bold text-violet-300 mt-4 mb-2`}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className={`${headingScale.h3} font-semibold text-cyan-300 mt-3 mb-1.5`}>
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className={`${baseTextSize} font-semibold text-white mt-2.5 mb-1`}>
        {children}
      </h4>
    ),
    p: ({ children }) => (
      <p className={`${baseTextSize} text-slate-300 leading-relaxed mb-3 last:mb-0`}>
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className={`${baseTextSize} text-slate-300 space-y-1.5 mb-3 ml-1 list-none`}>
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className={`${baseTextSize} text-slate-300 space-y-1.5 mb-3 ml-1 list-decimal list-inside`}>
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="flex items-start gap-2 leading-relaxed">
        <span className="w-1.5 h-1.5 rounded-full bg-violet-400/70 mt-[7px] shrink-0" />
        <span className="flex-1">{children}</span>
      </li>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-white">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic text-slate-200">{children}</em>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-violet-500/50 pl-4 py-1 my-3 bg-violet-500/[0.04] rounded-r-lg">
        {children}
      </blockquote>
    ),
    code: ({ className: codeClassName, children, ...props }) => {
      const isInline = !codeClassName
      if (isInline) {
        return (
          <code className="px-1.5 py-0.5 rounded-md bg-white/[0.08] text-cyan-300 text-[0.85em] font-mono" {...props}>
            {children}
          </code>
        )
      }
      return (
        <code className={`block bg-black/40 border border-white/[0.06] rounded-xl p-4 my-3 text-[0.85em] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap ${codeClassName || ''}`} {...props}>
          {children}
        </code>
      )
    },
    pre: ({ children }) => (
      <pre className="my-3">{children}</pre>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-3 rounded-xl border border-white/[0.08]">
        <table className="w-full text-xs text-left">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-white/[0.04] text-slate-300 uppercase text-[10px] tracking-wider">
        {children}
      </thead>
    ),
    tbody: ({ children }) => (
      <tbody className="divide-y divide-white/[0.06]">{children}</tbody>
    ),
    tr: ({ children }) => (
      <tr className="hover:bg-white/[0.02] transition-colors">{children}</tr>
    ),
    th: ({ children }) => (
      <th className="px-4 py-2.5 font-semibold text-white">{children}</th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-2.5 text-slate-300">{children}</td>
    ),
    hr: () => (
      <hr className="my-5 border-white/[0.08]" />
    ),
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors">
        {children}
      </a>
    ),
    input: ({ type, checked, ...props }) => {
      if (type === 'checkbox') {
        return (
          <input
            type="checkbox"
            checked={checked}
            readOnly
            className="mr-2 accent-violet-500 mt-0.5"
            {...props}
          />
        )
      }
      return <input type={type} {...props} />
    },
  }

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content || ''}
      </ReactMarkdown>
    </div>
  )
}
