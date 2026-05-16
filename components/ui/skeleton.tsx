import * as React from 'react'
import {cn} from '@/lib/utils'

const skeletonBase = 'animate-pulse rounded-md bg-muted'

function Skeleton({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      aria-busy="true"
      aria-label="Loading..."
      className={cn(skeletonBase, className)}
      {...props}
    />
  )
}

Skeleton.displayName = 'Skeleton'

export {Skeleton}
