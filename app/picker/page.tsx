import {AppLayoutShell} from '@/components/app-sidebar'
import {OklchPickerWorkbench} from '@/components/picker/OklchPickerWorkbench'

export default function PickerPage() {
  return (
    <AppLayoutShell>
      <OklchPickerWorkbench mode="live" />
    </AppLayoutShell>
  )
}
