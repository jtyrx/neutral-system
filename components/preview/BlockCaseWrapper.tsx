'use client'

import {memo, type ComponentType} from 'react'

import type {BlockCaseProps, CaseRenderProps} from '@/components/preview/blockTypes'
import {useResolvedBlockColors} from '@/components/preview/useResolvedBlockColors'

export function BlockCaseWrapper(Inner: ComponentType<CaseRenderProps>) {
  return memo(function Wrapped(props: BlockCaseProps) {
    const c = useResolvedBlockColors(props.global, props.tokenView, props.brandPlaneOklch)
    return <Inner {...props} c={c} />
  })
}
