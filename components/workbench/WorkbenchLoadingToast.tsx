'use client'

import {useEffect} from 'react'
import {toast} from 'sonner'

/** Single id = one toast slot; sonner updates in place (no duplicate spinners). */
export const WORKBENCH_LOADING_TOAST_ID = 'workbench-input-busy'

type Props = {
  /** True while a transition is pending or deferred config has not caught up to latest input. */
  busy: boolean
}

export function WorkbenchLoadingToast({busy}: Props) {
  useEffect(() => {
    if (busy) {
      toast.loading('Updating palette…', {
        id: WORKBENCH_LOADING_TOAST_ID,
        duration: Infinity,
      })
    } else {
      toast.dismiss(WORKBENCH_LOADING_TOAST_ID)
    }
    return () => {
      if (busy) toast.dismiss(WORKBENCH_LOADING_TOAST_ID)
    }
  }, [busy])

  return null
}
