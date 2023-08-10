import { ErrorBoundary } from 'react-error-boundary'
import { Diagnostics } from '~/views/diagnostics'
import { FirstIdentity } from '~/views/identity'

export default function FirstIdentityRoute() {
  return (
    <ErrorBoundary FallbackComponent={Diagnostics}>
      <FirstIdentity />
    </ErrorBoundary>
  )
}
