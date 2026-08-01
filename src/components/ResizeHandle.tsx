import { PanelResizeHandle } from 'react-resizable-panels'

export default function ResizeHandle({
  className = '',
  id,
}: {
  className?: string
  id?: string
}) {
  return (
    <PanelResizeHandle
      className={`w-2 hover:w-3 transition-all duration-300 ease-in-out bg-white/[0.03] hover:bg-violet-500/30 active:bg-violet-500/60 flex items-center justify-center cursor-col-resize rounded-full mx-1 ${className}`}
      id={id}
    >
      <div className="h-8 w-1 rounded-full bg-white/20 transition-all group-hover:bg-violet-400 group-active:bg-violet-300" />
    </PanelResizeHandle>
  )
}
