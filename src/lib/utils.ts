export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'text-emerald-400'
    case 'transcribing':
      return 'text-amber-400'
    case 'generating':
      return 'text-violet-400'
    case 'error':
      return 'text-red-400'
    default:
      return 'text-slate-400'
  }
}

export function getSourceIcon(sourceType: string): string {
  switch (sourceType) {
    case 'audio':
      return '\uD83C\uDFB5'
    case 'video':
      return '\uD83C\uDFAC'
    case 'recording':
      return '\uD83C\uDF99\uFE0F'
    default:
      return '\uD83D\uDCC4'
  }
}
