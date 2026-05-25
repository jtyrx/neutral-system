export function PairedRolesPanelHeader() {
  return (
    <div className="mb-16">
      <p className="eyebrow">Paired roles</p>
      <p className="mt-4 text-sm text-subtle">
        Default: <span className="font-mono text-default">Data table</span> — one row per{' '}
        <span className="font-mono text-subtle">neutral-*</span> primitive (hex, OKLCH, idx) for
        the current layer filter.{' '}
        <span className="font-mono text-default">Used primitives</span> lists every ramp step
        referenced by the mapping (light + dark).{' '}
        <span className="font-mono text-default">Visual pairs</span> shows side-by-side semantic
        cards. Inspection can switch to the full neutral scale.
      </p>
    </div>
  )
}
PairedRolesPanelHeader.displayName = 'PairedRolesPanelHeader'
