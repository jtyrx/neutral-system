/**
 * Persisted OKLCH dock picker UI (native `localStorage`).
 * Survives closing/reopening the expanded picker (`ControlCenter` ⇄ `ControlCenterPanel`).
 */

export type RampPreviewMode = 'follow' | 'light' | 'dark' | 'both'

/** @deprecated Use {@link RampPreviewMode} */
export type DockRampPreviewModePersisted = RampPreviewMode

export type DockPickerTabPersisted =
  | 'roleLadder'
  | 'oklch'
  | 'tune'
  | 'map'
  | 'curve'

const LEGACY_MERGED_TO_ROLE_LADDER = new Set<string>([
  'steps',
  'surface',
  'border',
  'text',
])

export type DockPickerUiPersistedV1 = {
  v: 1
  rampPreviewMode: RampPreviewMode
  activeTab: DockPickerTabPersisted
}

export const DOCK_PICKER_STORAGE_KEY = 'neutral-system:dock-picker-ui:v1' as const

const DEFAULT_V1: DockPickerUiPersistedV1 = {
  v: 1,
  rampPreviewMode: 'follow',
  activeTab: 'roleLadder',
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function coerceMode(v: unknown): RampPreviewMode | null {
  return v === 'follow' || v === 'light' || v === 'dark' || v === 'both' ? v : null
}

function coerceTab(v: unknown): DockPickerTabPersisted | null {
  if (v === 'roleLadder' || v === 'oklch' || v === 'tune' || v === 'map' || v === 'curve') return v
  /* Merged picker tabs → single Role ladder panel */
  if (typeof v === 'string' && LEGACY_MERGED_TO_ROLE_LADDER.has(v)) {
    return 'roleLadder'
  }
  return null
}

export function parseDockPickerUi(raw: string | null): DockPickerUiPersistedV1 | null {
  if (raw == null || raw === '') return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed) || parsed.v !== 1) return null
    const rampPreviewMode = coerceMode(parsed.rampPreviewMode)
    const activeTab = coerceTab(parsed.activeTab)
    if (!rampPreviewMode || !activeTab) return null
    return {v: 1, rampPreviewMode, activeTab}
  } catch {
    return null
  }
}

export function readDockPickerUi(): DockPickerUiPersistedV1 | null {
  if (typeof window === 'undefined') return null
  try {
    return parseDockPickerUi(localStorage.getItem(DOCK_PICKER_STORAGE_KEY))
  } catch {
    return null
  }
}

/** Initial slices for `ControlCenterPanel` `useState` lazy init on the client. */
export function getDockPickerInitialState(): Pick<
  DockPickerUiPersistedV1,
  'rampPreviewMode' | 'activeTab'
> {
  if (typeof window === 'undefined') {
    return {
      rampPreviewMode: DEFAULT_V1.rampPreviewMode,
      activeTab: DEFAULT_V1.activeTab,
    }
  }
  const p = readDockPickerUi()
  return p ?? {rampPreviewMode: DEFAULT_V1.rampPreviewMode, activeTab: DEFAULT_V1.activeTab}
}

export function writeDockPickerUi(payload: DockPickerUiPersistedV1): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(DOCK_PICKER_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Quota / private mode
  }
}
