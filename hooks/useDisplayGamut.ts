'use client'

import {useSyncExternalStore} from 'react'

import {
  type DisplayGamutTier,
  getDisplayGamutSnapshot,
  subscribeDisplayGamut,
} from '@/lib/neutral-engine/displayGamut'

export function useDisplayGamut(): {tier: DisplayGamutTier} {
  const tier = useSyncExternalStore(
    subscribeDisplayGamut,
    getDisplayGamutSnapshot,
    (): DisplayGamutTier => 'srgb',
  )
  return {tier}
}
