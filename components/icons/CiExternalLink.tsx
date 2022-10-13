import React, { SVGProps } from 'react'

export function CiExternalLink(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" {...props}><path fill="currentColor" d="M17.001 20h-11a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4v2h-4v11h11v-4h2v4a2 2 0 0 1-2 2Zm-5.3-6.293l-1.41-1.414L16.584 6h-3.583V4h7v7h-2V7.415l-6.3 6.292Z"></path></svg>
  )
}
export default CiExternalLink