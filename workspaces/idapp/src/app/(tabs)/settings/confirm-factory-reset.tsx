import { ErrorBoundary } from 'react-error-boundary'
import { Diagnostics } from '~/views/diagnostics'
import { ConfirmFactoryReset } from '~/views/settings'

export default function ConfirmFactoryResetRoute() {
  return (
    <ErrorBoundary FallbackComponent={Diagnostics}>
      <ConfirmFactoryReset />
    </ErrorBoundary>
  )
}
