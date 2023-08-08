import { ErrorBoundary } from 'react-error-boundary'
import { Diagnostics } from '~/views/diagnostics'
import { RestoreFromBackup } from '~/views/settings'

export default function RestoreFromBackupRoute() {
  return (
    <ErrorBoundary FallbackComponent={Diagnostics}>
      <RestoreFromBackup />
    </ErrorBoundary>
  )
}
