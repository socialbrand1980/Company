// Studio is only available in development mode
// For production (GitHub Pages), studio is disabled because static export doesn't support it

export const dynamic = 'force-static'

export function generateStaticParams() {
  return [
    { tool: [] },
    { tool: ['structure'] },
  ]
}

export default function StudioPage() {
  // In production, this page will be empty
  // Use Sanity Studio only in development
  if (process.env.NEXT_PUBLIC_BASE_PATH) {
    return null
  }
  
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { StudioWrapper } = require('./StudioWrapper')
  return <StudioWrapper />
}
