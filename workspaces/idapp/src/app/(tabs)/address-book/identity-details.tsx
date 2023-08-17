import { ErrorBoundary } from 'react-error-boundary'
import { Diagnostics } from '~/views/diagnostics'

import { IdentityDetails } from '~/views/address-book'

export default function Identities() {
  return (
    <ErrorBoundary FallbackComponent={Diagnostics}>
      <IdentityDetails />
    </ErrorBoundary>
  )
}
