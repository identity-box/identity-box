import { ErrorBoundary } from 'react-error-boundary'
import { Diagnostics } from '~/views/diagnostics'

import { CurrentIdentity } from '~/views/identity/CurrentIdentity'

export default function CurrentIdentityRoute() {
  return (
    <ErrorBoundary FallbackComponent={Diagnostics}>
      <CurrentIdentity />
    </ErrorBoundary>
  )
}
