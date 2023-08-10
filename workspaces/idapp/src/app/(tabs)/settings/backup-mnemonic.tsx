import { ErrorBoundary } from 'react-error-boundary'
import { Diagnostics } from '~/views/diagnostics'
import { BackupMnemonic } from '~/views/settings'

export default function BackupMnemonicRoute() {
  return (
    <ErrorBoundary FallbackComponent={Diagnostics}>
      <BackupMnemonic />
    </ErrorBoundary>
  )
}
